// db.js - lowdb setup (FIXED VERSION)
const { Low } = require('lowdb')
const { JSONFile } = require('lowdb/node')
const path = require('path')

const file = path.join(__dirname, 'db.json')
const adapter = new JSONFile(file)

// ✅ Provide default structure (IMPORTANT)
const defaultData = {
    users: [],
    books: [],
    requests: [],
    audits: []
}

const db = new Low(adapter, defaultData)

async function initDB() {
    await db.read()
    // If file empty, assign default data
    db.data = db.data || defaultData
    await db.write()
}

module.exports = { db, initDB }
