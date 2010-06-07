class Parms(object):
    def checker_config(self):
        return {'sec_type':'test'}

    def group_config(self):
        return lambda name: [name]
    
    def get_group_access_rights(self):
        return self.queue_rights
    
    def queue_rights(self, groups, queue):
    #Simple access rights test.
    #Admin group automatically has all rights - no need to check anything else
    #A group has the access specified by the name of the queue
    #/queue/group1/c/r/w/ - Group 1 has all rights
    #/queue/group2/r/ - Group 2 has read-only access
        r = set()
        for g in groups:
            if g == 'admin':
                r = set(['c','r','w'])
                break
            if g not in queue:
                continue
            for type in ['/c/', '/r/', '/w/']:
                if type in queue:
                    r.add(type[1])
        return r