import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

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
          <div className="d-flex">
            <Link to="/login" className="btn btn-outline-success mx-1">
              Login
            </Link>
            <Link to="/signup" className="btn btn-outline-success mx-1">
              Signup
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
