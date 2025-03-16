import { useState, useCallback, useEffect, useRef } from 'react';

export const useChat = (socket = null) => {
  // Core chat state
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [chatHistory, setChatHistory] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});
  const [typingStatus, setTypingStatus] = useState({});
  const [lastSeen, setLastSeen] = useState({});
  const [activeChatMembers, setActiveChatMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // References
  const typingTimeouts = useRef({});
  const pendingMessages = useRef({});
  const previousActiveChat = useRef(null);
  
  const host = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Stop typing indicator - defined before it's used
  const stopTyping = useCallback((chatId) => {
    if (!chatId || !socket) return;
    
    // Clear any existing timeout
    if (typingTimeouts.current[chatId]) {
      clearTimeout(typingTimeouts.current[chatId]);
      delete typingTimeouts.current[chatId];
    }
    
    // Send stop typing event
    socket.emit(isGroupChat ? 'groupStopTyping' : 'stopTyping', {
      chatId,
      user: userId
    });
  }, [socket, userId, isGroupChat]);

  // Set active conversation with enhanced metadata
  const setActiveConversation = useCallback((chatName, chatId, isGroup = false, members = []) => {
    // Store previous chat before changing
    previousActiveChat.current = activeChatId;
    
    // Update chat state
    setActiveChat(chatName);
    setActiveChatId(chatId);
    setIsGroupChat(isGroup);
    setActiveChatMembers(members);
    
    // Mark messages as read when changing chat
    if (chatId && unreadMessages[chatId]) {
      markChatAsRead(chatId);
    }
    
    // Notify server about chat change for presence tracking
    if (socket && chatId) {
      socket.emit('joinChatRoom', { chatId });
      
      // Leave previous chat room if exists
      if (previousActiveChat.current && previousActiveChat.current !== chatId) {
        socket.emit('leaveChatRoom', { chatId: previousActiveChat.current });
      }
    }
    
    // Update last seen timestamp
    updateLastSeen(chatId);
  }, [activeChatId, unreadMessages, socket]);

  // Load chat history from server
  const loadChatHistory = useCallback(async (chatId, limit = 50, before = null) => {
    if (!chatId || !token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const url = new URL(`${host}/api/messages/${chatId}`);
      if (limit) url.searchParams.append('limit', limit);
      if (before) url.searchParams.append('before', before);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load chat history: ${response.status}`);
      }
      
      const messages = await response.json();
      
      // Update chat history
      setChatHistory(prev => ({
        ...prev,
        [chatId]: before 
          ? [...(prev[chatId] || []), ...messages] // Append older messages
          : messages // Replace with new messages
      }));
      
      return messages;
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError(error.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [host, token]);

  // Send a message with optimistic update and retry logic
  const sendMessage = useCallback(async (chatId, content) => {
    if (!chatId || !content || !token) return null;
    
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    // Create temporary message for optimistic UI update
    const tempMessage = {
      _id: tempId,
      sender: userId,
      content,
      chatId,
      timestamp,
      status: 'sending',
      isTemp: true
    };
    
    // Optimistically add to chat history
    setChatHistory(prev => ({
      ...prev,
      [chatId]: [tempMessage, ...(prev[chatId] || [])]
    }));
    
    // Stop typing indicator
    stopTyping(chatId);
    
    // Track pending message
    pendingMessages.current[tempId] = {
      message: tempMessage,
      retries: 0
    };
    
    try {
      const response = await fetch(`${host}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ content, chatId })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      const sentMessage = await response.json();
      
      // Replace temp message with real one
      setChatHistory(prev => {
        const chatMessages = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: chatMessages.map(msg => 
            msg._id === tempId ? { ...sentMessage, status: 'sent' } : msg
          )
        };
      });
      
      // Remove from pending messages
      delete pendingMessages.current[tempId];
      
      return sentMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mark as failed
      setChatHistory(prev => {
        const chatMessages = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: chatMessages.map(msg => 
            msg._id === tempId ? { ...msg, status: 'failed' } : msg
          )
        };
      });
      
      return null;
    }
  }, [host, token, userId, stopTyping]);

  // Retry sending a failed message
  const retryMessage = useCallback(async (chatId, tempId) => {
    const pendingMsg = pendingMessages.current[tempId];
    if (!pendingMsg) return null;
    
    // Increment retry count
    pendingMsg.retries += 1;
    
    // Update status to retrying
    setChatHistory(prev => {
      const chatMessages = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: chatMessages.map(msg => 
          msg._id === tempId ? { ...msg, status: 'retrying' } : msg
        )
      };
    });
    
    const { message } = pendingMsg;
    const { content } = message;
    
    // Re-send the message
    return sendMessage(chatId, content);
  }, [sendMessage]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId, chatId) => {
    if (!messageId || !chatId || !token) return false;
    
    try {
      const response = await fetch(`${host}/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.status}`);
      }
      
      // Update chat history
      setChatHistory(prev => {
        const chatMessages = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: chatMessages.filter(msg => msg._id !== messageId)
        };
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, [host, token]);

  // Edit a message
  const editMessage = useCallback(async (messageId, chatId, newContent) => {
    if (!messageId || !chatId || !newContent || !token) return false;
    
    try {
      const response = await fetch(`${host}/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ content: newContent })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to edit message: ${response.status}`);
      }
      
      const updatedMessage = await response.json();
      
      // Update chat history
      setChatHistory(prev => {
        const chatMessages = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: chatMessages.map(msg => 
            msg._id === messageId ? { ...updatedMessage, edited: true } : msg
          )
        };
      });
      
      return true;
    } catch (error) {
      console.error('Error editing message:', error);
      return false;
    }
  }, [host, token]);

  // Mark a chat as read
  const markChatAsRead = useCallback(async (chatId) => {
    if (!chatId || !token) return;
    
    try {
      // Optimistically update UI
      setUnreadMessages(prev => ({
        ...prev,
        [chatId]: 0
      }));
      
      // Send to server
      await fetch(`${host}/api/messages/read/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        }
      });
      
      // If this is a socket-based app, notify other clients
      if (socket) {
        socket.emit('markAsRead', { chatId, userId });
      }
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  }, [host, token, userId, socket]);

  // Update last seen timestamp
  const updateLastSeen = useCallback(async (chatId) => {
    if (!chatId || !token) return;
    
    const now = new Date().toISOString();
    
    // Update local state
    setLastSeen(prev => ({
      ...prev,
      [chatId]: now
    }));
    
    try {
      // Send to server
      await fetch(`${host}/api/messages/chats/${chatId}/lastseen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        }
      });
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  }, [host, token]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((chatId) => {
    if (!chatId || !socket) return;
    
    // Clear any existing timeout
    if (typingTimeouts.current[chatId]) {
      clearTimeout(typingTimeouts.current[chatId]);
    }
    
    // Send typing event
    socket.emit(isGroupChat ? 'groupTyping' : 'typing', {
      chatId,
      user: userId
    });
    
    // Set timeout to stop typing indicator after 3 seconds
    typingTimeouts.current[chatId] = setTimeout(() => {
      stopTyping(chatId);
    }, 3000);
  }, [socket, userId, isGroupChat, stopTyping]);

  // Get chat messages
  const getChatMessages = useCallback((chatId) => {
    return chatHistory[chatId] || [];
  }, [chatHistory]);

  // Get unread count for a chat
  const getUnreadCount = useCallback((chatId) => {
    return unreadMessages[chatId] || 0;
  }, [unreadMessages]);

  // Get total unread count across all chats
  const getTotalUnreadCount = useCallback(() => {
    return Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
  }, [unreadMessages]);

  // Get users who are typing in current chat
  const getTypingUsers = useCallback((chatId) => {
    return typingStatus[chatId] || [];
  }, [typingStatus]);

  // Clear chat history from state (not from server)
  const clearChatHistory = useCallback((chatId) => {
    setChatHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[chatId];
      return newHistory;
    });
  }, []);

  // Initialize socket listeners for chat events
  useEffect(() => {
    if (!socket) return () => {};
    
    // New message received
    const handleNewMessage = (message) => {
      // Add to chat history
      setChatHistory(prev => {
        const chatMessages = prev[message.chatId] || [];
        // Avoid duplicates
        if (!chatMessages.some(msg => msg._id === message._id)) {
          return {
            ...prev,
            [message.chatId]: [message, ...chatMessages]
          };
        }
        return prev;
      });
      
      // Update unread count if not in the active chat
      if (activeChatId !== message.chatId) {
        setUnreadMessages(prev => ({
          ...prev,
          [message.chatId]: (prev[message.chatId] || 0) + 1
        }));
      } else {
        // Mark as read immediately if in active chat
        markChatAsRead(message.chatId);
      }
    };
    
    // Message deleted
    const handleMessageDeleted = ({ messageId, chatId }) => {
      setChatHistory(prev => {
        const chatMessages = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: chatMessages.filter(msg => msg._id !== messageId)
        };
      });
    };
    
    // Message edited
    const handleMessageEdited = (updatedMessage) => {
      setChatHistory(prev => {
        const chatMessages = prev[updatedMessage.chatId] || [];
        return {
          ...prev,
          [updatedMessage.chatId]: chatMessages.map(msg => 
            msg._id === updatedMessage._id ? { ...updatedMessage, edited: true } : msg
          )
        };
      });
    };
    
    // Typing indicator
    const handleTyping = ({ chatId, user }) => {
      if (user === userId) return; // Ignore our own typing events
      
      setTypingStatus(prev => {
        const typingUsers = prev[chatId] || [];
        if (!typingUsers.includes(user)) {
          return {
            ...prev,
            [chatId]: [...typingUsers, user]
          };
        }
        return prev;
      });
    };
    
    // Stop typing indicator
    const handleStopTyping = ({ chatId, user }) => {
      setTypingStatus(prev => {
        const typingUsers = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: typingUsers.filter(u => u !== user)
        };
      });
    };
    
    // Mark as read by other user
    const handleMarkAsRead = ({ chatId, userId: readByUserId }) => {
      if (readByUserId === userId) return; // Ignore our own read events
      
      // Update last seen
      setLastSeen(prev => ({
        ...prev,
        [chatId]: new Date().toISOString()
      }));
    };
    
    // Listen for events
    socket.on('newMessage', handleNewMessage);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('markAsRead', handleMarkAsRead);
    socket.on('groupTyping', handleTyping);
    socket.on('groupStopTyping', handleStopTyping);
    
    // Cleanup on unmount
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('messageEdited', handleMessageEdited);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('markAsRead', handleMarkAsRead);
      socket.off('groupTyping', handleTyping);
      socket.off('groupStopTyping', handleStopTyping);
      
      // Clear any typing timeouts
      Object.values(typingTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [socket, userId, activeChatId, markChatAsRead]);

  return {
    // Core chat state
    activeChat,
    activeChatId,
    isGroupChat,
    activeChatMembers,
    
    // Setting active chat
    setActiveConversation,
    
    // Chat history and messages
    chatHistory,
    getChatMessages,
    loadChatHistory,
    clearChatHistory,
    sendMessage,
    deleteMessage,
    editMessage,
    retryMessage,
    
    // Unread message management
    unreadMessages,
    getUnreadCount,
    getTotalUnreadCount,
    markChatAsRead,
    
    // Typing indicators
    sendTypingIndicator,
    stopTyping,
    getTypingUsers,
    
    // Last seen timestamps
    lastSeen,
    updateLastSeen,
    
    // Loading and error states
    isLoading,
    error
  };
};