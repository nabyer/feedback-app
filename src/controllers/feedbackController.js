import { pool } from '../db.js';

export const addFeedback = async (title, text) => {
    const query = `INSERT INTO feedback (title, text) VALUES ($1, $2) RETURNING *;`;
    const result = await pool.query(query, [title, text]);

    return result.rows[0];
}

export const getAllFeedback = async () => {
    const query = `SELECT * FROM feedback;`;
    const result = await pool.query(query);

    return result.rows;
}

export const deleteFeedbackByTitle = async (title) => {
    const query = `DELETE FROM feedback WHERE title = $1 RETURNING *;`;
    const result = await pool.query(query, [title]);
    
    return result;
}