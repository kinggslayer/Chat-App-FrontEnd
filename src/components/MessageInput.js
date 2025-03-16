import React from "react";

const MessageInput = ({ 
  activeChatId, 
  connected, 
  newMessage, 
  setNewMessage, 
  handleSendMessage
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Input area */}
      <div className="flex items-center space-x-2 p-4 bg-gray-800 border-t border-gray-700">
        {/* Message input */}
        <div className="flex-grow">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={!connected ? "Connecting..." : !activeChatId ? "Select a chat to start messaging" : "Type a message..."}
            className="w-full bg-gray-700 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!activeChatId || !connected}
          />
        </div>
        
        {/* Send button */}
        <button 
          onClick={handleSendMessage}
          className="flex-none p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!activeChatId || !newMessage.trim() || !connected}
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
