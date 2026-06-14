const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

exports.register = async (req, res) => {
  const { username, password } = req.body

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = new User({
    username,
    password: hashedPassword
  })

  await user.save()

  res.json({ message: "User registered" })
}

exports.login = async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })

  if (!user) return res.status(400).json({ message: "User not found" })

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) return res.status(400).json({ message: "Invalid password" })

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  )

  res.json({ token })
}