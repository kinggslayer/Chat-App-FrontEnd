import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import "./css/signup.css";

const Signup = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    email: "",
    password: "",
    cpassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const host = "http://localhost:5000";
  let navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (credentials.password !== credentials.cpassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setErrorMessage(""); // Clear previous error messages
    try {
      const response = await fetch(`${host}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.username,
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const json = await response.json();

      if (json.success) {
        localStorage.setItem("token", json.authtoken); // Store the JWT token
        alert("Signup successful!");
        navigate("/chats"); // Navigate to the chats page
      } else {
        setErrorMessage(json.error );
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="signup-container">
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <form onSubmit={submit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            User Name
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={credentials.username}
            onChange={onChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={credentials.email}
            onChange={onChange}
            required
          />
          <div id="emailHelp" className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={credentials.password}
            onChange={onChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="cpassword" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            className="form-control"
            id="cpassword"
            name="cpassword"
            value={credentials.cpassword}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default Signup;
