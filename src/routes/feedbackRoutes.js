import express from 'express';
import { addFeedback, getAllFeedback, deleteFeedbackByTitle } from '../controllers/feedbackController.js';
import { feedbackValidation } from '../middleware/validation.js'
import { sendSuccess, sendError } from '../utils/responseHelper.js';

const feedbackRouter = express.Router();

// POST /feedback - fuegt neues Feedback hinzu
feedbackRouter.post('/feedback', feedbackValidation, async (req, res) => { 

    try {
        const { title, text } = req.body;
        const newFeedback = await addFeedback(title, text);
        sendSuccess(res, newFeedback, "Feedback erfolgreich gespeichert.", 201);
    } catch (error) {
        sendError(res, "Fehler beim Speichern des Feedbacks.");
    }

});

// GET /feedback - gibt alle Feedback Eintraege zurueck
feedbackRouter.get('/feedback', async (req, res) => {

    try {
        const feedback = await getAllFeedback();
        sendSuccess(res, feedback, "Feedback erfolgreich abgefragt.");

    } catch (error) {
        sendError(res, "Fehler beim Abruf des Feedbacks.");
    }

});

// DELETE /feedback/title - Loescht Feedback mit dem gegebenen title
feedbackRouter.delete('/feedback/:title', async (req, res) => {

    try {
        const { title } = req.params;

        const result = await deleteFeedbackByTitle(title);
        if (result.rowCount === 0) {
            return sendError(res, "Feedback nicht gefunden.", 404);
        }
        sendSuccess(res, null, "Feedback erfolgreich geloescht.");
    } catch (error) {
        sendError(res, "Fehler beim Loeschen des Feedbacks.");
    }
});

export default feedbackRouter;