import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/signup.css";

const AVATAR_OPTIONS = [
  "data:image/jpeg;base64,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",
  ""
  ];

const Signup = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    email: "",
    password: "",
    cpassword: "",
    avatar: null
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const host = "http://localhost:5000";
  let navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (credentials.password !== credentials.cpassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (!credentials.avatar) {
      setErrorMessage("Please select an avatar");
      return;
    }

    setLoading(true);
    setErrorMessage("");
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
          avatar: credentials.avatar
        }),
      });

      const json = await response.json();

      if (json.success) {
        // localStorage.setItem("token", json.authtoken);
        // localStorage.setItem("userId", json.userId);
        alert("Signup successful! please login");
        navigate("/login");
      } else {
        setErrorMessage(json.error);
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

  const handleAvatarSelect = (avatar) => {
    setCredentials(prev => ({ ...prev, avatar }));
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <h2 className="signup-title">Create Your Account</h2>

        {errorMessage && (
          <div className="alert alert-danger mb-4">{errorMessage}</div>
        )}

        <form onSubmit={submit} className="signup-form">
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={credentials.username}
              onChange={onChange}
              required
              placeholder="Choose a unique username"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={credentials.email}
              onChange={onChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={credentials.password}
              onChange={onChange}
              required
              placeholder="Create a strong password"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="cpassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              id="cpassword"
              name="cpassword"
              value={credentials.cpassword}
              onChange={onChange}
              required
              placeholder="Repeat your password"
            />
          </div>

          {/* Avatar Selection */}
          <div className="mb-4">
            <label className="form-label text-gray-200 font-semibold">Choose Your Avatar</label>
            <div className="avatar-selection grid grid-cols-4 gap-3 mt-2">
              {AVATAR_OPTIONS.map((avatar, index) => (
                <div
                  key={index}
                  onClick={() => handleAvatarSelect(avatar)}
                  aria-selected={credentials.avatar === avatar}
                  className={`
                    avatar-option
                    border-2
                    rounded-lg
                    p-1
                    cursor-pointer
                    transition-all
                    relative
                    ${
                      credentials.avatar === avatar
                        ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-100'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-gray-700'
                    }
                  `}
                >
                  <img
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    className="w-12 h-12 object-cover rounded-full mx-auto"
                  />
                  {/* Checkmark for Selected Avatar */}
                  {credentials.avatar === avatar && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white rounded-full p-1 text-xs">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>



          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-3 text-center">
          <p>
            Already have an account? 
            <a href="/login" className="text-blue-500 ml-2">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;