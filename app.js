import express from 'express';
import pkg from 'pg';
import cors from 'cors';

// Creating the express app
const app = express();
const PORT = 3000;

// Setup CORS
app.use(cors());

// Middleware for parsing JSON
app.use(express.json());

// Creating a database connection
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Creating the feedback table
const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS feedback (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                text TEXT NOT NULL
                );
            `);

    } catch (error) {
        console.error('Error creating table: ', error);
    }
}

createTable();

// POST /feedback - fuegt neues Feedback hinzu
app.post('/feedback', async (req, res) => {
    const { title, text } = req.body;

    if (!title || !text ) {
        return res.status(400).json({ message: "title und text sind im body erforderlich." })
    }
    
    try {
        const query = `INSERT INTO feedback (title, text) VALUES ($1, $2);`;
        await pool.query(query, [title, text]);
        res.status(201).json({ message: "Toll!!! Feedback erfolgreich gespeichert."});
    } catch (error) {
        res.status(500).json({ message: "Fehler beim Speichern des Feedbacks." });
    }

});


// GET /feedback - gibt alle Feedback Eintraege zurueck
app.get('/feedback', async (req, res) => {

    try {
        const query = `SELECT * FROM feedback;`;
        const result = await pool.query(query);
        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ message: "Fehler beim Abrufen des Feedbacks." });
    }

});

// DELETE /feedback/title - Loescht Feedback mit dem gegebenen title
app.delete('/feedback/:title', async (req, res) => {
    const { title } = req.params;

    try {
        const query = `DELETE FROM feedback WHERE title = $1;`;
        const result = await pool.query(query, [title]);

        if ( result.rowCount === 0 ) {
            return res.status(404).json({ message: "Feedback nicht gefunden." });
        }

        res.status(200).json({ message: "Feedback erfolgreich geloescht." });

    } catch (error) {
        res.status(500).json({ message: "Fehler beim Loeschen des Feedbacks." });
    }

});

// Start the app
app.listen(PORT, ()=> {
    console.log(`Server laeuft auf http://localhost:${PORT}`);
});
