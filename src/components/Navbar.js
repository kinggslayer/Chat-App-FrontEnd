import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null); // User state

  useEffect(() => {
    // Get user data from localStorage
    const username = localStorage.getItem("username");
    const avatar = localStorage.getItem("avatar");

    if (username && avatar) {
      setUser({ username, avatar }); // Set user data from localStorage
    }
  }, []);

  const handleLogout = () => {
    // Clear all localStorage data on logout
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("avatar");
    localStorage.removeItem("userId");

    // Reload the page after logout
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-black shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand text-success fw-bold" to="/">
          ChatApp
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/" ? "active text-success" : ""
                }`}
                to="/"
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/about" ? "active text-success" : ""
                }`}
                to="/about"
              >
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/chats" ? "active text-success" : ""
                }`}
                to="/chats"
              >
                Chats
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-dark dropdown-toggle d-flex align-items-center"
                  type="button"
                  id="profileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={user.avatar || "https://via.placeholder.com/40"} // Fallback avatar
                    alt="Avatar"
                    className="rounded-circle"
                    style={{ width: "40px", height: "40px", marginRight: "10px" }}
                  />
                  <span className="text-success fw-bold">{user.username}</span>
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="profileDropdown"
                >
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/settings">
                      Settings
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-success mx-1">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-outline-success mx-1">
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
