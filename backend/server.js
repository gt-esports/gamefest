import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import participantRoutes from './routes/participantRoutes.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/participants', participantRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});