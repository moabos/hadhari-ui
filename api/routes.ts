import express from 'express';
import { getMessageCounts, getMessages, writeBatch } from './controllers';
import { MessageFilters, LastDoc, ActionMessage } from 'shared/types';

const router = express.Router();

router.get('/message_counts', async (_, res) => {
  const messageCounts = await getMessageCounts();
  res.json(messageCounts);
});

router.post('/messages', async (req, res) => {
  try {
    const { messageFilters, lastDoc } = req.body as {
      messageFilters: MessageFilters;
      lastDoc?: LastDoc;
    };

    const messages = await getMessages(messageFilters, lastDoc);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Unable to fetch messages' });
  }
});

router.post('/write_batch', async (req, res) => {
  try {
    const batch = req.body as ActionMessage[];
    await writeBatch(batch);
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing batch:', error);
    res.status(500).json({ error: 'Unable to write batch' });
  }
});

export default router;
