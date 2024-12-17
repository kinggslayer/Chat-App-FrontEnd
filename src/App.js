import './components/css/App.css';
import './components/css/chat.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chat from './components/Chat';
import Navbar from "./components/Navbar";
import About from "./components/About";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
function App() {
  return (
    <div>
    <Router>
      <Navbar/>
      {/* <Alert message="alert it is"/> */}
      <div className="container">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/about" element={<About />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/chats" element={<Chat />} />
          <Route exact path="/forgot-Password" element={<ForgotPassword />} />
          <Route exact path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </div>
    </Router>
      </div>
  );
}
export default App;