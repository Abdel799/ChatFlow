# 💬 ChatFlow

ChatFlow is a full-stack real-time messaging application that allows users to communicate through persistent chat rooms. The application features secure authentication, real-time messaging, online user tracking, typing indicators, and persistent message history.

The project was built to explore full-stack development, real-time client-server communication, authentication, and production deployment.

**Live Demo:** [ChatFlow](https://chat-flow-opal.vercel.app/)

## ✨ Features

* 🔐 User registration and login with JWT authentication
* 🔒 Secure password hashing with bcrypt
* 💬 Real-time messaging using Socket.IO
* 🏠 Multiple persistent chat rooms
* 🟢 Real-time online user tracking
* ⌨️ Live typing indicators
* 💾 Persistent message history
* 🕒 Message timestamps
* 📜 Independently scrollable chat interface
* ⚠️ Authentication validation and error handling
* ⏳ Loading states for authentication and message history
* 🔄 Connection handling for refreshes, logouts, and disconnects

## 🛠️ Tech Stack

**Frontend**

* React
* JavaScript
* Tailwind CSS
* Vite
* Socket.IO Client

**Backend**

* Node.js
* Express.js
* Socket.IO
* Mongoose
* JSON Web Tokens (JWT)
* bcrypt

**Database**

* MongoDB Atlas

**Deployment**

* Vercel — frontend
* Render — backend
* MongoDB Atlas — production database

## ⚙️ How It Works

ChatFlow uses a React frontend that communicates with a Node.js and Express backend.

REST API endpoints handle user authentication and persistent message retrieval, while Socket.IO provides bidirectional real-time communication between connected clients.

Users can join different chat rooms, where Socket.IO broadcasts messages and typing events to other users in the same room. The server also tracks active socket connections to maintain the online-user list and handles connection changes such as refreshes, logouts, and disconnects.

MongoDB Atlas stores user accounts and message history, allowing conversations to persist between sessions.

### Production Architecture

```text
             React + Vite
                 │
               Vercel
                 │
        ┌────────┴────────┐
        │                 │
     REST API         Socket.IO
        │                 │
        └────────┬────────┘
                 │
          Node.js + Express
                 │
               Render
                 │
              Mongoose
                 │
           MongoDB Atlas
```

## 📸 Screenshots

### Authentication

![ChatFlow authentication screen](ADD_SCREENSHOT_PATH)

### Real-Time Messaging

![ChatFlow real-time messaging](ADD_SCREENSHOT_PATH)

### Online Users & Typing Indicators

![ChatFlow online users and typing indicators](ADD_SCREENSHOT_PATH)

## 🔐 Authentication & Security

ChatFlow uses JWT-based authentication to protect authenticated routes. Passwords are hashed with bcrypt before being stored in the database.

The authentication system handles common cases including:

* Invalid passwords
* Unregistered users
* Duplicate usernames
* Empty username or password fields

Environment variables are used for sensitive configuration such as database credentials and JWT secrets and are excluded from version control.

## 🔮 Future Improvements

Potential future additions include:

* Direct/private messaging
* User profiles and display names
* Friend system
* Message editing and deletion
* Image and file sharing
* Read receipts
* Enhanced session management

## 👨‍💻 Author

**Abdelrahman Abdelaal**
Computer Science Co-op Student — Toronto Metropolitan University

