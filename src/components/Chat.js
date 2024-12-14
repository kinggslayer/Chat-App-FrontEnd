import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "../chat.css";
import React from "react";
import { Link } from "react-router-dom";
import CustomMessageList from "./MessageList";

const Chat = () => {

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
