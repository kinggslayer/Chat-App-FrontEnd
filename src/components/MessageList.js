import React, { useState, useEffect } from "react";
import { Conversation, ConversationList, Sidebar as ChatSidebar, Avatar, MessageList, Message } from "@chatscope/chat-ui-kit-react";
import useUsers from "./hooks/useGetUsers";
import MessageInput from "./MessageInput";
import "./box.css";

const CustomMessageList = ({ username, avatar }) => {
  const { users } = useUsers(); // Fetch users using the custom hook
  const [userList, setUserList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);

  const host = "http://localhost:5000";
  const myuserId = localStorage.getItem("userId");

  // Update userList when `users` changes
  useEffect(() => {
    setUserList(users);
  }, [users]);

  // Fetch messages for active chat whenever activeChat or activeChatId changes
  useEffect(() => {
    if (activeChatId) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(
            `${host}/api/messages/${activeChatId}?senderId=${myuserId}`
          ); // Pass senderId as query param

          const data = await response.json();
          if (response.ok) {
            setMessages(data); // Assuming data contains the list of messages
          } else {
            console.error("Error fetching messages:", data.error || data.message);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      fetchMessages();
    }
  }, [activeChatId, myuserId]);


  const handleSendMessage = async (message) => {
    try {
      // Send message to backend
      const response = await fetch(`${host}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: myuserId,
          receiver: activeChatId,
          content: message,
        }),
      });

      const json = await response.json();

      if (response.ok) {
        // On success, update messages state to include the new message
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            content: message,
            sender: myuserId,
            receiver: activeChatId,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        console.error("Error sending message:", json.error || json.message);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <div className="chat-app">
      {/* Sidebar */}
      <ChatSidebar position="left">
        <ConversationList>
          {/* Current User */}
          <Conversation name={username}>
            <Avatar name={username} src={avatar} size="md" />
          </Conversation>

          {/* Render Users from API */}
          {userList.map((user) => (
            <Conversation
              key={user._id}
              name={user.username}
              onClick={() => {
                setActiveChat(user.username);
                setActiveChatId(user._id); // Set the active chat and ID
              }}
            >
              <Avatar name={user.username} src={user.avatar} size="md" />
            </Conversation>
          ))}
        </ConversationList>
      </ChatSidebar>

      {/* Chat Box */}
      <div className="chat-box">
        {/* Header */}
        <div className="chat-header">
          <h3>{activeChat || "Select a user to chat"}</h3>
        </div>

        {/* Messages */}
        <div className="message-list-container">
          <MessageList>
            {messages.map((message) => (
              <Message
              key={message._id} // Use _id for unique key
              model={{
                message: message.content, // Use content as the message text
                sentTime: new Date(message.createdAt).toLocaleString(), // Format the createdAt date to a readable format
                sender: message.sender, // sender ID
                direction: message.sender === myuserId ? "outgoing" : "incoming", // Direction based on whether the sender is the current user
                position: "single", // You can change this depending on how you want the message displayed (e.g., "start" or "end")
              }}
            />
            ))}
          </MessageList>
        </div>
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default CustomMessageList;
