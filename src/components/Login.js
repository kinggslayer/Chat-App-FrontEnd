import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const host = "http://localhost:5000";
  let navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in (via token in localStorage)
    const token = localStorage.getItem("token");
    if (token) {
      // If token exists, redirect to the chats page
      navigate("/chats");
    }
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); // Clear previous error message

    try {
      const response = await fetch(`${host}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const json = await response.json();

      if (json.success && json.token) {
        localStorage.setItem("token", json.token); // Store JWT token
        localStorage.setItem("userId", json.user._id);
        localStorage.setItem("avatar", json.user.avatar);
        localStorage.setItem("username", json.user.username);

        // Refresh the page to reflect changes
        window.location.reload();

        alert("Successfully Logged In");
        // navigate("/chats"); // Redirect to the chats page after reload
      } else {
        setErrorMessage("Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSignUp = () => {
    navigate("/signup"); // Redirect to the signup page
  };

  return (
    <div className="login-container">
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <form onSubmit={submit}>
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
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Logging in..." : "Submit"}
        </button>
      </form>

      {/* Sign Up Button */}
      <div className="signup-section mt-3">
        <p className="text-muted">Don't have an account?</p>
        <button className="btn btn-secondary" onClick={handleSignUp}>
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;
