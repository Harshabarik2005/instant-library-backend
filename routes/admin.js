// routes/admin.js - DynamoDB version
const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/auth");
const { nanoid } = require("nanoid");
const { sendNotification } = require("../services/notificationService");
// DynamoDB services
const { getRequests, updateRequestStatus } = require("../services/requestsService");
const { addBook } = require("../services/booksService");


// 📥 Get all requests (Admin)
router.get("/requests", authMiddleware, adminOnly, async (req, res) => {
    try {
        const requests = await getRequests();
        res.json({ requests });
    } catch (err) {
        console.error("Admin fetch requests error:", err);
        res.status(500).json({ error: "Failed to fetch requests" });
    }
});


// ✅ Approve request
router.put("/requests/:id", authMiddleware, adminOnly, async (req, res) => {
    try {
        const requestId = req.params.id;
        const { status } = req.body;

        await updateRequestStatus(requestId, status);

        await sendNotification(
            "Request Approved",
            `Request ${requestId} has been approved`
        );

        res.json({ message: "Request updated", requestId, status });
    } catch (err) {
        console.error("Admin update request error:", err);
        res.status(500).json({ error: "Failed to update request" });
    }
});


// ➕ Add book (Admin)
router.post("/books", authMiddleware, adminOnly, async (req, res) => {
    try {
        const { title, authors, subjects, isbn, copiesTotal } = req.body;

        if (!title || !copiesTotal) {
            return res.status(400).json({ error: "title and copiesTotal required" });
        }

        const book = {
            id: nanoid(),
            title,
            authors: authors || [],
            subjects: subjects || [],
            isbn: isbn || null,
            copiesTotal: Number(copiesTotal),
            copiesAvailable: Number(copiesTotal),
            coverUrl: "",
            ebookKey: null,
            createdAt: new Date().toISOString(),
        };

        await addBook(book);

        res.json({ book });
    } catch (err) {
        console.error("Admin add book error:", err);
        res.status(500).json({ error: "Failed to add book" });
    }
});

module.exports = router;