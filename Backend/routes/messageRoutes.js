const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")

const { getMessages, createMessage } = require("../controllers/messageController")

router.get("/", authMiddleware, getMessages)
router.post("/", authMiddleware, createMessage)

module.exports = router