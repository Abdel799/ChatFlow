const Message = require("../models/Message")

exports.getMessages = async (req, res) => {
    const messages = await Message.find().sort({ createdAt: 1 })
    res.json(messages)
}

exports.createMessage = async (req, res) => {
    const newMessage = new Message ({
        text: req.body.text,
        username: req.body.username
    })

    await newMessage.save()
    res.json(newMessage)
}