from twisted.cred import portal, checkers, credentials
from twisted.internet import defer
from zope.interface import Interface, implements

# This is a collection of classes used to provide authentication services
# within the twisted framework.

# Copyright (c) 2008 Kendall Whitesell
# Please see the LICENSE file in this package for terms of use


class IConnector(Interface):
    "Attributes: user_name, (group names)"


class Connector(object):
    implements(IConnector)
    def __init__(self, user_name, groups):
        self.user_name = user_name
        self.groups = groups
        #print "Connector", self.user_name, self.groups


class MQRealm(object):
    implements(portal.IRealm)
    
    def __init__(self, parms):
        try:
            self.get_groups = parms.group_config()
        except:
            self.get_groups = lambda name: "NoGroup"
            
    def requestAvatar(self, avatarID, mind, *interfaces):
        assert IConnector in interfaces
        logout = lambda: None
        groups = self.get_groups(avatarID)
        return (IConnector, Connector(avatarID, groups), logout)
    

class MQDefaultParms(object):
    def checker_config(self):
        return {'sec_type':'any'}

    def group_config(self):
        return lambda name: [name]
    
    def get_group_access_rights(self):
        return self.get_group_rights
    
    def get_group_rights(self, groups, queue):
        return set(['c','r','w'])


class MQPortal(object):
    def __init__(self, mqm, filename=None):
        if filename:
            parms = self.process_config_file(filename)
        else:
            parms = MQDefaultParms()
        kw = parms.checker_config()
        checker_types = { 'test': self.create_memory_checker,
                          'file': self.create_file_checker,
                          'pam': self.create_pam_checker,
                          'db': self.create_database_checker,
                          'any': self.accept_all
                          }
        #print "Checker_type", checker_type
        self.p = portal.Portal(MQRealm(parms))
        checker = checker_types.get(kw.get('sec_type',''), self.accept_all)(**kw)
        self.p.registerChecker(checker)
        mqm.set_queue_rights(parms.get_group_access_rights())
        
    def accept_all(self, **kw):
        accept_any = AcceptAllIdChecker()
        return accept_any
            
    def create_memory_checker(self, **kw):
        my_checker = checkers.InMemoryUsernamePasswordDatabaseDontUse()
        for x in xrange(kw.get('id_count', 10)):
            my_checker.addUser("usr%d"%x, "pwd%d"%x)
        return my_checker
    
    def create_file_checker(self, **kw):
        file_db_parms = {}
        for parm in ['delim', 'usernameField', 'passwordField', 'caseSensitive', 'hash', 'cache']:
            if kw.has_key(parm): file_db_parms[parm]=kw[parm]
        #print file_db_parms
        my_checker = checkers.FilePasswordDB(kw['filename'], **file_db_parms)
        return my_checker
    
    def create_pam_checker(self, **kw):
        #TODO: test this
        return checkers.PluggableAuthenticationModulesChecker()

    def create_database_checker(self, **kw):
        #TODO: implement this
        "This is where a database connection would be hooked-up"

    def stomp_login(self, **kw):
        #print "In stomp_login", kw.get("login","None"), kw.get("passcode", "None")
        creds = credentials.UsernamePassword(kw.get("login", ""),
                                             kw.get("passcode", ""))
        d = self.p.login(creds, None, IConnector)
        #print "Stomp_login d = ", d
        return d

    def process_config_file(self, filename):
        if filename:
            try:
                import os, sys
                path, fname = os.path.split(filename)
                sys.path.insert(0, path)
                globals()['security_parameters'] = __import__(fname) 
            except:
                print "Error in import of security data from file:",filename
                return None
        else:
            from morbid.sample_auth import mqanyconf as security_parameters
        return security_parameters.Parms()

class AcceptAllIdChecker(object):
    implements(checkers.ICredentialsChecker)
    credentialInterfaces = (credentials.IUsernamePassword,)
    
    def requestAvatarId(self, credentials):
        #print "AcceptAll requestAvatarId", credentials, credentials.username
        uname = credentials.username
        return defer.succeed(uname)
    
    