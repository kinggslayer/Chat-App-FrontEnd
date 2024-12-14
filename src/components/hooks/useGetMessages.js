import { useState, useEffect } from "react";

const useMessages = () => {
  const [userMessages, setUserMessages] = useState([]); // Initialize state for users
  const [error, setError] = useState(null); // State to handle errors
  const [loading, setLoading] = useState(false); // State to manage loading status
  const host = "http://localhost:5000";

  // Fetch user data from the API
  const getMessages = async () => {
    setLoading(true); // Start loading
    setError(null); // Reset error state
    try {
      const response = await fetch(`${host}/api/message/:userId`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json", // Specify JSON content type
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`); // Handle HTTP errors
      }

      const data = await response.json();
      setUserMessages(data); // Update state with fetched data
      console.log("ok");
    } catch (error) {
      setError(error.message); // Set error state if something goes wrong
    } finally {
      setLoading(false); // End loading
    }
  };

  // Optional: Fetch users on component mount
  useEffect(() => {
    getMessages();
  }, []); // Empty dependency array ensures this runs only once

  return { userMessages, getMessages, loading, error }; // Return state and methods
};

export default useMessages;
