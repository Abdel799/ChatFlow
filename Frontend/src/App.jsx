import { useEffect, useState } from "react"
import { io } from "socket.io-client"

const socket = io("http://localhost:5001")

function App() {

  const [users, setUsers] = useState([])
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])

  const register = () => {

    fetch("http://localhost:5001/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      setUsername("")
      setPassword("")
    })

  }

  const login = () => {

    fetch("http://localhost:5001/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    })
    .then(res => res.json())
    .then(data => {
  
      console.log(data)
  
      localStorage.setItem("token", data.token)
      setPassword("")
  
    })
  
  }

  useEffect(() => {

    const token = localStorage.getItem("token")
    fetch("http://localhost:5001/messages", {
      headers: {
        authorization: token
      }
    })
      .then(res => res.json())
      .then(data => setMessages(data))
  }, [])

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data])
    })
  
    return () => {
      socket.off("receive_message")
    }
  }, [])

  const sendMessage = () => {
    const token = localStorage.getItem("token")

    fetch("http://localhost:5001/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: token
      },
      body: JSON.stringify({
        text: message,
        username: username
      })
    })
      .then(res => res.json())
      .then(data => {
  
        setMessages((prev) => [...prev, data])
  
        setMessage("")
      })
  }

  const fetchUsers = () => {
    fetch("http://localhost:5001/users")
      .then(res => res.json())
      .then(data => setUsers(data))
  }

  useEffect(() => {
    fetchUsers();
  }, [])


  const deleteUser = (id) => {
    fetch(`http://localhost:5001/users/${id}`, {
      method: "DELETE"
    }).then(() => {
      fetchUsers()
    })
  }

  return (
    <div>
      
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={register}>
        Register
      </button>

      <button onClick={login}>
        Login
      </button>
      
      <h1>Users</h1>

      {users.map((user) => (
        <div key={user._id}>
          <p>{user.username}</p>
          <button onClick={() => deleteUser(user._id)}>Delete</button>
        </div>
      ))}

      <h1>Chat</h1>

      <div>
        {messages.map((msg, index) => (
        <p key={index}>
          <strong>{msg.username}: </strong>
          {msg.text}
        </p>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
      
      <button onClick={sendMessage}>
        Send
      </button>
    </div>

  )
}

export default App
