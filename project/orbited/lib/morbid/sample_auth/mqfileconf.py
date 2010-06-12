"""
A configuration module must contain a definition of a Parm class.

The function checker_config takes no args, and returns a dictionary
with the information needed to assign a credentials checker.

The 'sec_type' member defines the type of security checker to use

The function group_config takes no args, and returns a function
that takes one arg (the username) and returns the list of groups
to which the user belongs.

This sample file uses ID, password and group information from a text
file.

The function get_group_access_rights takes no args, and returns a
function that takes two args (group name, queue name).

This second function returns the access levels that the group has
to that queue ('r', 'w', 'c')
r - read
w - write
c - create
"""
class Parms(object):
    def checker_config(self):
        return {
            'sec_type':'file',
            'filename':'userIdFile.txt',
            'cache':True
            }
    
    def read_id_file(self, name):
        userFile = open('userIdFile.txt','r')
        # A user is always a member of a group matching their name
        group = [name]
        for line in userFile:
            fields = line.split(":")
            if (name == fields[0]):
                group.append(fields[2])
        userFile.close()
        return group
        
    def group_config(self):
        return  self.read_id_file

    def group_rights(self, groups, queue):
        # The most permissive set of group permissions are assigned.
        # (Rights are additive across levels and groups)
        # Therefore, it is not possible to restrict rights based
        # on lower levels of the queue named hierarchy
        rights = set()
        for qname in self.queues:
            if queue.startswith(qname):
                for gname in groups:
                    if gname in self.queues[qname]:
                        for rname in self.queues[qname][gname]:
                            rights.add(rname)
        #Special case - grant all rights to a groups' home queue
        for gname in groups:
            if queue.startswith('/home/'+gname):
                rights = set(('c', 'r', 'w'))
                break
        #Another special case - grant access to their private home listening queue
        if queue.startswith('/queue/read/'+groups[0]):
            rights = set('r')
            
        return rights

    def get_group_access_rights(self):
        self.queues = {
                  '/topic/text': {'user': ('r', 'w'),
                                  'admin': ('c', 'r', 'w')},
                  '/topic/home': {'user': ('c', 'r', 'w'),
                                  'admin': ('c', 'r', 'w')},
                  '/topic/admin': {'admin':('c', 'r', 'w')},
                  '/queue/read': {'admin':('c', 'w'),
                                  'site':('c', 'w')},
                  '/command': {'site': ('c', 'w'),
                               'admin':('r', 'w')}
                }
        return self.group_rights
