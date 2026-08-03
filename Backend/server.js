require("dotenv").config()

const CLIENT_URL = process.env.CLIENT_URL

const express = require("express")
const cors = require("cors")
const http = require("http")

const Message = require("./models/Message")

const { Server } = require("socket.io")

const connectDB = require("./config/db")
const userRoutes = require("./routes/userRoutes")
const authRoutes = require("./routes/authRoutes")
const messageRoutes = require("./routes/messageRoutes")

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.LOCAL_CLIENT_URL
]

const app = express()

const onlineUsers = {}

connectDB()

app.use(cors({
  origin: allowedOrigins
}))

app.use(express.json())

app.use("/users", userRoutes)
app.use("/auth", authRoutes)
app.use("/messages", messageRoutes)

app.get("/", (req, res) => {
  res.send("Server running")
})

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: allowedOrigins
  }
})

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("user_online", (username) => {
    console.log("Received user_online:", username)
    onlineUsers[socket.id] = username
    console.log("Current online users:", onlineUsers)
    io.emit("online_users", Object.values(onlineUsers))
  })

  socket.on("join_room", (room) => {
    socket.join(room)
    console.log(`${socket.id} joined ${room}`)
  })

  socket.on("leave_room", (room) => {
    socket.leave(room)
    console.log(`${socket.id} left ${room}`)
  })

  socket.on("send_message", async (data) => {
    const newMessage = new Message({
      text: data.text,
      username: data.username,
      room: data.room
    })

    await newMessage.save()

    io.to(data.room).emit("receive_message", newMessage)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected")

    delete onlineUsers[socket.id]
    io.emit("online_users", Object.values(onlineUsers))
  })
})

server.listen(5001, () => {
  console.log("Server started on port 5001")
})