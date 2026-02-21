// routes/requests.js - DynamoDB version
const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const { authMiddleware } = require("../middleware/auth");
const { sendNotification } = require("../services/notificationService");

// ✅ DynamoDB service
const { addRequest, getRequests } = require("../services/requestsService");


// ➕ Create request
router.post("/:bookId", authMiddleware, async (req, res) => {
    try {
        const request = {
            id: nanoid(),
            bookId: req.params.bookId,
            userId: req.user.id,
            status: "pending",
            requestedAt: new Date().toISOString(),
        };

        await addRequest(request);

        await sendNotification(
            "New Book Request",
            `User ${req.user.id} requested book ${req.params.bookId}`
        );

        res.json({ request });
    } catch (err) {
        console.error("Error creating request:", err);
        res.status(500).json({ error: "Failed to create request" });
    }
});


// 📌 Get my requests
router.get("/", authMiddleware, async (req, res) => {
    try {
        const requests = await getRequests();
        const myRequests = requests.filter(r => r.userId === req.user.id);

        res.json({ requests: myRequests });
    } catch (err) {
        console.error("Error fetching requests:", err);
        res.status(500).json({ error: "Failed to fetch requests" });
    }
});

module.exports = router;