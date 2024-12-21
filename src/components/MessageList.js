import React,{useEffect} from 'react';
import {
  Conversation,
  ConversationList,
  Sidebar as ChatSidebar,
  MessageList,
  Message,
  Avatar,
  Button,
} from '@chatscope/chat-ui-kit-react';
import useUsers from './hooks/useGetUsers';
import MessageInput from './MessageInput';
import { useSocket } from './hooks/useSocket';
import { useMessages } from './hooks/useMessages';
import { useGroups } from './hooks/useGroups';
import { useChat } from './hooks/useChat';
import './css/box.css';
import GroupModal from './GroupModal';
console.log("Rendering CustomMessageList");

const CustomMessageList = ({ username, avatar }) => {
  const host = 'http://localhost:5000';
  const myUserId = localStorage.getItem('userId');

  const { users: userList } = useUsers();
  const { socket, joinRoom, joinGroup, sendMessage,sendgroupMessage } = useSocket(host);
  const { activeChat, activeChatId, isGroupChat, setActiveConversation } = useChat();
  const { messages, addMessage,addgroupMessage, groupMessages } = useMessages(host, activeChatId, isGroupChat, myUserId);
  const {
    groups,
    showGroupModal,
    newGroupName,
    selectedMembers,
    setShowGroupModal,
    setNewGroupName,
    setSelectedMembers,
    createGroup,
    updateGroup,
  } = useGroups(host, myUserId);

  // Socket message listener
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        if (message.receiver ===myUserId ) {
          addMessage(message);
        }
        if (isGroupChat && message.groupId === activeChatId && message.sender._id!== myUserId){
          addgroupMessage(message);
          console.log("yha")
        }
      });

      socket.on('group_update', updateGroup);
    }
  }, [socket, myUserId, activeChatId]);

  const handleSendMessage = (messageContent) => {
    const message =
    {
      sender: myUserId,
      receiver: activeChatId,
      content: messageContent,
      createdAt: new Date().toISOString(),
    };

    sendMessage(message);
    addMessage(message);
  };
  const handleSendgMessage = (messageContent)=>{
    const message={
      groupId: activeChatId,
      sender: {
        _id: myUserId,
      },
      content: messageContent,
      createdAt: new Date().toISOString(),
    }
    sendgroupMessage(message);
    addgroupMessage(message);
  }

  return (
    <div className="chat-app">
      <ChatSidebar position="left">
        <div className="sidebar-header">
          <Button onClick={() => setShowGroupModal(true)}>Create Group</Button>
        </div>

        <ConversationList>
          <div className="groups-section">
            <h4>Groups</h4>
            {groups.map((group) => (
              <Conversation
                key={group._id}
                name={group.name}
                info={`${group.members.length} members`}
                onClick={() => {
                  setActiveConversation(group.name, group._id, true);
                  joinGroup(group._id);
                }}
              >
                <Avatar name={group.name} src={group.avatar} size="md" />
              </Conversation>
            ))}
          </div>

          <div className="direct-messages-section">
            <h4>Direct Messages</h4>
            {userList.map((user) => (
              <Conversation
                key={user._id}
                name={user.username}
                onClick={() => {
                  setActiveConversation(user.username, user._id, false);
                  joinRoom(user._id);
                }}
              >
                <Avatar name={user.username} src={user.avatar} size="md" />
              </Conversation>
            ))}
          </div>
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
            {
              isGroupChat ? (
                groupMessages.map((message) => (
                  <Message
                    key={`${message.createdAt}`}
                    model={{
                      message: message.content,
                      sentTime: new Date(message.createdAt).toLocaleString(),
                      // sender: message.sender,
                      direction:
                        message.sender._id === myUserId ? "outgoing" : "incoming",
                      position: "single",
                    }}
                  />
                ))
              ) : (
                messages.map((message) => (
                  <Message
                    key={`${message.createdAt}-${message.sender}-${message.content}`} 
                    model={{
                      message: message.content,
                      sentTime: new Date(message.createdAt).toLocaleString(),
                      sender: message.sender,
                      direction:
                        message.sender === myUserId ? "outgoing" : "incoming",
                      position: "single",
                    }}
                  />
                ))
              )
            }
          </MessageList>
        </div>

        {/* Message Input */}
        <MessageInput onSend={isGroupChat? handleSendgMessage:handleSendMessage} />
      </div>


      {showGroupModal && (
        <GroupModal
          newGroupName={newGroupName}
          setNewGroupName={setNewGroupName}
          selectedMembers={selectedMembers}
          setSelectedMembers={setSelectedMembers}
          userList={userList}
          createGroup={createGroup}
          setShowGroupModal={setShowGroupModal}
        />
      )}
    </div>
  );
};

export default CustomMessageList;