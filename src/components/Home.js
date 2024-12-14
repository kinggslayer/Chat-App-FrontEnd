import React from 'react';
import './home.css'; 
import { Link } from "react-router-dom";
const Home = () => {
  return (
    <div className="home-container">
      <div className="content">
        <h1>Welcome to Our Real-Time Chat App</h1>
        {/* <p>
          Stay connected with friends, family, and colleagues. Experience seamless, real-time communication across devices, with instant messaging, media sharing, and more.
        </p> */}
      </div>
    </div>
  );
};
export default Home;
