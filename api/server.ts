import express, { RequestHandler } from 'express';
import cors from 'cors';
import router from './routes';
const app = express();
const port = 3000;

const corsOptions = {
  methods: ['GET', 'POST'],
  origin: '*',
  allowedHeaders: '*',
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api', router as RequestHandler);

app.listen(port);
