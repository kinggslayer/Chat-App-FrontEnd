import React, { useEffect, useState } from "react";

const CustomConversationHeader = ({ 
  activeChat, 
  isGroupChat, 
  connected,
  onlineUsers,
  typingUsers = [] // Add this prop to receive typing users
}) => {
  const [isUserOnline, setIsUserOnline] = useState(false);
  const [typingText, setTypingText] = useState("");

  // Check online status
  useEffect(() => {
    const userOnline = onlineUsers.some(user => user.username === activeChat);
    setIsUserOnline(userOnline);
  }, [onlineUsers, activeChat]);

  // Generate typing indicator text
  useEffect(() => {
    if (!typingUsers.length) {
      setTypingText("");
      return;
    }

    if (isGroupChat) {
      // For group chats, show who is typing
      const typingNames = typingUsers.map(user => user.username);
      if (typingNames.length === 1) {
        setTypingText(`${typingNames[0]} is typing...`);
      } else if (typingNames.length === 2) {
        setTypingText(`${typingNames[0]} and ${typingNames[1]} are typing...`);
      } else if (typingNames.length > 2) {
        setTypingText(`${typingNames[0]} and ${typingNames.length - 1} others are typing...`);
      }
    } else {
      // For personal chats, show simple "typing..." if the other person is typing
      const isReceiverTyping = typingUsers.some(user => user.username === activeChat);
      setTypingText(isReceiverTyping ? "typing..." : "");
    }
  }, [typingUsers, isGroupChat, activeChat]);

  return (
    <div className="bg-gray-800 dark:bg-gray-900 p-2 text-white shadow-md flex justify-between items-center border-b border-gray-700">
      <div className="flex items-center space-x-3">
        {/* Avatar with online indicator */}
        <div className="relative">
          <div className="w-8 h-8 bg-gray-600 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
            {activeChat ? activeChat.charAt(0).toUpperCase() : "?"}
          </div>
          
          {!isGroupChat && isUserOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800 dark:border-gray-900"></div>
          )}
        </div>
        
        <div>
          <h2 className="text-base font-medium leading-tight">
            {activeChat || "Select a conversation"}
          </h2>
          
          <p className="text-xs text-gray-400 leading-tight h-4">
            {typingText ? (
              <span className="text-green-400 animate-pulse">{typingText}</span>
            ) : isGroupChat ? (
              "Group Chat"
            ) : isUserOnline ? (
              <span className="text-green-400">online</span>
            ) : (
              <span className="text-gray-500">offline</span>
            )}
          </p>
        </div>
      </div>
      
      {/* Connection status indicator */}
      <div className="flex items-center">
        <div className={`w-1.5 h-1.5 rounded-full mr-1 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-xs text-gray-500">
          {connected ? 'connected' : 'disconnected'}
        </span>
      </div>
    </div>
  );
};

export default CustomConversationHeader;
