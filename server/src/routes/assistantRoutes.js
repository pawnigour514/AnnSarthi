import express from 'express';
import { chatWithAssistant, executeTool } from '../controllers/assistantController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/chat', chatWithAssistant);
router.post('/execute-tool', executeTool);

export default router;
