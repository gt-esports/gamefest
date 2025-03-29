import express from 'express';
import cors from 'cors';
import participantRoutes from './routes/participantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/participant', participantRoutes);
app.use('/admin', adminRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});