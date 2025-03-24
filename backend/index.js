const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const raffleRoutes = require('./routes/raffleRoutes');
app.use('/api/raffles', raffleRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
