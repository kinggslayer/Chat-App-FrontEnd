import React from 'react';
import './css/profile.css'; 
import { useNavigate } from 'react-router-dom';
import useUsers from './hooks/useGetUsers';

const Profile = () => {
  const  navigate  = useNavigate();
  const {users}= useUsers();
  const user = users.username.find(localStorage.getItem("username"));
  const handleLogout = () => {
    // Clear all localStorage data on logout
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("avatar");
    localStorage.removeItem("userId");

    // Reload the page after logout
    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1>My Profile</h1>
      </header>
      <main className="profile-main">
        <div className="profile-card">
          <img
            src={user.profilePicture} 
            alt="Profile"
            className="profile-picture"
          />
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <p className="profile-bio">{user.bio}</p>
        </div>
        <div className="profile-actions">
          <button className="update-button">Update Profile</button>
          <button className="logout-button" onClick={handleLogout}>Log Out</button>
        </div>
      </main>
      <footer className="profile-footer">
        <p>© 2024 ChatConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Profile;
