const Notification = require('../models/Notification');

const fetchNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const notifications = await Notification.find({ to: userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Fetch notifications error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { fetchNotifications };
