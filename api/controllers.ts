import {
  StatsBarProps,
  Message,
  Prediction,
  MessageFilters,
  LastDoc,
  ActionMessage,
} from '../shared/types';
import db from './db/firebaseConfig';

const BATCH_SIZE = 10;

async function getMessageCounts(): Promise<StatsBarProps | null> {
  const ref = db.collection('stats').doc('message_counts');
  const doc = await ref.get();
  return doc.exists ? (doc.data() as StatsBarProps) : null;
}

async function getMessages(
  messageFilters: MessageFilters,
  lastDoc?: LastDoc
): Promise<{ messages: Message[]; lastDoc?: LastDoc }> {
  try {
    let query = db.collection('messages').limit(BATCH_SIZE);

    query = query.where('confidence', '<=', messageFilters.maxConfidence / 100);

    if (messageFilters.validatedStatus !== 'All') {
      const isValidated = messageFilters.validatedStatus === 'Validated';
      query = query.where('validated', '==', isValidated);
    }

    if (messageFilters.labelType !== 'All') {
      query = query.where('prediction', '==', messageFilters.labelType);
    }

    if (messageFilters.sortOrder === 'Spam') {
      query = query.orderBy('prediction', 'desc');
    } else if (messageFilters.sortOrder === 'Ham') {
      query = query.orderBy('prediction', 'asc');
    }

    // Pagination
    if (lastDoc) {
      const lastDocument = await db.collection('messages').doc(lastDoc.id).get();
      if (lastDocument.exists) {
        query = query.startAfter(lastDocument);
      }
    }

    const snapshot = await query
      .select('sender_number', 'raw_message', 'prediction', 'confidence', 'validated')
      .get();

    if (snapshot.empty) {
      return { messages: [], lastDoc: undefined };
    }

    const messages = snapshot.docs.map((doc) => {
      const { sender_number, raw_message, prediction, confidence, validated } = doc.data(); // Destructure doc.data()

      const msg: Message = {
        id: doc.id,
        sender_number: sender_number as string,
        raw_message: raw_message as string,
        prediction: prediction as Prediction,
        confidence: confidence as number,
        validated: validated as boolean,
      };

      return msg;
    });

    const lastDocument = snapshot.docs[snapshot.docs.length - 1];

    return {
      messages,
      lastDoc: { id: lastDocument.id, data: lastDocument.data() as Message },
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Unable to fetch messages');
  }
}

async function writeBatch(batch: ActionMessage[]): Promise<void> {
  const updateStats = async () => {
    const ref = db.collection('stats').doc('message_counts');
    const doc = await ref.get();
    const data = doc.exists ? (doc.data() as StatsBarProps) : null;

    if (data) {
      const spamCount = data.spam;
      const hamCount = data.ham;
      const validatedCount = data.validated;

      const newSpamCount = spamCount - spamDeleted;
      const newHamCount = hamCount - hamDeleted;
      const newValidatedCount = validatedCount + numValidated;

      await ref.update({
        spam: newSpamCount,
        ham: newHamCount,
        validated: newValidatedCount,
      });
    }
  };

  const writeBatch = db.batch();
  let hamDeleted = 0;
  let spamDeleted = 0;
  let numValidated = 0;

  try {
    batch.forEach((actionMessage) => {
      const docRef = db.collection('messages').doc(actionMessage.message.id);

      switch (actionMessage.action) {
        case 'delete':
          writeBatch.delete(docRef);
          if (actionMessage.message.prediction === 'Spam') {
            spamDeleted++;
          } else if (actionMessage.message.prediction === 'Ham') {
            hamDeleted++;
          }
          break;
        case 'validate':
          // Avoid redundant updates
          if (
            actionMessage.message.validated &&
            actionMessage.message.prediction === actionMessage.validation
          ) {
            break;
          }
          writeBatch.update(docRef, { validated: true, prediction: actionMessage.validation });
          numValidated++;
          break;
        default:
          break;
      }
    });

    await writeBatch.commit();
    await updateStats();
  } catch (error) {
    console.error('Error committing batch:', error);
    throw new Error('Batch write failed');
  }
}

export { getMessageCounts, getMessages, writeBatch };
