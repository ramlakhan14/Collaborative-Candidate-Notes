const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Note = require('../models/Note');
const Notification = require('../models/Notification');
const { verifyJWT } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(verifyJWT);

// ✅ GET all notes for a specific candidate
router.get('/candidate/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid candidate ID' });
  }

  try {
    const notes = await Note.find({ candidateId: id })
      .populate('sender', 'name')
      .populate('tags', 'name');
    res.status(200).json(notes);
  } catch (err) {
    console.error("Fetch candidate notes error:", err.message);
    res.status(500).json({ message: 'Server error while fetching notes' });
  }
});

// ✅ POST a new note with optional tagged users
router.post('/', async (req, res) => {
  try {
    const { candidateId, content, tags = [] } = req.body;
    const senderId = req.user.id;

    if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ error: 'Invalid or missing candidate ID' });
    }

     // ✅ Validate candidateId format
  if (!mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.status(400).json({ error: 'Invalid candidate ID' });
  }
  s
    if (!content) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    const note = new Note({
      candidateId,
      content,
      sender: senderId,
      tags,
    });

    const savedNote = await note.save();

    const fullNote = await Note.findById(savedNote._id)
      .populate('sender', 'name')
      .populate('tags', 'name');

    // ✅ Create in-app notifications
if (tags.length > 0 && candidateId) {
  const notifications = tags.map((userId) => ({
    to: userId,
    message: `You were mentioned in a note.`,
    noteId: savedNote._id,
    candidateId, // ✅ ensure it's defined and valid
  }));
  await Notification.insertMany(notifications);
}

    // ✅ Real-time emit to clients in the candidate room
    global._io?.to(candidateId).emit('new_note', fullNote);

    res.status(201).json(fullNote);
  } catch (err) {
    console.error("Error posting note:", err.message);
    res.status(500).json({ error: 'Failed to post note' });
  }
});

// ✅ GET dashboard-user-specific notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ to: req.user.id })
      .sort({ createdAt: -1 })
      .populate('candidateId', 'name')
      .populate('noteId', 'content');

    const data = notifications.map((n) => ({
      candidateId: n.candidateId?._id?.toString(),
      candidateName: n.candidateId?.name || 'Unknown',
      noteId: n.noteId?._id?.toString(),
      message: n.noteId?.content || n.message,
    }));

    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching notifications:", err.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ✅ DELETE note (by sender only)
router.delete('/:noteId', async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ error: "Invalid note ID" });
  }

  try {
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ error: "Note not found" });

    if (String(note.sender) !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this note" });
    }

    await note.deleteOne();
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Delete note error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
