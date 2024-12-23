import React, { useState } from "react";
import "./css/messageinput.css";

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message); // Call the onSend function with the message
      setMessage("");
    }
  };


  return (
    <div className="message-input">
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {if (e.key === "Enter") { handleSend();}}}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default MessageInput;
