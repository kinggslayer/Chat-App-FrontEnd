import React, { useState, useEffect } from "react";
import {
  Conversation,
  ConversationList,
  Sidebar as ChatSidebar,
  Avatar,
  MessageList,
  Message,
} from "@chatscope/chat-ui-kit-react";
import useUsers from "./hooks/useGetUsers";
import MessageInput from "./MessageInput";
import io from "socket.io-client";
import "./css/box.css";

const CustomMessageList = ({ username, avatar }) => {
  const { users } = useUsers(); // Fetch users using the custom hook
  const [userList, setUserList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [socket, setSocket] = useState(null);

  const host = "http://localhost:5000";
  const myuserId = localStorage.getItem("userId");

  // Update userList when `users` changes
  useEffect(() => {
    setUserList(users);
  }, [users]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socketIo = io(host);
    setSocket(socketIo);

    // Clean up on component unmount
    return () => {
      if (socketIo) socketIo.disconnect();
    };
  }, []);

  // Listen for incoming messages
  useEffect(() => {
    if (socket) {
      socket.on("receive_message", (message) => {
        if (message.receiver === myuserId || message.sender === myuserId) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });
    }
  }, [socket, myuserId]);

  // Fetch messages for active chat
  useEffect(() => {
    if (activeChatId) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(
            `${host}/api/messages/${activeChatId}?senderId=${myuserId}`
          );

          const data = await response.json();
          if (response.ok) {
            setMessages(data);
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

  // Handle sending messages
  const handleSendMessage = (messageContent) => {
    if (socket && activeChatId) {
      const message = {
        sender: myuserId,
        receiver: activeChatId,
        content: messageContent,
        createdAt: new Date().toISOString(),
      };

      // Emit message via socket
      socket.emit("send_message", message);

      // Optimistically update the UI with the new message
      setMessages((prevMessages) => [...prevMessages, message]);
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
                setActiveChatId(user._id);

                // Join the room for the active chat
                if (socket) {
                  socket.emit("join_room", user._id);
                }
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
                key={message.createdAt} // Use createdAt for unique key
                model={{
                  message: message.content,
                  sentTime: new Date(message.createdAt).toLocaleString(),
                  sender: message.sender,
                  direction:
                    message.sender === myuserId ? "outgoing" : "incoming",
                  position: "single",
                }}
              />
            ))}
          </MessageList>
        </div>

        {/* Message Input */}
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default CustomMessageList;
