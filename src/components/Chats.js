import React, { useState, useRef, useEffect, useCallback } from 'react';
import useUsers from './hooks/useGetUsers';
import { useSocket } from './hooks/useSocket';
import { useMessages } from './hooks/useMessages';
import { useGroups } from './hooks/useGroups';
import { useChat } from './hooks/useChat';
import GroupModal from './GroupModal';
import Input from './MessageInput';
import Sidebar from './CustomSidebar';
import '../output.css';
import ChatHeader from './ConversationHeader';
import ChatMessages from './ChatMessages';

const ChatInterface = () => {
  const host = 'http://localhost:5000';
  const myUserId = localStorage.getItem('userId');
  const { users: userList, loading: usersLoading } = useUsers();
  
  const { 
    socket, 
    connected, 
    joinRoom, 
    joinGroup, 
    sendMessage, 
    sendgroupMessage,
    socketError,
    onlineUsers,
    // typingUsers
  } = useSocket(host);
  
  const { 
    activeChat, 
    activeChatId, 
    isGroupChat, 
    setActiveConversation,
    typingUsers
  } = useChat();
  
  const { 
    messages, 
    addMessage, 
    addgroupMessage, 
    groupMessages,
    markAsRead,
    loading: messagesLoading 
  } = useMessages(host, activeChatId, isGroupChat, myUserId);
  
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
    loading: groupsLoading
  } = useGroups(host, myUserId);

  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const sidebarRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Memoize scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, []);

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    if (!messagesLoading) {
      scrollToBottom();
    }
  }, [messages, groupMessages, messagesLoading, scrollToBottom]);

  // Effect to handle socket connection status with improved handling based on Socket.IO docs
  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log('Socket connected');
        setReconnecting(false);
        setConnectionAttempts(0);
        
        // Re-join current room/group after reconnection
        if (activeChatId) {
          if (isGroupChat) {
            joinGroup(activeChatId);
          } else {
            joinRoom(activeChatId);
          }
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setReconnecting(true);
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // the disconnection was initiated by the server, reconnect manually
          socket.connect();
        }
        // else the socket will automatically try to reconnect
        setReconnecting(true);
      });

      socket.io.on('reconnect_attempt', (attempt) => {
        console.log(`Attempting to reconnect: ${attempt}`);
        setConnectionAttempts(attempt);
      });

      socket.io.on('reconnect', (attempt) => {
        console.log(`Reconnected after ${attempt} attempts`);
        setReconnecting(false);
        setConnectionAttempts(0);
      });

      // Improved Socket.IO error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        // Handle specific error types if needed
      });

      return () => {
        socket.off('connect');
        socket.off('connect_error');
        socket.off('disconnect');
        socket.off('error');
        socket.io.off('reconnect_attempt');
        socket.io.off('reconnect');
      };
    }
  }, [socket, activeChatId, isGroupChat, joinRoom, joinGroup]);

  // Mark messages as read when user views them
  useEffect(() => {
    if (activeChatId && !isGroupChat && messages.length > 0) {
      const unreadMessages = messages.filter(
        msg => msg.sender !== myUserId && !msg.read
      );
      
      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages.map(msg => msg._id));
      }
    }
  }, [activeChatId, messages, isGroupChat, myUserId, markAsRead]);

  // Handle typing indicator with improved debouncing
  useEffect(() => {
    if (newMessage.trim() && activeChatId && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { 
        roomId: isGroupChat ? null : activeChatId,
        groupId: isGroupChat ? activeChatId : null,
        userId: myUserId 
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket.emit('stop_typing', { 
          roomId: isGroupChat ? null : activeChatId,
          groupId: isGroupChat ? activeChatId : null,
          userId: myUserId 
        });
      }
    }, 3000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage, activeChatId, isGroupChat, isTyping, myUserId, socket]);

  // Handle sending messages with improved error handling
  const handleSendMessage = async () => {
    if (newMessage.trim() && connected) {
      let messageContent = newMessage.trim();
      
      // Generate unique temp ID for message
      const tempId = Date.now().toString();
      
      // Prepare message object
      if (isGroupChat) {
        const message = {
          _id: tempId, // Temporary ID until server assigns one
          groupId: activeChatId,
          sender: {
            _id: myUserId,
          },
          content: messageContent,
          messageType: 'text',
          createdAt: new Date().toISOString(),
          pending: true // Flag to show pending state
        };
        
        sendgroupMessage(message, (ack) => {
          if (ack && ack.status === 'delivered') {
            console.log('Group message delivered successfully');
            // Update message in UI with server-assigned ID
            if (ack.messageId) {
              // Update message ID in UI (implementation depends on your state management)
              message._id = ack.messageId;
              message.pending = false;
            }
          }
        });
        
        addgroupMessage(message);
      } else {
        const message = {
          _id: tempId,
          sender: myUserId,
          receiver: activeChatId,
          content: messageContent,
          messageType: 'text',
          createdAt: new Date().toISOString(),
          pending: true
        };
        
        sendMessage(message, (ack) => {
          if (ack && ack.status === 'delivered') {
            // Update message in UI with delivered status
            message.status = true;
            message.pending = false;
            if (ack.messageId) {
              message._id = ack.messageId;
            }
            addMessage({...message});
          }
        });
        
        addMessage(message);
      }
      
      // Clear input
      setNewMessage('');
      
      // Clear typing indicator immediately after sending
      setIsTyping(false);
      socket.emit('stop_typing', { 
        roomId: isGroupChat ? null : activeChatId,
        groupId: isGroupChat ? activeChatId : null,
        userId: myUserId 
      });
      
      // Scroll to bottom immediately after sending
      setTimeout(scrollToBottom, 100);
    }
  };

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  // Updated handleItemClick function that matches setActiveConversation signature
  const handleItemClick = useCallback((item) => {
    if (!item) return;
    
    if (item.type === 'group') {
      setActiveConversation(
        item.name, // Chat name (group name)
        item._id,  // Chat ID
        true,      // isGroup flag
        item.members || [] // Group members, default to empty array if undefined
      );
      joinGroup(item._id);
    } else {
      setActiveConversation(
        item.username, // Chat name (user's name)
        item._id,      // Chat ID
        false,         // Not a group
        []             // No members for individual chats
      );
      joinRoom(item._id);
    }
    
    setIsSidebarOpen(false);
  }, [setActiveConversation, joinGroup, joinRoom, setIsSidebarOpen]);

  // Determine which messages to show based on chat type
  const currentMessages = isGroupChat ? groupMessages : messages;
  
  // Display who's typing with enhanced implementation
  const renderTypingIndicator = () => {
    if (!activeChatId || !typingUsers || typingUsers.length === 0) return null;
    
    const typingUserIds = isGroupChat 
      ? typingUsers.filter(u => u.groupId === activeChatId).map(u => u.userId)
      : typingUsers.filter(u => u.roomId === activeChatId).map(u => u.userId);
    
    if (typingUserIds.length === 0) return null;
    
    // Get actual usernames from IDs
    const typingUsernames = typingUserIds.map(id => {
      const user = userList.find(u => u._id === id);
      return user ? user.username : 'Someone';
    });
    
    let typingText = '';
    if (typingUsernames.length === 1) {
      typingText = `${typingUsernames[0]} is typing...`;
    } else if (typingUsernames.length === 2) {
      typingText = `${typingUsernames[0]} and ${typingUsernames[1]} are typing...`;
    } else {
      typingText = 'Several people are typing...';
    }
    
    return (
      <div className="text-gray-400 text-sm italic ml-4 h-5 flex items-center">
        <span className="mr-2">{typingText}</span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="dark relative min-h-screen max-h-screen flex overflow-hidden">
      {/* Connection status indicator */}
      {reconnecting && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-600 text-white p-1 text-center text-sm z-50">
          Reconnecting to server... {connectionAttempts > 0 ? `(Attempt ${connectionAttempts})` : ''}
        </div>
      )}
      
      {socketError && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white p-1 text-center text-sm z-50">
          Connection error: {socketError}
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        sidebarRef={sidebarRef} 
        isSidebarOpen={isSidebarOpen} 
        setShowGroupModal={setShowGroupModal}
        usersLoading={usersLoading}
        groupsLoading={groupsLoading} 
        activeChatId={activeChatId}
        handleItemClick={handleItemClick} 
        userList={userList} 
        groups={groups}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Toggle Sidebar Button on Mobile */}
        <button 
          className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Chat Header */}
        <ChatHeader activeChat={activeChat} isGroupChat={isGroupChat} connected={connected}  onlineUsers={onlineUsers} typingUsers={typingUsers}/>

        {/* Chat Messages */}
        <ChatMessages
          messagesContainerRef={messagesContainerRef}
          messagesLoading={messagesLoading} 
          currentMessages={currentMessages} 
          activeChatId={activeChatId} 
          isGroupChat={isGroupChat} 
          myUserId={myUserId}
          messagesEndRef={messagesEndRef}
        />

        {/* Typing indicator */}
        {renderTypingIndicator()}

        {/* Message Input */}
        <Input
          activeChatId={activeChatId} 
          connected={connected} 
          newMessage={newMessage} 
          setNewMessage={setNewMessage} 
          handleSendMessage={handleSendMessage} 
        />
      </div>

      {/* Group Modal */}
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

export default ChatInterface;
