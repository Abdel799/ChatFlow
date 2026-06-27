import { useEffect, useState } from "react"
import { io } from "socket.io-client"

const API = import.meta.env.VITE_API_URL

const socket = io(API)

function App() {

  const [users, setUsers] = useState([])
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])

  const register = () => {

    fetch(`${API}/auth/register`, {
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

    fetch(`${API}/auth/login`, {
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
  
    if (!token) {
      setMessages([])
      return
    }
  
    fetch(`${API}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data)
        } else {
          setMessages([])
          console.log(data.message)
        }
      })
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

    fetch(`${API}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
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
    fetch(`${API}/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
  }

  useEffect(() => {
    fetchUsers();
  }, [])


  const deleteUser = (id) => {
    fetch(`${API}/users/${id}`, {
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
          {Array.isArray(messages) && messages.map((msg, index) => (
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
