
---

### **Frontend README (frontend/README.md)**

# Chat App Frontend

This is the frontend for a real-time chat application built with **React**. The frontend interacts with the backend to manage user authentication, messages, and chats.

## Table of Contents
- [Installation](#installation)
- [Setup](#setup)
- [Technologies Used](#technologies-used)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/chat-app-frontend.git
    cd chat-app-frontend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following:
    ```bash
    REACT_APP_API_URL=http://localhost:5000/api
    ```

4. Start the React development server:
    ```bash
    npm start
    ```

The app will run on `http://localhost:3000`.

## Setup

- The frontend is set up to interact with the backend at `http://localhost:5000`.
- Make sure the backend is running before starting the frontend.

## Features

- **User Authentication**: Allows users to sign up and log in using their email and password.
- **User Chats**: Displays a list of users and allows the active user to select a user to chat with.
- **Message Input**: Sends messages to the selected user and displays incoming messages.
- **JWT Authentication**: The app uses JWT tokens to manage user authentication and store the token in local storage for future requests.

## Technologies Used
- **React** for the frontend.
- **@chatscope/chat-ui-kit-react** for the chat UI components.
- **Axios** or **fetch** for HTTP requests.
- **React Router** for routing between pages.
- **JWT** for authentication handling.
