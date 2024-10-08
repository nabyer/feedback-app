import express from 'express';
import cors from 'cors';
import feedbackRouter from './routes.js';
import { createTable } from './db.js';

// Creating the express app
const app = express();
const PORT = 3000;

// Setup CORS
app.use(cors());
// Middleware for parsing JSON
app.use(express.json());

// Creating the feedback table
createTable();

app.use('/', feedbackRouter);

// Start the app
app.listen(PORT, ()=> {
    console.log(`Server laeuft auf http://localhost:${PORT}`);
});
