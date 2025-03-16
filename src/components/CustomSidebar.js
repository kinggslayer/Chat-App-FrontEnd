import React, { useState, useEffect, useRef } from "react";
import useUsers from "./hooks/useGetUsers";
import './css/sidebar.css';

const CustomSidebar = ({ 
  sidebarRef,
  isSidebarOpen,
  setShowGroupModal,
  usersLoading,
  groupsLoading,
  activeChatId,
  handleItemClick,
  groups,
  userList
}) => {
  // Create ref for the scrollable container
  const scrollContainerRef = useRef(null);

  // Process list items
  const combinedList = [
    ...groups.map(group => ({
      ...group,
      type: 'group',
      displayName: group.name,
      subtitle: `${group.members.length} members`,
      lastMessage: group.lastMessage
    })),
    ...userList.map(user => ({
      ...user,
      type: 'user',
      displayName: user.username,
      subtitle: user.online ? 'Online' : 'Offline',
      lastMessage: user.lastMessage,
      online: user.online
    }))
  ].sort((a, b) => {
    // Sort by online status for users
    if (a.type === 'user' && b.type === 'user') {
      if (a.online && !b.online) return -1;
      if (!a.online && b.online) return 1;
    }
    
    // Then by unread messages
    if ((a.unreadCount || 0) > 0 && (b.unreadCount || 0) === 0) return -1;
    if ((a.unreadCount || 0) === 0 && (b.unreadCount || 0) > 0) return 1;
    
    // Then by last message time
    const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(0);
    const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(0);
    return bTime - aTime; // Most recent first
  });

  // Organize users and groups into sections
  const onlineUsers = combinedList.filter(item => item.type === 'user' && item.online);
  const offlineUsers = combinedList.filter(item => item.type === 'user' && !item.online);
  const allGroups = combinedList.filter(item => item.type === 'group');

  return (
    <div 
      ref={sidebarRef}
      className={`
        fixed inset-y-0 left-0 w-64 bg-gray-800 z-40 transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}
    >
      {/* Fixed header section */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <button 
          onClick={() => setShowGroupModal(true)}
          className="w-full bg-blue-800 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
        >
          Create Group
        </button>
      </div>
      
      {/* Scrollable content area */}
      <div 
        ref={scrollContainerRef}
        className="flex-grow overflow-y-auto custom-scrollbar"
      >
        {(usersLoading || groupsLoading) ? (
          <div className="text-center text-gray-400 p-4">Loading...</div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Groups Section */}
            {allGroups.length > 0 && (
              <div>
                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2 sticky top-0 bg-gray-800 py-1">
                  Groups
                </h3>
                <div className="space-y-2">
                  {allGroups.map(item => renderListItem(item, activeChatId, handleItemClick))}
                </div>
              </div>
            )}
            
            {/* Online Users Section */}
            {onlineUsers.length > 0 && (
              <div>
                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2 sticky top-0 bg-gray-800 py-1">
                  Online Users
                </h3>
                <div className="space-y-2">
                  {onlineUsers.map(item => renderListItem(item, activeChatId, handleItemClick))}
                </div>
              </div>
            )}
            
            {/* Offline Users Section */}
            {offlineUsers.length > 0 && (
              <div>
                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2 sticky top-0 bg-gray-800 py-1">
                  Offline Users
                </h3>
                <div className="space-y-2">
                  {offlineUsers.map(item => renderListItem(item, activeChatId, handleItemClick))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function for rendering list items
const renderListItem = (item, activeChatId, handleItemClick) => (
  <div
    key={item._id}
    onClick={() => handleItemClick(item)}
    className={`
      flex items-center justify-between p-2 rounded-md
      ${activeChatId === item._id ? 'bg-blue-600' : 'bg-gray-700'}
      hover:bg-blue-500 cursor-pointer transition-colors
    `}
  >
    <div className="flex items-center flex-1 min-w-0">
      {/* Online status indicator for users */}
      {item.type === 'user' && (
        <div className={`w-2 h-2 rounded-full mr-2 ${item.online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
      )}
      
      {/* Group icon for groups */}
      {item.type === 'group' && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium truncate">{item.displayName}</div>
        {item.subtitle && (
          <div className="text-gray-300 text-xs truncate">{item.subtitle}</div>
        )}
        {item.lastMessage && (
          <div className="text-gray-400 text-xs truncate">
            {item.lastMessage.content}
          </div>
        )}
      </div>
    </div>
    
    {/* Unread message badge */}
    {item.unreadCount > 0 && (
      <div className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
        {item.unreadCount > 99 ? '99+' : item.unreadCount}
      </div>
    )}
  </div>
);

export default CustomSidebar;
