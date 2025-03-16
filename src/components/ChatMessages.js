import React, { useRef } from "react";

const ChatMessages = ({ 
  messagesContainerRef,
  messagesLoading, 
  currentMessages, 
  activeChatId, 
  isGroupChat, 
  myUserId,
  messagesEndRef
}) => {
  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 bg-gray-900 relative"
    >
      {messagesLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : currentMessages.length === 0 ? (
        <div className="flex justify-center items-center h-full text-gray-400">
          {activeChatId ? 'No messages yet. Start the conversation!' : 'Select a chat to start messaging'}
        </div>
      ) : (
        currentMessages.map((message) => {
          const isCurrentUser = isGroupChat 
            ? message.sender._id === myUserId 
            : message.sender === myUserId;
          
          return (
            <div
              key={message._id || message.createdAt}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  isCurrentUser
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-700 text-white'
                } ${message.pending ? 'opacity-70' : 'opacity-100'}`}
              >
                {/* Show sender name in group chats */}
                {isGroupChat && !isCurrentUser && (
                  <div className="text-xs text-blue-300 mb-1">
                    {message.sender.username || "Unknown User"}
                  </div>
                )}
                
                {/* Message content */}
                <div className="break-words">
                  
                  {message.content && (
                    <div className="text">{message.content}</div>
                  )}
                </div>
                
                {/* Message metadata */}
                <div className="text-[11px] text-gray-300 text-right mt-1 flex justify-end items-center gap-1">
                  <span>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {isCurrentUser && (
                    <span>
                      {message.pending ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      ) : message.read ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : message.deliveredAt ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
