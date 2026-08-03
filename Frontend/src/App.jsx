import { useEffect, useState, useRef } from "react"
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

  const [onlineUsers, setOnlineUsers] = useState([])

  const messagesEndRef = useRef(null)

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
{/* 
  useEffect(() => {
    if (!currentUser) {
      return
    }
  
    const announceUser = () => {
      console.log("Announcing online user:", currentUser)
      socket.emit("user_online", currentUser)
    }
  
    if (socket.connected) {
      announceUser()
    }
  
    socket.on("connect", announceUser)
  
    return () => {
      socket.off("connect", announceUser)
    }
  }, [currentUser])
  */}

  useEffect(() => {
    if (!currentUser) {
      return
    }
  
    const handleOnlineUsers = (users) => {
      console.log("Received online users:", users)
      setOnlineUsers(users)
    }
  
    const announceUser = () => {
      console.log("Announcing online user:", currentUser)
      socket.emit("user_online", currentUser)
    }
  
    socket.on("online_users", handleOnlineUsers)
  
    if (socket.connected) {
      announceUser()
    }
  
    socket.on("connect", announceUser)
  
    return () => {
      socket.off("online_users", handleOnlineUsers)
      socket.off("connect", announceUser)
    }
  }, [currentUser])

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

  {/* useEffect(() => {
    socket.on("online_users", (users) => {
      console.log("Received online users:", users)
      setOnlineUsers(users)
    })
  
    return () => {
      socket.off("online_users")
    }
  }, [])*/}

  useEffect(() => {
    socket.emit("join_room", room)
  
    return () => {
      socket.emit("leave_room", room)
    }
  }, [room])

  useEffect(() => {
    
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    })

  }, [messages])

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

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-96 rounded-xl bg-white p-8 shadow-lg">
  
          <h1 className="mb-6 text-3xl font-bold">
            ChatFlow
          </h1>
  
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4 w-full rounded-lg border p-3"
          />
  
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-lg border p-3"
          />
  
          <div className="flex gap-3">
            <button
              onClick={login}
              className="flex-1 rounded-lg bg-blue-600 p-3 text-white"
            >
              Login
            </button>
  
            <button
              onClick={register}
              className="flex-1 rounded-lg bg-slate-700 p-3 text-white"
            >
              Register
            </button>
          </div>
  
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen w-full">
  
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 p-5 text-white">
          <h1 className="mb-8 text-2xl font-bold">
            ChatFlow
          </h1>
  
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Rooms
          </p>
  
          <div className="space-y-2">
            {["General", "School", "Career", "Gaming", "Random"].map((roomName) => (
              <button
                key={roomName}
                onClick={() => setRoom(roomName)}
                className={`w-full rounded-lg px-4 py-2 text-left transition ${
                  room === roomName
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                # {roomName}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Online ({onlineUsers.length})
            </p>

            <div className="space-y-2">
              {onlineUsers.map((user) => (
              <div
                key={user}
                className="flex items-center gap-2 text-slate-300"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                <span>{user}</span>
              </div>
              ))}
            </div>
          </div>
  
          <div className="mt-10 border-t border-slate-700 pt-5">
            {currentUser ? (
              <>
                <p className="text-sm text-slate-400">
                  Logged in as
                </p>
  
                <p className="mb-3 font-semibold">
                  {currentUser}
                </p>
  
                <button
                  onClick={logout}
                  className="w-full rounded-lg bg-red-500 px-4 py-2 font-medium hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <p className="text-slate-400">
                Not logged in
              </p>
            )}
          </div>
        </aside>
  
        {/* Main chat area */}
        <main className="flex flex-1 flex-col bg-white">
  
          {/* Header */}
          <header className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-900">
              # {room}
            </h2>
  
            <p className="text-sm text-slate-500">
              Welcome to the {room} room
            </p>
          </header>
  
          {/* Messages */}
          <section className="flex-1 space-y-4 overflow-y-auto p-6">
            {Array.isArray(messages) && messages.length > 0 ? (
              messages.map((msg, index) => {
                const isOwnMessage = (currentUser === msg.username)

                return (
                  <div 
                    key={msg._id || index}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >

                    <div className={`max-w-3/4 rounded-xl ${isOwnMessage ? "bg-blue-500" : "bg-slate-200"} p-4`}>
                      <div className="mb-1 flex items-center justify-between gap-4">
                        {!isOwnMessage && (
                          <strong className="text-slate-900">
                            {msg.username}
                          </strong>
                        )}
                        
                        <span className="text-xs text-black">
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
      
                      <p className={`${isOwnMessage ? "text-white" : "text-black"}`}>
                        {msg.text}
                      </p>
                    </div>

                  </div>
                )
              })
            ) : (
              <p className="text-center text-slate-400">
                No messages in this room yet.
              </p>
            )}
            <div ref={messagesEndRef}></div>
          </section>
  
          {/* Message input */}
          {currentUser && (
            <div className="border-t border-slate-200 p-4">
              <div className="flex gap-3">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage()
                    }
                  }}
                  placeholder={`Message #${room}`}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
  
                <button
                  onClick={sendMessage}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
