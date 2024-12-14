import React, { useState, useEffect } from "react";
import { Conversation, ConversationList, Sidebar as ChatSidebar, Avatar } from "@chatscope/chat-ui-kit-react";
import useUsers from "./hooks/useGetUsers";

const CustomSidebar = ({ username, avatar }) => {
  const { users } = useUsers(); // Fetch users using the custom hook
  const [userList, setUserList] = useState([]);

  // Update userList when `users` changes
  useEffect(() => {
    setUserList(users);
  }, [users]);

  return (
    <ChatSidebar position="left">
      <ConversationList>
        {/* Current User */}
        <Conversation name={username}>
          <Avatar name={username} src={avatar} size="md" />
        </Conversation>

        {/* Render Users from API */}
        {userList.map((user, index) => (
          <Conversation key={index} name={user.username}>
            <Avatar name={user.username} src={user.avatar} size="md" />
          </Conversation>
        ))}
      </ConversationList>
    </ChatSidebar>
  );
};

export default CustomSidebar;
