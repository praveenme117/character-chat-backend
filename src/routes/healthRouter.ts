import express from 'express';

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Avatar Chat Backend is running' });
});

export default router;


