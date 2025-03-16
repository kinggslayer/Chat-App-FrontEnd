import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (host) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [socketError, setSocketError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  useEffect(() => {
    // Cleanup any existing socket first
    if (socket) {
      socket.disconnect();
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in localStorage');
      setSocketError('User authentication failed: missing userId');
      return;
    }

    // Socket.IO connection options with exponential backoff
    const newSocket = io(host, {
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      transports: ['websocket', 'polling'], // Try WebSocket first
      auth: { userId } // Add userId to auth for backend identification
    });
    
    setSocket(newSocket);
    
    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [host]);
  
  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    const onConnect = () => {
      console.log('Socket connected successfully');
      setConnected(true);
      setSocketError(null);
      reconnectAttempts.current = 0;
      
      // Update user activity periodically
      const activityInterval = setInterval(() => {
        socket.emit("user_activity");
      }, 60000); // Every minute
      
      return () => clearInterval(activityInterval);
    };
    
    const onDisconnect = (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      setConnected(false);
      
      if (reason === 'io server disconnect') {
        // Reconnect manually if server initiated the disconnect
        socket.connect();
      }
    };
    
    const onConnectError = (error) => {
      console.error('Connection error:', error.message);
      setSocketError(error.message);
      setConnected(false);
      
      // Track failed reconnection attempts
      reconnectAttempts.current += 1;
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        // Could trigger a user notification here
      }
    };
    
    const onUsersOnline = (users) => {
      console.log('Online users updated:', users);
      setOnlineUsers(users);
    };
    
    const onTypingStart = ({ userId, roomId, groupId, timestamp }) => {
      setTypingUsers(prev => [
        ...prev.filter(user => user.userId !== userId || 
          (user.roomId !== roomId && user.groupId !== groupId)),
        { userId, roomId, groupId, timestamp }
      ]);
    };
    
    const onTypingStop = ({ userId, roomId, groupId }) => {
      setTypingUsers(prev => 
        prev.filter(user => user.userId !== userId || 
          (user.roomId !== roomId && user.groupId !== groupId))
      );
    };
    
    const onError = (error) => {
      console.error('Socket error:', error.message);
      setSocketError(error.message);
    };
    
    // Set up listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('users_online', onUsersOnline);
    socket.on('typing', onTypingStart);
    socket.on('stop_typing', onTypingStop);
    socket.on('user_status_change', ({ userId, status }) => {
      setOnlineUsers(prev => 
        prev.map(user => user.userId === userId ? {...user, status} : user)
      );
    });
    socket.on('error', onError);
    
    // Cleanup listeners on unmount or socket change
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('users_online', onUsersOnline);
      socket.off('typing', onTypingStart);
      socket.off('stop_typing', onTypingStop);
      socket.off('user_status_change');
      socket.off('error', onError);
    };
  }, [socket]);
  
  // Join a specific chat room with a recipient
  const joinRoom = useCallback((roomId) => {
    if (!socket || !connected) {
      console.warn('Cannot join room: Socket not connected');
      return false;
    }
    
    socket.emit('join_room', roomId);
    console.log(`Requested to join room: ${roomId}`);
    return true;
  }, [socket, connected]);
  
  // Join a group chat
  const joinGroup = useCallback((groupId) => {
    if (!socket || !connected) {
      console.warn('Cannot join group: Socket not connected');
      return false;
    }
    
    socket.emit('join_group', groupId);
    console.log(`Requested to join group: ${groupId}`);
    return true;
  }, [socket, connected]);
  
  // Send a direct message
  const sendMessage = useCallback((messageData, callback = () => {}) => {
    if (!socket || !connected) {
      console.warn('Cannot send message: Socket not connected');
      callback({ status: 'error', error: 'Socket not connected' });
      return false;
    }
    
    socket.emit('send_message', messageData, callback);
    return true;
  }, [socket, connected]);
  
  // Send a group message
  const sendGroupMessage = useCallback((messageData, callback = () => {}) => {
    if (!socket || !connected) {
      console.warn('Cannot send group message: Socket not connected');
      callback({ status: 'error', error: 'Socket not connected' });
      return false;
    }
    
    socket.emit('send_group_message', messageData, callback);
    return true;
  }, [socket, connected]);
  
  // Create a new group
  const createGroup = useCallback((groupData, callback = () => {}) => {
    if (!socket || !connected) {
      console.warn('Cannot create group: Socket not connected');
      callback({ status: 'error', error: 'Socket not connected' });
      return false;
    }
    
    socket.emit('create_group', groupData, callback);
    return true;
  }, [socket, connected]);
  
  // Leave a group
  const leaveGroup = useCallback((groupId, callback = () => {}) => {
    if (!socket || !connected) {
      console.warn('Cannot leave group: Socket not connected');
      callback({ status: 'error', error: 'Socket not connected' });
      return false;
    }
    
    socket.emit('leave_group', { groupId }, callback);
    return true;
  }, [socket, connected]);
  
  // Add a member to a group
  const addGroupMember = useCallback((groupId, userId, callback = () => {}) => {
    if (!socket || !connected) {
      console.warn('Cannot add member: Socket not connected');
      callback({ status: 'error', error: 'Socket not connected' });
      return false;
    }
    
    socket.emit('add_group_member', { groupId, userId }, callback);
    return true;
  }, [socket, connected]);
  
  // Remove a member from a group
  const removeGroupMember = useCallback((groupId, userId, callback = () => {}) => {
    if (!socket || !connected) {
      console.warn('Cannot remove member: Socket not connected');
      callback({ status: 'error', error: 'Socket not connected' });
      return false;
    }
    
    socket.emit('remove_group_member', { groupId, userId }, callback);
    return true;
  }, [socket, connected]);
  
  // Set typing status
  const setTypingStatus = useCallback((data) => {
    if (!socket || !connected) return false;
    
    if (data.isTyping) {
      socket.emit('typing', data);
    } else {
      socket.emit('stop_typing', data);
    }
    return true;
  }, [socket, connected]);
  
  // Mark message as read
  const markAsRead = useCallback((messageId, senderId) => {
    if (!socket || !connected) return false;
    socket.emit('mark_as_read', { messageId, senderId });
    return true;
  }, [socket, connected]);
  
  // Mark all conversation messages as read
  const markConversationRead = useCallback((senderId, receiverId) => {
    if (!socket || !connected) return false;
    socket.emit('mark_conversation_read', { senderId, receiverId });
    return true;
  }, [socket, connected]);
  
  // Set user status (online, away, busy)
  const setUserStatus = useCallback((status) => {
    if (!socket || !connected) return false;
    socket.emit('set_status', { status });
    return true;
  }, [socket, connected]);
  
  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (socket) {
      socket.connect();
    }
  }, [socket]);
  
  return {
    socket,
    connected,
    socketError,
    onlineUsers,
    typingUsers,
    joinRoom,
    joinGroup,
    sendMessage,
    sendGroupMessage,
    createGroup,
    leaveGroup,
    addGroupMember,
    removeGroupMember,
    setTypingStatus,
    markAsRead,
    markConversationRead,
    setUserStatus,
    reconnect
  };
};
