import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

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
      navigate("/chats");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:bg-black flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 shadow-2xl rounded-3xl p-10 border border-gray-700 dark:border-gray-600">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-400">Sign in to continue</p>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={submit}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute inset-y-0 left-0 pl-3 w-5 h-5 text-gray-500 " />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={onChange}
                className="w-full px-3 py-3 pl-10 rounded-xl bg-gray-700 border border-gray-600 placeholder-gray-400 text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition duration-300"
                placeholder="Email address"
              />
            </div>

            <div className="relative mt-4">
              <Lock className="absolute inset-y-0 left-0 pl-3 w-5 h-5 text-gray-500" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={onChange}
                className="w-full px-3 py-3 pl-10 rounded-xl bg-gray-700 border border-gray-600 placeholder-gray-400 text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition duration-300"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-400 transition duration-300"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <a
              href="/forgot"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition duration-300"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="text-indigo-400 hover:text-indigo-300 transition duration-300 "
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Logging in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <button
              onClick={handleSignUp}
              className="text-indigo-400 hover:text-indigo-300 transition duration-300"
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
