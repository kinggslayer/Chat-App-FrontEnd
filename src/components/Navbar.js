import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import "../output.css";

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');

    if (username && avatar) {
      setUser({ username, avatar });
    }
  }, []);

  const handleLogout = () => {
    // Clear all localStorage data on logout
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    localStorage.removeItem('userId');

    // Reload the page after logout
    window.location.reload();
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/chats', label: 'Chats' }
  ];

  return (
    <nav className="bg-black text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-green-500 hover:text-green-400 transition-colors"
          >
            ChatApp
          </Link>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-green-500 hover:text-green-400 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  text-white hover:text-green-500 transition-colors
                  ${location.pathname === link.path 
                    ? 'text-green-500 font-semibold' 
                    : 'text-gray-300'}
                `}
              >
                {link.label}
              </Link>
            ))}

            {/* User Section */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 hover:bg-gray-800 p-2 rounded-lg transition-colors">
                  <img 
                    src={user.avatar || "https://via.placeholder.com/40"}
                    alt="User avatar" 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-green-500 font-medium">
                    {user.username}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-20 hidden group-hover:block">
                  <div className="py-1">
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link 
                      to="/reset-password" 
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Reset Password
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link 
                  to="/login" 
                  className="px-3 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black rounded transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-3 py-2 bg-green-500 text-black hover:bg-green-400 rounded transition-colors"
                >
                  Signup
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-black">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      block px-3 py-2 rounded-md text-base font-medium
                      ${location.pathname === link.path 
                        ? 'bg-green-500 text-black' 
                        : 'text-gray-300 hover:bg-gray-700'}
                    `}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile User Section */}
                {user ? (
                  <div className="pt-4 pb-3 border-t border-gray-700">
                    <div className="flex items-center px-5">
                      <img 
                        src={user.avatar || "https://via.placeholder.com/40"}
                        alt="User avatar" 
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="ml-3">
                        <div className="text-base font-medium text-white">
                          {user.username}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 px-2 space-y-1">
                      <Link 
                        to="/profile" 
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:bg-gray-700"
                      >
                        Profile
                      </Link>
                      <Link 
                        to="/reset-password" 
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:bg-gray-700"
                      >
                        Reset Password
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 pb-3 space-y-2">
                    <Link 
                      to="/login" 
                      className="block w-full text-center px-3 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black rounded"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      className="block w-full text-center px-3 py-2 bg-green-500 text-black hover:bg-green-400 rounded"
                    >
                      Signup
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;