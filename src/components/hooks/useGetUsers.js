import { useState, useEffect, useCallback, useRef } from "react";

const useUsers = (host = "http://localhost:5000") => {
  // Core state
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userCache, setUserCache] = useState({});
  
  // Refs
  const lastFetchTime = useRef(null);
  const abortController = useRef(null);

  // Auth data
  const myUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const termLower = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(termLower) ||
      user.email?.toLowerCase().includes(termLower) ||
      user.username?.toLowerCase().includes(termLower)
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Fetch users with caching
  const getUsers = useCallback(async (forceRefresh = false, options = {}) => {
    const { limit, page, sortBy } = options;
    
    // Use cache if possible
    const now = Date.now();
    const cacheDuration = 5 * 60 * 1000; // 5 minutes
    if (
      !forceRefresh && 
      users.length > 0 && 
      lastFetchTime.current && 
      now - lastFetchTime.current < cacheDuration &&
      !limit && !page && !sortBy
    ) {
      return users;
    }
    
    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      // Build URL with query parameters
      let url = `${host}/api/user/`;
      const params = new URLSearchParams();
      
      if (limit) params.append('limit', limit);
      if (page) params.append('page', page);
      if (sortBy) params.append('sortBy', sortBy);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        },
        signal: abortController.current.signal
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const filteredData = data.filter(user => user._id !== myUserId);
      
      // Update cache
      const newCache = { ...userCache };
      filteredData.forEach(user => {
        newCache[user._id] = user;
      });
      setUserCache(newCache);
      
      setUsers(filteredData);
      setFilteredUsers(filteredData);
      lastFetchTime.current = now;
      
      return filteredData;
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.message);
        console.error("Error fetching users:", error);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [host, myUserId, token, userCache, users.length]);

  // Get user by ID with caching
  const getUserById = useCallback(async (userId) => {
    if (!userId) return null;
    
    // Check cache first
    if (userCache[userId]) {
      return userCache[userId];
    }
    
    try {
      const response = await fetch(`${host}/api/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const userData = await response.json();
      
      // Update cache
      setUserCache(prev => ({
        ...prev,
        [userId]: userData
      }));
      
      return userData;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }, [host, token, userCache]);

  // Batch fetch users by IDs
  const getUsersByIds = useCallback(async (userIds) => {
    if (!userIds?.length) return [];
    
    const results = [];
    const idsToFetch = [];
    
    // Check cache first
    userIds.forEach(id => {
      if (userCache[id]) {
        results.push(userCache[id]);
      } else {
        idsToFetch.push(id);
      }
    });
    
    if (idsToFetch.length === 0) {
      return results;
    }
    
    try {
      const response = await fetch(`${host}/api/user/multiple`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        },
        body: JSON.stringify({ userIds: idsToFetch })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const fetchedUsers = await response.json();
      
      // Update cache
      const newCache = { ...userCache };
      fetchedUsers.forEach(user => {
        newCache[user._id] = user;
      });
      setUserCache(newCache);
      
      return [...results, ...fetchedUsers];
    } catch (error) {
      console.error("Error fetching multiple users:", error);
      return results; // Return any cached users
    }
  }, [host, token, userCache]);

  // Search users
  const searchUsers = useCallback(async (query, options = {}) => {
    const { limit = 20, includeStatus = false } = options;
    
    if (!query.trim()) {
      setFilteredUsers(users);
      return users;
    }
    
    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });
      
      if (includeStatus) {
        params.append('includeStatus', 'true');
      }
      
      const response = await fetch(`${host}/api/user/search?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        },
        signal: abortController.current.signal
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const results = await response.json();
      const filtered = results.filter(user => user._id !== myUserId);
      
      // Update cache
      const newCache = { ...userCache };
      filtered.forEach(user => {
        newCache[user._id] = user;
      });
      setUserCache(newCache);
      
      setFilteredUsers(filtered);
      return filtered;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error searching users:", error);
        setError(error.message);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [host, myUserId, token, userCache, users]);

  // Online status management
  const updateOnlineStatus = useCallback((userId, isOnline) => {
    setOnlineUsers(prev => ({
      ...prev,
      [userId]: isOnline
    }));
  }, []);

  const updateMultipleOnlineStatuses = useCallback((statusMap) => {
    setOnlineUsers(prev => ({
      ...prev,
      ...statusMap
    }));
  }, []);

  const isUserOnline = useCallback((userId) => {
    return onlineUsers[userId] === true;
  }, [onlineUsers]);

  // User selection management
  const toggleUserSelection = useCallback((userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  }, []);

  const clearSelectedUsers = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const selectUsers = useCallback((userIds) => {
    setSelectedUsers(userIds);
  }, []);

  // User data helpers
  const getUserDisplayName = useCallback((userId) => {
    const user = userCache[userId] || users.find(u => u._id === userId);
    if (user) {
      return user.name || user.username || user.email?.split('@')[0] || "Unknown User";
    }
    return "Unknown User";
  }, [userCache, users]);

  const getUserAvatar = useCallback((userId, size = "medium") => {
    const user = userCache[userId] || users.find(u => u._id === userId);
    if (user) {
      if (user.avatars?.[size]) {
        return user.avatars[size];
      }
      return user.avatar || null;
    }
    return null;
  }, [userCache, users]);

  // Socket integration
  const setupSocketListeners = useCallback((socket) => {
    if (!socket) return () => {};
    
    const handleUserOnline = (userId) => updateOnlineStatus(userId, true);
    const handleUserOffline = (userId) => updateOnlineStatus(userId, false);
    
    const handleInitialOnlineUsers = (onlineUserIds) => {
      const statusMap = {};
      onlineUserIds.forEach(id => {
        statusMap[id] = true;
      });
      updateMultipleOnlineStatuses(statusMap);
    };
    
    const handleUserUpdated = (userData) => {
      // Update cache
      setUserCache(prev => ({
        ...prev,
        [userData._id]: { ...prev[userData._id], ...userData }
      }));
      
      // Update users list
      setUsers(prev => 
        prev.map(user => 
          user._id === userData._id ? { ...user, ...userData } : user
        )
      );
    };
    
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('initialOnlineUsers', handleInitialOnlineUsers);
    socket.on('userUpdated', handleUserUpdated);
    
    // Request initial online users
    socket.emit('getOnlineUsers');
    
    return () => {
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('initialOnlineUsers', handleInitialOnlineUsers);
      socket.off('userUpdated', handleUserUpdated);
    };
  }, [updateOnlineStatus, updateMultipleOnlineStatuses]);

  // Load initial data
  useEffect(() => {
    if (token) {
      getUsers();
    }
    
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [getUsers, token]);

  return {
    // State
    users,
    filteredUsers,
    loading,
    error,
    searchTerm,
    selectedUsers,
    onlineUsers,
    
    // Setters
    setSearchTerm,
    
    // User data operations
    getUsers,
    getUserById,
    getUsersByIds,
    searchUsers,
    getUserDisplayName,
    getUserAvatar,
    
    // Selection operations
    toggleUserSelection,
    clearSelectedUsers,
    selectUsers,
    
    // Status operations
    isUserOnline,
    
    // Socket integration
    setupSocketListeners
  };
};

export default useUsers;