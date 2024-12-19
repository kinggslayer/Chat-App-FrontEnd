import { useState, useEffect } from 'react';

export const useGroups = (host, myUserId) => {
  const [groups, setGroups] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const token=localStorage.getItem("token");
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`${host}/api/groups/${myUserId}`,{
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'auth-token':token
              },
        });
        const data = await response.json();
        if (response.ok) {
          setGroups(data);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, [host, myUserId]);

  const createGroup = async () => {
    if (newGroupName.trim() && selectedMembers.length > 0) {
      try {
        const response = await fetch(`${host}/api/groups`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token':token
          },
          body: JSON.stringify({
            name: newGroupName,
            members: [...selectedMembers, myUserId],
            createdBy: myUserId,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setGroups(prevGroups => [...prevGroups, data]);
          setShowGroupModal(false);
          setNewGroupName('');
          setSelectedMembers([]);
        }
      } catch (error) {
        console.error('Error creating group:', error);
      }
    }
  };

  const updateGroup = (updatedGroup) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group._id === updatedGroup._id ? updatedGroup : group
      )
    );
  };

  return {
    groups,
    showGroupModal,
    newGroupName,
    selectedMembers,
    setShowGroupModal,
    setNewGroupName,
    setSelectedMembers,
    createGroup,
    updateGroup,
  };
};