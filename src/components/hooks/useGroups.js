import { useState, useEffect, useCallback, useRef } from 'react';

export const useGroups = (host, myUserId, socket) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [activeGroups, setActiveGroups] = useState([]);
  const [groupTypingStatus, setGroupTypingStatus] = useState({});
  const groupsCache = useRef({});
  
  // Get token from localStorage
  const token = localStorage.getItem("token");
  
  // Filter groups based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGroups(groups);
      return;
    }
    
    const filtered = groups.filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.members.some(member => 
        member.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    setFilteredGroups(filtered);
  }, [searchTerm, groups]);

  // Fetch all groups the user belongs to
  const fetchGroups = useCallback(async (refresh = false) => {
    if (!myUserId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use cached data if available and not refreshing
      if (!refresh && groupsCache.current[myUserId]) {
        setGroups(groupsCache.current[myUserId]);
        setFilteredGroups(groupsCache.current[myUserId]);
        setLoading(false);
        
        // Still fetch in background for updates
        const response = await fetch(`${host}/api/groups/${myUserId}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token
          },
        });
        
        const data = await response.json();
        
        if (response.ok) {
          groupsCache.current[myUserId] = data;
          setGroups(data);
          setFilteredGroups(data);
        }
        
        return;
      }
      
      // Fetch from API
      const response = await fetch(`${host}/api/groups/${myUserId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        groupsCache.current[myUserId] = data;
        setGroups(data);
        setFilteredGroups(data);
      } else {
        throw new Error(data.message || 'Failed to fetch groups');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError(error.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  }, [host, myUserId, token]);

  // Initial fetch
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Create a new group
  const createGroup = useCallback(async () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) {
      return { success: false, error: 'Group name and members are required' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare form data if there's an avatar
      let requestBody;
      let headers = {
        'auth-token': token
      };
      
      const groupData = {
        name: newGroupName,
        members: [...selectedMembers, myUserId],
        createdBy: myUserId,
        description: ''  // Optional description can be added to state
      };
      
      if (groupAvatar) {
        const formData = new FormData();
        formData.append('avatar', groupAvatar);
        formData.append('groupData', JSON.stringify(groupData));
        
        requestBody = formData;
        // No Content-Type header for FormData (browser sets it with boundary)
      } else {
        requestBody = JSON.stringify(groupData);
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(`${host}/api/groups`, {
        method: 'POST',
        headers,
        body: requestBody,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update local state
        setGroups(prevGroups => [...prevGroups, data]);
        setFilteredGroups(prevGroups => [...prevGroups, data]);
        
        // Update cache
        groupsCache.current[myUserId] = [...groups, data];
        
        // Reset form
        setShowGroupModal(false);
        setNewGroupName('');
        setSelectedMembers([]);
        setGroupAvatar(null);
        
        // Notify members via socket
        if (socket) {
          socket.emit('newGroupCreated', {
            groupId: data._id,
            members: data.members,
            createdBy: myUserId
          });
        }
        
        return { success: true, group: data };
      } else {
        throw new Error(data.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setError(error.message || 'Failed to create group');
      return { success: false, error: error.message || 'Failed to create group' };
    } finally {
      setLoading(false);
    }
  }, [newGroupName, selectedMembers, myUserId, token, host, groups, socket, groupAvatar]);

  // Get group details
  const getGroupDetails = useCallback(async (groupId) => {
    if (!groupId) return null;
    
    // Check cache first
    const cachedGroup = groups.find(g => g._id === groupId);
    if (cachedGroup) return cachedGroup;
    
    try {
      const response = await fetch(`${host}/api/groups/details/${groupId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update the group in our list if it exists
        setGroups(prevGroups => {
          const groupExists = prevGroups.some(g => g._id === groupId);
          if (groupExists) {
            return prevGroups.map(g => g._id === groupId ? data : g);
          } else {
            return [...prevGroups, data];
          }
        });
        
        return data;
      } else {
        throw new Error(data.message || 'Failed to get group details');
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      return null;
    }
  }, [groups, host, token]);

  // Update an existing group
  const updateGroup = useCallback(async (updatedGroup, newAvatar = null) => {
    if (!updatedGroup._id) return { success: false, error: 'Invalid group ID' };
    
    setLoading(true);
    setError(null);
    
    try {
      let requestBody;
      let headers = {
        'auth-token': token
      };
      
      if (newAvatar) {
        const formData = new FormData();
        formData.append('avatar', newAvatar);
        formData.append('groupData', JSON.stringify(updatedGroup));
        
        requestBody = formData;
        // No Content-Type header for FormData
      } else {
        requestBody = JSON.stringify(updatedGroup);
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(`${host}/api/groups/${updatedGroup._id}`, {
        method: 'PUT',
        headers,
        body: requestBody,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update state with the updated group
        setGroups(prevGroups =>
          prevGroups.map(group =>
            group._id === updatedGroup._id ? data : group
          )
        );
        
        // Update cache
        groupsCache.current[myUserId] = groups.map(group =>
          group._id === updatedGroup._id ? data : group
        );
        
        // Notify members via socket
        if (socket) {
          socket.emit('groupUpdated', {
            groupId: data._id,
            updatedBy: myUserId
          });
        }
        
        return { success: true, group: data };
      } else {
        throw new Error(data.message || 'Failed to update group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      setError(error.message || 'Failed to update group');
      return { success: false, error: error.message || 'Failed to update group' };
    } finally {
      setLoading(false);
    }
  }, [groups, host, token, myUserId, socket]);

  // Leave a group
  const leaveGroup = useCallback(async (groupId) => {
    if (!groupId) return { success: false, error: 'Invalid group ID' };
    
    try {
      const response = await fetch(`${host}/api/groups/${groupId}/leave`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ userId: myUserId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Remove group from our list
        setGroups(prevGroups => prevGroups.filter(g => g._id !== groupId));
        setFilteredGroups(prevGroups => prevGroups.filter(g => g._id !== groupId));
        
        // Update cache
        groupsCache.current[myUserId] = groups.filter(g => g._id !== groupId);
        
        // Notify members via socket
        if (socket) {
          socket.emit('userLeftGroup', {
            groupId,
            userId: myUserId
          });
        }
        
        return { success: true };
      } else {
        throw new Error(data.message || 'Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      return { success: false, error: error.message || 'Failed to leave group' };
    }
  }, [groups, host, token, myUserId, socket]);

  // Delete a group (admin only)
  const deleteGroup = useCallback(async (groupId) => {
    if (!groupId) return { success: false, error: 'Invalid group ID' };
    
    try {
      const response = await fetch(`${host}/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Remove group from our list
        setGroups(prevGroups => prevGroups.filter(g => g._id !== groupId));
        setFilteredGroups(prevGroups => prevGroups.filter(g => g._id !== groupId));
        
        // Update cache
        groupsCache.current[myUserId] = groups.filter(g => g._id !== groupId);
        
        // Notify members via socket
        if (socket) {
          socket.emit('groupDeleted', {
            groupId,
            deletedBy: myUserId
          });
        }
        
        return { success: true };
      } else {
        throw new Error(data.message || 'Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      return { success: false, error: error.message || 'Failed to delete group' };
    }
  }, [groups, host, token, myUserId, socket]);

  // Add members to a group
  const addGroupMembers = useCallback(async (groupId, newMemberIds) => {
    if (!groupId || !newMemberIds.length) {
      return { success: false, error: 'Invalid group ID or member IDs' };
    }
    
    try {
      const response = await fetch(`${host}/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ members: newMemberIds }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update the group in our list
        setGroups(prevGroups =>
          prevGroups.map(group =>
            group._id === groupId ? data : group
          )
        );
        
        // Update cache
        groupsCache.current[myUserId] = groups.map(group =>
          group._id === groupId ? data : group
        );
        
        // Notify members via socket
        if (socket) {
          socket.emit('membersAddedToGroup', {
            groupId,
            newMembers: newMemberIds,
            addedBy: myUserId
          });
        }
        
        return { success: true, group: data };
      } else {
        throw new Error(data.message || 'Failed to add members');
      }
    } catch (error) {
      console.error('Error adding members to group:', error);
      return { success: false, error: error.message || 'Failed to add members' };
    }
  }, [groups, host, token, myUserId, socket]);

  // Remove a member from a group
  const removeGroupMember = useCallback(async (groupId, memberId) => {
    if (!groupId || !memberId) {
      return { success: false, error: 'Invalid group ID or member ID' };
    }
    
    try {
      const response = await fetch(`${host}/api/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update the group in our list
        setGroups(prevGroups =>
          prevGroups.map(group =>
            group._id === groupId ? data : group
          )
        );
        
        // Update cache
        groupsCache.current[myUserId] = groups.map(group =>
          group._id === groupId ? data : group
        );
        
        // Notify members via socket
        if (socket) {
          socket.emit('memberRemovedFromGroup', {
            groupId,
            removedMember: memberId,
            removedBy: myUserId
          });
        }
        
        return { success: true, group: data };
      } else {
        throw new Error(data.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member from group:', error);
      return { success: false, error: error.message || 'Failed to remove member' };
    }
  }, [groups, host, token, myUserId, socket]);

  // Make a member an admin
  const makeGroupAdmin = useCallback(async (groupId, memberId) => {
    if (!groupId || !memberId) {
      return { success: false, error: 'Invalid group ID or member ID' };
    }
    
    try {
      const response = await fetch(`${host}/api/groups/${groupId}/admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ userId: memberId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update the group in our list
        setGroups(prevGroups =>
          prevGroups.map(group =>
            group._id === groupId ? data : group
          )
        );
        
        // Update cache
        groupsCache.current[myUserId] = groups.map(group =>
          group._id === groupId ? data : group
        );
        
        // Notify members via socket
        if (socket) {
          socket.emit('groupAdminAdded', {
            groupId,
            newAdmin: memberId,
            addedBy: myUserId
          });
        }
        
        return { success: true, group: data };
      } else {
        throw new Error(data.message || 'Failed to make member an admin');
      }
    } catch (error) {
      console.error('Error making member an admin:', error);
      return { success: false, error: error.message || 'Failed to make member an admin' };
    }
  }, [groups, host, token, myUserId, socket]);

  // Remove admin status from a member
  const removeGroupAdmin = useCallback(async (groupId, memberId) => {
    if (!groupId || !memberId) {
      return { success: false, error: 'Invalid group ID or member ID' };
    }
    
    try {
      const response = await fetch(`${host}/api/groups/${groupId}/admin/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update the group in our list
        setGroups(prevGroups =>
          prevGroups.map(group =>
            group._id === groupId ? data : group
          )
        );
        
        // Update cache
        groupsCache.current[myUserId] = groups.map(group =>
          group._id === groupId ? data : group
        );
        
        // Notify members via socket
        if (socket) {
          socket.emit('groupAdminRemoved', {
            groupId,
            removedAdmin: memberId,
            removedBy: myUserId
          });
        }
        
        return { success: true, group: data };
      } else {
        throw new Error(data.message || 'Failed to remove admin status');
      }
    } catch (error) {
      console.error('Error removing admin status:', error);
      return { success: false, error: error.message || 'Failed to remove admin status' };
    }
  }, [groups, host, token, myUserId, socket]);

  // Set active groups (for typing indicators)
  const setActiveGroup = useCallback((groupId, active = true) => {
    setActiveGroups(prev => {
      if (active) {
        if (prev.includes(groupId)) return prev;
        return [...prev, groupId];
      } else {
        return prev.filter(id => id !== groupId);
      }
    });
  }, []);

  // Set typing status in a group
  const setTypingInGroup = useCallback((groupId, isTyping) => {
    if (!socket || !groupId) return;
    
    if (isTyping) {
      socket.emit('typing', { groupId, user: myUserId, isGroup: true });
    } else {
      socket.emit('stopTyping', { groupId, user: myUserId, isGroup: true });
    }
  }, [socket, myUserId]);

  // Mark notifications as read for a group
  const markGroupNotificationsAsRead = useCallback(async (groupId) => {
    if (!groupId) return { success: false, error: 'Invalid group ID' };
    
    try {
      const response = await fetch(`${host}/api/notifications/group/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
      });
      
      if (response.ok) {
        // We don't need to update any state here
        return { success: true };
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to mark notifications as read');
      }
    } catch (error) {
      console.error('Error marking group notifications as read:', error);
      return { success: false, error: error.message || 'Failed to mark notifications as read' };
    }
  }, [host, token]);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;
    
    // Handle new group created
    const handleNewGroup = (data) => {
      if (data.members.includes(myUserId)) {
        // Fetch the new group details
        getGroupDetails(data.groupId).then(group => {
          if (group) {
            setGroups(prev => [...prev, group]);
            setFilteredGroups(prev => [...prev, group]);
          }
        });
      }
    };
    
    // Handle group updated
    const handleGroupUpdated = (data) => {
      // Fetch the updated group details
      getGroupDetails(data.groupId).then(group => {
        if (group) {
          setGroups(prev => 
            prev.map(g => g._id === data.groupId ? group : g)
          );
          setFilteredGroups(prev => 
            prev.map(g => g._id === data.groupId ? group : g)
          );
        }
      });
    };
    
    // Handle group deleted
    const handleGroupDeleted = (data) => {
      setGroups(prev => prev.filter(g => g._id !== data.groupId));
      setFilteredGroups(prev => prev.filter(g => g._id !== data.groupId));
    };
    
    // Handle member added to group
    const handleMemberAdded = (data) => {
      if (data.newMembers.includes(myUserId)) {
        // We were added to a new group, fetch it
        getGroupDetails(data.groupId).then(group => {
          if (group) {
            setGroups(prev => [...prev, group]);
            setFilteredGroups(prev => [...prev, group]);
          }
        });
      } else {
        // Someone else was added to a group we're in
        getGroupDetails(data.groupId).then(group => {
          if (group) {
            setGroups(prev => 
              prev.map(g => g._id === data.groupId ? group : g)
            );
            setFilteredGroups(prev => 
              prev.map(g => g._id === data.groupId ? group : g)
            );
          }
        });
      }
    };
    
    // Handle member removed from group
    const handleMemberRemoved = (data) => {
      if (data.removedMember === myUserId) {
        // We were removed
        setGroups(prev => prev.filter(g => g._id !== data.groupId));
        setFilteredGroups(prev => prev.filter(g => g._id !== data.groupId));
      } else {
        // Someone else was removed
        getGroupDetails(data.groupId).then(group => {
          if (group) {
            setGroups(prev => 
              prev.map(g => g._id === data.groupId ? group : g)
            );
            setFilteredGroups(prev => 
              prev.map(g => g._id === data.groupId ? group : g)
            );
          }
        });
      }
    };
    
    // Handle typing in group
    const handleGroupTyping = (data) => {
      if (data.user !== myUserId && activeGroups.includes(data.groupId)) {
        setGroupTypingStatus(prev => ({
          ...prev,
          [data.groupId]: {
            ...prev[data.groupId],
            [data.user]: true
          }
        }));
      }
    };
    
    // Handle stop typing in group
    const handleGroupStopTyping = (data) => {
      if (data.user !== myUserId) {
        setGroupTypingStatus(prev => {
          const updated = {...prev};
          if (updated[data.groupId]) {
            const groupUpdated = {...updated[data.groupId]};
            delete groupUpdated[data.user];
            updated[data.groupId] = groupUpdated;
            
            // Remove the group entirely if no one is typing
            if (Object.keys(groupUpdated).length === 0) {
              delete updated[data.groupId];
            }
          }
          return updated;
        });
      }
    };
    
    // Register event listeners
    socket.on('newGroupCreated', handleNewGroup);
    socket.on('groupUpdated', handleGroupUpdated);
    socket.on('groupDeleted', handleGroupDeleted);
    socket.on('membersAddedToGroup', handleMemberAdded);
    socket.on('memberRemovedFromGroup', handleMemberRemoved);
    socket.on('groupTyping', handleGroupTyping);
    socket.on('groupStopTyping', handleGroupStopTyping);
    
    // Cleanup
    return () => {
      socket.off('newGroupCreated', handleNewGroup);
      socket.off('groupUpdated', handleGroupUpdated);
      socket.off('groupDeleted', handleGroupDeleted);
      socket.off('membersAddedToGroup', handleMemberAdded);
      socket.off('memberRemovedFromGroup', handleMemberRemoved);
      socket.off('groupTyping', handleGroupTyping);
      socket.off('groupStopTyping', handleGroupStopTyping);
    };
  }, [socket, myUserId, activeGroups, getGroupDetails]);

  // Check if user is admin of a group
  const isGroupAdmin = useCallback((groupId) => {
    const group = groups.find(g => g._id === groupId);
    return group ? group.admins.includes(myUserId) : false;
  }, [groups, myUserId]);

  // Get typing users for a group
  const getGroupTypingUsers = useCallback((groupId) => {
    return groupTypingStatus[groupId] ? Object.keys(groupTypingStatus[groupId]) : [];
  }, [groupTypingStatus]);

  // Reset group creation form
  const resetGroupForm = useCallback(() => {
    setNewGroupName('');
    setSelectedMembers([]);
    setGroupAvatar(null);
    setShowGroupModal(false);
    setEditingGroup(null);
  }, []);

  // Start editing a group
  const startEditingGroup = useCallback((group) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setSelectedMembers(group.members.filter(m => m !== myUserId));
    setShowGroupModal(true);
  }, [myUserId]);
  
  return {
    // State
    groups,
    filteredGroups,
    loading,
    error,
    showGroupModal,
    newGroupName, 
    selectedMembers,
    groupAvatar,
    editingGroup,
    searchTerm,
    
    // State setters
    setShowGroupModal,
    setNewGroupName,
    setSelectedMembers,
    setGroupAvatar,
    setSearchTerm,
    
    // Group CRUD operations
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupDetails,
    
    // Member management
    addGroupMembers,
    removeGroupMember,
    leaveGroup,
    makeGroupAdmin,
    removeGroupAdmin,
    
    // Group status
    isGroupAdmin,
    
    // Active group and typing
    setActiveGroup,
    setTypingInGroup,
    getGroupTypingUsers,
    
    // Notifications
    markGroupNotificationsAsRead,
    
    // Form management
    resetGroupForm,
    startEditingGroup
  };
};
