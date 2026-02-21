// routes/auth.js
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { nanoid } = require('nanoid')
require('dotenv').config()
const { db } = require('../db')

router.post('/register', async (req, res) => {
    const { name, email, password, phone } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' })

    await db.read()
    const exists = db.data.users.find(u => u.email === email)
    if (exists) return res.status(400).json({ error: 'User already exists' })

    const hash = await bcrypt.hash(password, 10)
    const user = { id: nanoid(), name, email, passwordHash: hash, role: 'student', phone: phone || null }
    db.data.users.push(user)
    await db.write()

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN || '7d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email, password required' })
    await db.read()
    const user = db.data.users.find(u => u.email === email)
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN || '7d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

module.exports = router
