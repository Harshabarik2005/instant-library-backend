// server.js - main entry
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { initDB } = require('./db')
const authRoutes = require('./routes/auth')
const booksRoutes = require('./routes/books')
const requestsRoutes = require('./routes/requests')
const adminRoutes = require('./routes/admin')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(bodyParser.json())

app.use('/api/auth', authRoutes)
app.use('/api/books', booksRoutes)
app.use('/api/requests', requestsRoutes)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res) => res.send('Instant Library Backend is running'))

async function start() {
    await initDB()
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`))
}

start()
