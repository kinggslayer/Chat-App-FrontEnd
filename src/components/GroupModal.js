import React from 'react';
import "./css/groupmodal.css";

const GroupModal = ({
  newGroupName,
  setNewGroupName,
  selectedMembers,
  setSelectedMembers,
  userList,
  createGroup,
  setShowGroupModal
}) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Create New Group</h3>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="groupName">Group Name</label>
            <input
              type="text"
              id="groupName"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Select Members</label>
            <div className="member-list">
              {userList.map((user) => (
                <div key={user._id} className="member-item">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers([...selectedMembers, user._id]);
                        } else {
                          setSelectedMembers(
                            selectedMembers.filter((id) => id !== user._id)
                          );
                        }
                      }}
                    />
                    <span className="checkmark"></span>
                    <div className="member-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="member-name">{user.username}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={createGroup}
            disabled={!newGroupName.trim() || selectedMembers.length === 0}
            className="btn-primary"
          >
            Create Group
          </button>
          <button 
            onClick={() => setShowGroupModal(false)} 
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;
