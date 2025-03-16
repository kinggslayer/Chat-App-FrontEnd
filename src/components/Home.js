import React from 'react';
import './css/home.css'

const ChatAppHomepage = () => {
  return (
    <div className="dark min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Welcome to Chat App</h1>
        </div>
        <div className="space-y-4">
          <div>
            <a href="/chats" className="w-full block">
              <button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
                Go to Chats
              </button>
            </a>
          </div>
          <div>
            <a href="/login" className="w-full block">
              <button className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
                Go to Login
              </button>
            </a>
          </div>
          <div>
            <a href="/signup" className="w-full block">
              <button className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
                Go to Register
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAppHomepage;