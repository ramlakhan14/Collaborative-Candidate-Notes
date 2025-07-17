const express = require('express');
const Candidate = require('../models/Candidate');
const { verifyJWT } = require('../middleware/auth'); // Add this if you want auth
const router = express.Router();

// Apply authentication middleware if required
// router.use(verifyJWT);

// ✅ GET all candidates
router.get('/', async (_, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 }); // recent first
    res.status(200).json(candidates);
  } catch (err) {
    console.error('❌ Error fetching candidates:', err.message);
    res.status(500).json({ error: 'Server error while fetching candidates' });
  }
});

// ✅ POST a new candidate
router.post('/', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const candidate = new Candidate({ name, email });
    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    console.error('❌ Error saving candidate:', err.message);

    if (err.code === 11000) {
      return res.status(409).json({ error: 'Candidate with this email already exists' });
    }

    res.status(400).json({ error: 'Invalid candidate data' });
  }
});

module.exports = router;
