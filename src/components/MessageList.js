import React, { useState, useEffect } from "react";
import { Conversation, ConversationList, Sidebar as ChatSidebar, Avatar, MessageList, Message } from "@chatscope/chat-ui-kit-react";
import useUsers from "./hooks/useGetUsers";
import userMessages from "./hooks/useGetMessages";
import MessageInput from "./MessageInput";
import "./box.css";

const CustomMessageList = ({ username, avatar }) => {
  const { users } = useUsers(); // Fetch users using the custom hook
  const [userList, setUserList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  // const {userchat}= userMessages();

  // Update userList when `users` changes
  useEffect(() => {
    setUserList(users);
  }, [users]);
  // useEffect(() => {
  //   setMessages(userchat);
  // }, [userchat]);

  useEffect(() => {
    if (userList.length > 0) {
      setActiveChat(userList[0].username); // Set first user as active chat by default
    }
  }, [userList]);

  const handleSendMessage = (messageText) => {
    // const myId =User.findOne({username});
    const newMessage = {
      sender: username,
      receiver:activeChat,
      content: messageText,
      direction: "outgoing",
    };
    setMessages([...messages, newMessage]);

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
          {userList.map((user, index) => (
            <Conversation
              key={index}
              name={user.username}
              onClick={() => setActiveChat(user.username)} // Set the active chat when clicked
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
          <h3>{activeChat}</h3>
        </div>

        {/* Messages */}
        <div className="message-list-container">
          <MessageList>
            {messages.map((message, index) => (
              <Message
                key={index}
                model={{
                  message: message.text,
                  sentTime: message.sentTime,
                  sender: message.sender,
                  direction: message.direction,
                  position: "single",
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