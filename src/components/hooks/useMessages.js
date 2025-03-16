// import { useState, useEffect } from 'react';

// export const useMessages = (host, activeChatId, isGroupChat, myUserId) => {
//   const [messages, setMessages] = useState([]);
//   const [groupMessages, setGroupMessages] = useState([]);

//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (!activeChatId) return;

//       try {
//         const endpoint = isGroupChat
//           ? `${host}/api/groups/${activeChatId}/messages`
//           : `${host}/api/messages/${activeChatId}?senderId=${myUserId}`;

//         const response = await fetch(endpoint);
//         const data = await response.json();

//         if (response.ok) {
//           isGroupChat? setGroupMessages(data):setMessages(data);
//         }
//       } catch (error) {
//         console.error('Error fetching messages:', error);
//       }
//     };

//     fetchMessages();
//   }, [activeChatId, myUserId, isGroupChat, host]);

// //   const addMessage = (message) => {
// //     setMessages(prevMessages => [...prevMessages, message]);
// //   };
// const addMessage = (message) => {
//     console.log("helllo");
//     setMessages((prevMessages) => {
//       const exists = prevMessages.some(
//         (msg) =>
//           msg.createdAt === message.createdAt &&
//           msg.sender === message.sender &&
//           msg.content === message.content
//       );
//       if (!exists) {
//         return [...prevMessages, message];
//       }
//       console.log("bhak");
//       return prevMessages;
//     });
//   };
//     const addgroupMessage = (message) => {
//     setGroupMessages(prevMessages => [...prevMessages, message]);
//   };


//   return { messages, addMessage ,addgroupMessage,groupMessages};
// };
import { useState, useEffect, useCallback, useRef } from 'react';

export const useMessages = (host, activeChatId, isGroupChat, myUserId, socket) => {
  const [messages, setMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageStatuses, setMessageStatuses] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const typingTimeoutRef = useRef({});

  // Fetch messages for the active chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChatId) return;
      
      setLoading(true);
      
      try {
        const endpoint = isGroupChat
          ? `${host}/api/groups/${activeChatId}/messages`
          : `${host}/api/messages/${activeChatId}?senderId=${myUserId}`;

        const response = await fetch(endpoint);
        const data = await response.json();

        if (response.ok) {
          // Process message status information
          const statusMap = {};
          data.forEach(msg => {
            statusMap[msg._id] = {
              delivered: msg.delivered || false,
              deliveredAt: msg.deliveredAt || null,
              read: msg.read || false,
              readAt: msg.readAt || null,
              readBy: msg.readBy || [],
            };
          });
          
          setMessageStatuses(prev => ({...prev, ...statusMap}));
          
          // Set messages
          if (isGroupChat) {
            setGroupMessages(data);
          } else {
            setMessages(data);
            
            // Mark unread messages as read if we're the receiver
            const unreadMessages = data.filter(
              msg => msg.sender === activeChatId && !msg.read
            );
            
            if (unreadMessages.length > 0) {
              markMessagesAsRead(unreadMessages.map(msg => msg._id), activeChatId);
            }
            
            // Mark all as delivered
            markMessagesAsDelivered(activeChatId);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    // Reset messages when changing chats
    if (isGroupChat) {
      setGroupMessages([]);
    } else {
      setMessages([]);
    }
    
    fetchMessages();
    
    // Reset typing indicator when changing chats
    return () => {
      if (activeChatId) {
        setTypingUsers(prev => {
          const updated = {...prev};
          delete updated[activeChatId];
          return updated;
        });
      }
    };
  }, [activeChatId, myUserId, isGroupChat, host]);

  // Mark messages as delivered
  const markMessagesAsDelivered = useCallback(async (senderId) => {
    try {
      const response = await fetch(`${host}/api/messages/delivered/${senderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId: myUserId }),
      });
      
      if (response.ok && socket) {
        // Notify sender that messages were delivered
        socket.emit('messagesDelivered', { 
          senderId, 
          receiverId: myUserId,
          deliveredAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error marking messages as delivered:', error);
    }
  }, [host, myUserId, socket]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (messageIds, senderId) => {
    if (!messageIds.length) return;
    
    try {
      const response = await fetch(`${host}/api/messages/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messageIds,
          readBy: myUserId 
        }),
      });
      
      if (response.ok) {
        // Update local state
        const now = new Date();
        
        setMessageStatuses(prev => {
          const updated = {...prev};
          messageIds.forEach(id => {
            updated[id] = {
              ...updated[id],
              read: true,
              readAt: now
            };
          });
          return updated;
        });
        
        // Update messages state
        const updateFn = msgs => 
          msgs.map(msg => 
            messageIds.includes(msg._id) 
              ? { ...msg, read: true, readAt: now } 
              : msg
          );
        
        if (isGroupChat) {
          setGroupMessages(updateFn);
        } else {
          setMessages(updateFn);
        }
        
        // Notify sender through socket
        if (socket && senderId) {
          socket.emit('messagesRead', { 
            messageIds, 
            readBy: myUserId,
            readAt: now,
            senderId
          });
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [host, myUserId, socket, isGroupChat]);
  
  // Mark group messages as read
  const markGroupMessagesAsRead = useCallback(async (messageIds, groupId) => {
    if (!messageIds.length) return;
    
    try {
      const response = await fetch(`${host}/api/groups/messages/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messageIds, 
          groupId,
          userId: myUserId 
        }),
      });
      
      if (response.ok) {
        // Update local state
        setMessageStatuses(prev => {
          const updated = {...prev};
          messageIds.forEach(id => {
            const currentReadBy = prev[id]?.readBy || [];
            updated[id] = {
              ...updated[id],
              readBy: [...new Set([...currentReadBy, myUserId])]
            };
          });
          return updated;
        });
        
        // Update group messages state
        setGroupMessages(prevMsgs => 
          prevMsgs.map(msg => {
            if (messageIds.includes(msg._id)) {
              const readBy = Array.isArray(msg.readBy) ? msg.readBy : [];
              return { 
                ...msg, 
                readBy: [...new Set([...readBy, myUserId])] 
              };
            }
            return msg;
          })
        );
        
        // Notify group through socket
        if (socket) {
          socket.emit('groupMessagesRead', { 
            messageIds, 
            groupId,
            userId: myUserId
          });
        }
      }
    } catch (error) {
      console.error('Error marking group messages as read:', error);
    }
  }, [host, myUserId, socket]);

  // Helper function to check for duplicate messages
  const isDuplicateMessage = (prevMessages, newMessage) => {
    return prevMessages.some(
      (msg) =>
        msg._id === newMessage._id ||
        (msg.createdAt === newMessage.createdAt &&
        msg.sender === newMessage.sender &&
        msg.content === newMessage.content)
    );
  };

  // Add a message to the regular chat
  const addMessage = useCallback((message) => {
    setMessages((prevMessages) => {
      if (isDuplicateMessage(prevMessages, message)) {
        return prevMessages;
      }
      
      // Update message status
      setMessageStatuses(prev => ({
        ...prev,
        [message._id]: {
          delivered: message.delivered || false,
          deliveredAt: message.deliveredAt || null,
          read: message.read || false,
          readAt: message.readAt || null
        }
      }));
      
      return [...prevMessages, message];
    });
    
    // If we're the receiver, mark as read immediately
    if (message.sender === activeChatId && !message.read) {
      markMessagesAsRead([message._id], message.sender);
    }
  }, [activeChatId, markMessagesAsRead]);

  // Add a message to the group chat
  const addGroupMessage = useCallback((message) => {
    setGroupMessages((prevMessages) => {
      if (isDuplicateMessage(prevMessages, message)) {
        return prevMessages;
      }
      
      // Update message status
      setMessageStatuses(prev => ({
        ...prev,
        [message._id]: {
          readBy: message.readBy || []
        }
      }));
      
      return [...prevMessages, message];
    });
    
    // If we're not the sender, mark as read immediately
    if (message.sender !== myUserId) {
      markGroupMessagesAsRead([message._id], message.groupId);
    }
  }, [myUserId, markGroupMessagesAsRead]);

  // Send a message
  const sendMessage = useCallback((content) => {
    if (!activeChatId || !content.trim()) return null;
    
    // Generate temp ID for tracking
    const tempId = `temp-${Date.now()}`;
    
    const newMessage = {
      _id: tempId,
      sender: myUserId,
      receiver: activeChatId,
      content,
      createdAt: new Date(),
      sent: true,
      delivered: false,
      read: false
    };
    
    // Add to local state first for immediate display
    addMessage(newMessage);
    
    // Send via socket
    if (socket) {
      if (isGroupChat) {
        socket.emit('sendGroupMessage', {
          ...newMessage,
          groupId: activeChatId,
          readBy: [myUserId]
        });
      } else {
        socket.emit('sendMessage', newMessage);
      }
    }
    
    // Also send via API for persistence
    fetch(`${host}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMessage),
    })
    .then(response => response.json())
    .then(data => {
      // Replace temp message with actual one from server
      if (data._id) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempId ? { ...data, sent: true } : msg
          )
        );
        
        // Update message status
        setMessageStatuses(prev => {
          const updated = {...prev};
          delete updated[tempId];
          updated[data._id] = {
            delivered: data.delivered || false,
            deliveredAt: data.deliveredAt || null,
            read: data.read || false,
            readAt: data.readAt || null
          };
          return updated;
        });
      }
    })
    .catch(error => {
      console.error('Error sending message:', error);
      // Mark message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempId ? { ...msg, error: true } : msg
        )
      );
    });
    
    return tempId;
  }, [activeChatId, myUserId, socket, host, isGroupChat, addMessage]);

  // Handle typing indicators
  const setTypingStatus = useCallback((isTyping) => {
    if (!socket || !activeChatId) return;
    
    if (isTyping) {
      socket.emit('typing', {
        user: myUserId,
        recipient: isGroupChat ? null : activeChatId,
        groupId: isGroupChat ? activeChatId : null
      });
      
      // Clear any existing timeout
      if (typingTimeoutRef.current[activeChatId]) {
        clearTimeout(typingTimeoutRef.current[activeChatId]);
      }
      
      // Set timeout to stop typing
      typingTimeoutRef.current[activeChatId] = setTimeout(() => {
        socket.emit('stopTyping', {
          user: myUserId,
          recipient: isGroupChat ? null : activeChatId,
          groupId: isGroupChat ? activeChatId : null
        });
      }, 3000);
    } else {
      // Manually stop typing
      socket.emit('stopTyping', {
        user: myUserId,
        recipient: isGroupChat ? null : activeChatId,
        groupId: isGroupChat ? activeChatId : null
      });
      
      // Clear timeout
      if (typingTimeoutRef.current[activeChatId]) {
        clearTimeout(typingTimeoutRef.current[activeChatId]);
        typingTimeoutRef.current[activeChatId] = null;
      }
    }
  }, [socket, activeChatId, myUserId, isGroupChat]);

  // Retry sending failed messages
  const retryMessage = useCallback((messageId) => {
    const failedMessage = messages.find(msg => msg._id === messageId && msg.error);
    
    if (failedMessage) {
      // Remove the failed message
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      // Try sending again
      sendMessage(failedMessage.content);
    }
  }, [messages, sendMessage]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId) => {
    try {
      const response = await fetch(`${host}/api/messages/${messageId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from local state
        if (isGroupChat) {
          setGroupMessages(prev => prev.filter(msg => msg._id !== messageId));
        } else {
          setMessages(prev => prev.filter(msg => msg._id !== messageId));
        }
        
        // Remove from status tracking
        setMessageStatuses(prev => {
          const updated = {...prev};
          delete updated[messageId];
          return updated;
        });
        
        // Notify others through socket
        if (socket) {
          socket.emit('messageDeleted', {
            messageId,
            chatId: activeChatId,
            isGroup: isGroupChat
          });
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, [host, socket, activeChatId, isGroupChat]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle new direct messages
    const handleNewMessage = (message) => {
      if (message.sender === activeChatId && !isGroupChat) {
        addMessage(message);
        // Mark as read immediately if in active chat
        markMessagesAsRead([message._id], message.sender);
      } else if (!isGroupChat && message.sender !== activeChatId && message.receiver === myUserId) {
        // Update unread counts for other chats
        setUnreadCounts(prev => ({
          ...prev,
          [message.sender]: (prev[message.sender] || 0) + 1
        }));
      }
    };

    // Handle new group messages
    const handleNewGroupMessage = (message) => {
      if (isGroupChat && message.groupId === activeChatId) {
        addGroupMessage(message);
      } else if (message.groupId && message.groupId !== activeChatId) {
        // Update unread counts for other groups
        setUnreadCounts(prev => ({
          ...prev,
          [`group_${message.groupId}`]: (prev[`group_${message.groupId}`] || 0) + 1
        }));
      }
    };

    // Handle message delivery receipts
    const handleMessageDelivered = ({messageId, deliveredAt}) => {
      setMessageStatuses(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          delivered: true,
          deliveredAt
        }
      }));
    };

    // Handle read receipts
    const handleMessageRead = ({messageId, readAt}) => {
      setMessageStatuses(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          read: true,
          readAt
        }
      }));
    };

    // Handle multiple messages read
    const handleMessagesRead = ({messageIds, readAt}) => {
      setMessageStatuses(prev => {
        const updated = {...prev};
        messageIds.forEach(id => {
          updated[id] = {
            ...updated[id],
            read: true,
            readAt
          };
        });
        return updated;
      });
    };

    // Handle group message read status
    const handleGroupMessagesRead = ({messageIds, userId, groupId}) => {
      setMessageStatuses(prev => {
        const updated = {...prev};
        messageIds.forEach(id => {
          const readBy = prev[id]?.readBy || [];
          updated[id] = {
            ...updated[id],
            readBy: [...new Set([...readBy, userId])]
          };
        });
        return updated;
      });
    };

    // Handle typing indicators
    const handleTyping = ({user, recipient, groupId}) => {
      if ((recipient === myUserId && user === activeChatId) ||
          (groupId === activeChatId && user !== myUserId)) {
        
        setTypingUsers(prev => ({
          ...prev,
          [user]: true
        }));
      }
    };

    // Handle stop typing
    const handleStopTyping = ({user}) => {
      setTypingUsers(prev => {
        const updated = {...prev};
        delete updated[user];
        return updated;
      });
    };

    // Handle message deletion
    const handleMessageDeleted = ({messageId, chatId, isGroup}) => {
      if (chatId === activeChatId) {
        if (isGroup) {
          setGroupMessages(prev => prev.filter(msg => msg._id !== messageId));
        } else {
          setMessages(prev => prev.filter(msg => msg._id !== messageId));
        }
        
        // Remove from status tracking
        setMessageStatuses(prev => {
          const updated = {...prev};
          delete updated[messageId];
          return updated;
        });
      }
    };

    // Register event listeners
    socket.on('newMessage', handleNewMessage);
    socket.on('newGroupMessage', handleNewGroupMessage);
    socket.on('messageDelivered', handleMessageDelivered);
    socket.on('messageRead', handleMessageRead);
    socket.on('messagesRead', handleMessagesRead);
    socket.on('groupMessagesRead', handleGroupMessagesRead);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('messageDeleted', handleMessageDeleted);

    // Cleanup
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('newGroupMessage', handleNewGroupMessage);
      socket.off('messageDelivered', handleMessageDelivered);
      socket.off('messageRead', handleMessageRead);
      socket.off('messagesRead', handleMessagesRead);
      socket.off('groupMessagesRead', handleGroupMessagesRead);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('messageDeleted', handleMessageDeleted);
      
      // Clear any typing timeouts
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [
    socket, activeChatId, isGroupChat, myUserId, 
    addMessage, addGroupMessage, markMessagesAsRead
  ]);

  return {
    messages,
    groupMessages,
    messageStatuses,
    typingUsers,
    unreadCounts,
    loading,
    
    // Message actions
    sendMessage,
    retryMessage,
    deleteMessage,
    
    // Read receipt functions
    markMessagesAsRead,
    markGroupMessagesAsRead,
    
    // Typing indicator
    setTypingStatus,
    
    // Helper getters
    getMessageStatus: useCallback((messageId) => messageStatuses[messageId] || {}, [messageStatuses]),
    isUserTyping: useCallback((userId) => typingUsers[userId] || false, [typingUsers]),
    getUnreadCount: useCallback((chatId) => unreadCounts[chatId] || 0, [unreadCounts])
  };
};
