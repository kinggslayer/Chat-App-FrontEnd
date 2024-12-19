import React from 'react';
import { Link } from "react-router-dom";
import { MessageCircle, Users, Shield } from 'lucide-react';
import "./css/home.css";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 flex flex-col justify-center items-center px-4 py-16">
      <div className="max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Connect. Communicate. Collaborate.
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
          Experience seamless real-time communication that bridges distances and brings people closer, effortlessly.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link
            to="/login"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:scale-105 transform transition-all duration-300 flex items-center space-x-2 shadow-lg"
            aria-label="Start Chatting"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Start Chatting</span>
          </Link>
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg border border-blue-300 hover:bg-blue-50 hover:scale-105 transform transition-all duration-300 flex items-center space-x-2 shadow-lg"
            aria-label="Create Account"
          >
            <Users className="w-5 h-5" />
            <span>Create Account</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
            <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">Real-Time Messaging</h3>
            <p className="text-gray-600">Stay connected with seamless instant communication on all devices.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
            <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">Multi-User Chats</h3>
            <p className="text-gray-600">Create groups and connect with friends, family, and teams effortlessly.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
            <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">Secure Communication</h3>
            <p className="text-gray-600">Your conversations are protected with end-to-end encryption.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
