const express = require("express")
const cors = require("cors")
const http = require("http")

const Message = require("./models/Message")

const { Server } = require("socket.io")

const connectDB = require("./config/db")
const userRoutes = require("./routes/userRoutes")
const authRoutes = require("./routes/authRoutes")
const messageRoutes = require("./routes/messageRoutes")

const app = express()

connectDB()

app.use(cors())
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
    origin: "http://localhost:5173"
  }
})

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("send_message", async (data) => {
    
    const newMessage = new Message({
      text: data.text
    })

    await newMessage.save()
    
    io.emit("receive_message", newMessage)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected")
  })
})

server.listen(5001, () => {
  console.log("Server started on port 5001")
})