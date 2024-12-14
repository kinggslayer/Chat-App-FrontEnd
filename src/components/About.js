import React from "react";
import "./about.css"; // Import CSS for styling

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About Us</h1>
        <p>
          Welcome to our Real-Time Chat App! Our mission is to connect people seamlessly through instant messaging, media sharing, and more.
        </p>
        <h2>Contact Details</h2>
        <ul className="contact-list">
          <li><strong>Email:</strong> sandeep.panwar0409@gmail.com</li>
          <li><strong>Phone:</strong> +91 9896138194 </li>
          <li><strong>Address:</strong> 123 Chat Lane, Messaging City, ConnectWorld</li>
        </ul>
        <p>
          Feel free to reach out to us with any questions, feedback, or support requests. We're here to help!
        </p>
      </div>
    </div>
  );
};

export default About;
