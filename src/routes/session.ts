import express from 'express';
import { sessionController } from '../controllers/sessionController';

const router = express.Router();

router.post('/', sessionController.createSession.bind(sessionController));

export default router;
