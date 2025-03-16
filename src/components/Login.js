import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const host = "http://localhost:5000";
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/chat-interface");
    }
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

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
        localStorage.setItem("token", json.token);
        localStorage.setItem("userId", json.user._id);
        localStorage.setItem("avatar", json.user.avatar);
        localStorage.setItem("username", json.user.username);
        window.location.reload();
        navigate("/chats");
      } else {
        setErrorMessage(json.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="min-vh-100 bg-gradient-dark d-flex align-items-center justify-content-center px-4 py-12">
      <div className="card max-w-md w-100 shadow-lg rounded-4 p-5 border border-secondary bg-black">
        <div className="text-center">
          <h2 className="display-4 text-gradient text-primary">
            Welcome Back
          </h2>
          <p className="mt-2 text-light">Sign in to continue</p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="mt-4" onSubmit={submit}>
          <div className="mb-3">
            <div className="position-relative">
              <i className="bi bi-envelope position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={onChange}
                className="form-control ps-5"
                placeholder="Email address"
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="position-relative">
              <i className="bi bi-lock position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={onChange}
                className="form-control ps-5"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="position-absolute top-50 end-0 translate-middle-y me-3 btn btn-link text-muted"
              >
                {showPassword ? (
                  <i className="bi bi-eye-slash"></i>
                ) : (
                  <i className="bi bi-eye"></i>
                )}
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <a href="/forgot-password" className="text-blue text-decoration-none">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-outline-primary w-100 mt-3"
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center">
                <i className="bi bi-arrow-clockwise me-2 animate-spin"></i>
                Logging in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-light text-sm">
            Don't have an account?{" "}
            <button
              onClick={handleSignUp}
              className="btn btn-link text-primary"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );

};

export default Login;
