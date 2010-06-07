class Parms(object):
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

    This configuration module is intended to be the default.
    It will accept all credentials and provide unrestricted access
    to all queues.
    """
    def checker_config(self):
        return {'sec_type':'any'}

    def group_config(self):
        return lambda name: [name]
    
    def get_group_access_rights(self):
        return self.get_group_rights
    
    def get_group_rights(self, groups, queue):
        return set(['c','r','w'])
