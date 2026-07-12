import { useEffect, useState } from "react"
import { io } from "socket.io-client"

const API = import.meta.env.VITE_API_URL

const socket = io(API)

function App() {

  const [users, setUsers] = useState([])
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [currentUser, setCurrentUser] = useState(null)
  
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])

  const [room, setRoom] = useState("General")

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

      if (data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("username", username)
        setCurrentUser(username)
        setPassword("")
      }
  
    })
  
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
  
    setCurrentUser(null)
    setMessages([])
  }

  useEffect(() => {
    const savedUsername = localStorage.getItem("username")
  
    if (savedUsername) {
      setCurrentUser(savedUsername)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
  
    setMessages([])
  
    if (!token) {
      return
    }
  
    fetch(`${API}/messages/${room}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load ${room}: ${res.status}`)
        }
  
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data)
        }
      })
      .catch((error) => {
        console.error(error)
        setMessages([])
      })
  }, [room])

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data])
    })
  
    return () => {
      socket.off("receive_message")
    }
  }, [])

  useEffect(() => {
    socket.emit("join_room", room)
  
    return () => {
      socket.emit("leave_room", room)
    }
  }, [room])

  const sendMessage = () => {
    if (!message.trim()) {
      return
    }
  
    socket.emit("send_message", {
      text: message,
      username: currentUser,
      room
    })
  
    setMessage("")
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

      {currentUser ? (
        <div>
          <h2>Logged in as: {currentUser}</h2>
          <button onClick={logout}>Logout</button>
        </div>
        ) : (
          <h2>Not logged in</h2>
        )}
      
      <h1>Users</h1>

      {users.map((user) => (
        <div key={user._id}>
          <p>{user.username}</p>
          <button onClick={() => deleteUser(user._id)}>Delete</button>
        </div>
      ))}

      <div>
        <button onClick={() => setRoom("General")}>
          General
        </button>

        <button onClick={() => setRoom("School")}>
          School
        </button>

        <button onClick={() => setRoom("Career")}>
          Career
        </button>

        <button onClick={() => setRoom("Gaming")}>
          Gaming
        </button>

        <button onClick={() => setRoom("Random")}>
          Random
        </button>
      </div>

      {currentUser && (
      <>
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
      </>
    )}

    </div>

  )
}

export default App
