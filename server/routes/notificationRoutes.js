const express = require('express');
const router = express.Router();
const { fetchNotifications } = require('../controllers/notificationController');
const { verifyJWT } = require('../middleware/auth');

// All notifications require auth
router.use(verifyJWT);

// GET /api/notifications — Fetch user's notifications
router.get('/', fetchNotifications);

module.exports = router;
