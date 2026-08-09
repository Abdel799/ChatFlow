const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

exports.register = async (req, res) => {
  const { username, password } = req.body

  const existingUser = await User.findOne({ username })

  if (existingUser) {
    return res.status(400).json({
      message: "User is already registered, proceed to login."
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = new User({
    username,
    password: hashedPassword
  })

  await user.save()

  res.json({ message: "Registered successfully, proceed to login." })
}

exports.login = async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })

  if (!user) return res.status(400).json({ message: "User not registered" })

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) return res.status(400).json({ message: "Incorrect password" })

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  )

  res.json({ token })
}