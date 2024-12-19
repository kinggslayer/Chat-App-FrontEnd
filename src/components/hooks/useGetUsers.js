import { useState, useEffect } from "react";

const useUsers = () => {
  const [users, setUsers] = useState([]); // Initialize state for users
  const [error, setError] = useState(null); // State to handle errors
  const [loading, setLoading] = useState(false); // State to manage loading status
  const host = "http://localhost:5000";
  const myuserId= localStorage.getItem("userId");

  // Fetch user data from the API
  const getUsers = async () => {
    setLoading(true); // Start loading
    setError(null); // Reset error state
    try {
      const response = await fetch(`${host}/api/user/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json", // Specify JSON content type
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`); // Handle HTTP errors
      }

      const data = await response.json();
      const filteredUsers = data.filter(user => user._id !== myuserId);
      setUsers(filteredUsers); // Update state with fetched data
    } catch (error) {
      setError(error.message); // Set error state if something goes wrong
    } finally {
      setLoading(false); // End loading
    }
  };

  // Optional: Fetch users on component mount
  useEffect(() => {
    getUsers();
  }, []); // Empty dependency array ensures this runs only once

  return { users, getUsers, loading, error }; // Return state and methods
};

export default useUsers;
