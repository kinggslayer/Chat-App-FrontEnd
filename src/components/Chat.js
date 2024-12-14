import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "../chat.css";
import React, { useState, useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";
import CustomMessageList from "./MessageList";

const Chat = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if the user is logged in by verifying the presence of the token in localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      // If not logged in, redirect to the login page
    //   navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="chat" height="100px">
      {!localStorage.getItem("token") ? (
        <div className="alert alert-info" role="alert">
          Please log in to access the chat.
          <Link to="/login" className="btn btn-link">Login</Link>
        </div>
      ) : (
        <CustomMessageList />
      )}
    </div>
  );
};

export default Chat;
