import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const MessageBubble = ({ message, currentUser }) => {
  const isMyMessage = message.sender === currentUser;
  const messageTime = new Date(message.createdAt);
  
  return (
    <div 
      className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} mb-2`}
    >
      <div 
        className={`px-4 py-2 rounded-lg max-w-xs md:max-w-md break-words ${
          isMyMessage 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <p>{message.content}</p>
      </div>
      
      <div className="flex items-center text-xs text-gray-500 mt-1">
        <span>
          {formatDistanceToNow(messageTime, { addSuffix: true })}
        </span>
        
        {isMyMessage && (
          <div className="ml-2 flex items-center">
            {message.deliveredAt && !message.read && (
              <span className="mr-1" title="Delivered">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            )}
            
            {message.read && (
              <span className="text-blue-500" title={`Read ${message.readAt ? formatDistanceToNow(new Date(message.readAt), { addSuffix: true }) : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L7 17L2 12"></path>
                  <path d="M22 10L13 19L11 17"></path>
                </svg>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;