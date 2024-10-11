import request from 'supertest';
import express from 'express';
import feedbackRouter from '../src/routes/feedbackRoutes'; 
import { addFeedback, getAllFeedback, deleteFeedbackByTitle } from '../src/controllers/feedbackController';

jest.mock('../src/controllers/feedbackController', () => ({
    addFeedback: jest.fn(),
    getAllFeedback: jest.fn(),
    deleteFeedbackByTitle: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/', feedbackRouter);

describe('Feedback Routes - Success Cases', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('POST /feedback - should add feedback and return 201', async () => {
        const mockFeedback = {
            id: 1,
            title: 'Test Feedback',
            text: 'Test text'
        };

        addFeedback.mockResolvedValue(mockFeedback);

        const response = await request(app)
            .post('/feedback')
            .send({ title: 'Test Feedback', text: 'Test text'});

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Feedback erfolgreich gespeichert.");
        expect(response.body.data).toEqual(mockFeedback);
    });

    it('GET /feedback - should return all feedback', async () => {
        const mockFeedback = [{ id: 1, title: 'Test Feedback', text: 'Test text' }];
        getAllFeedback.mockResolvedValue(mockFeedback);

        const response = await request(app).get('/feedback');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockFeedback);
    });

    it('DELETE /feedback/:title - should delete feedback and return 200', async () => {
        deleteFeedbackByTitle.mockResolvedValue({ rowCount: 1 });

        const response = await request(app).delete('/feedback/test');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Feedback erfolgreich geloescht.');
    });

    it('DELETE /feedback/:title - should return 404 if feedback not found', async () => {
        deleteFeedbackByTitle.mockResolvedValue({ rowCount: 0 });

        const response = await request(app).delete('/feedback/nonexistent_title');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Feedback nicht gefunden.');
    });

});

describe('Feedback Routes - Error Cases (500)', () => {
    beforeEach(() => {
        // Mocking the `sendError` function within the jest.mock() call itself
        jest.mock('../src/utils/responseHelper', () => ({
            sendSuccess: jest.fn(),
            sendError: jest.fn((res, message) => {
                res.status(500).json({ error: message });
            }),
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules(); // Reset module registry to avoid interference with the next test cases
    });

    it('POST /feedback - should return 500 if adding feedback fails', async () => {
        addFeedback.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/feedback')
            .send({ title: 'Test Feedback', text: 'Test text' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Fehler beim Speichern des Feedbacks.');
    });

    it('GET /feedback - should return 500 if retrieving feedback fails', async () => {
        getAllFeedback.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/feedback');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Fehler beim Abruf des Feedbacks.');
    });

    it('DELETE /feedback/:title - should return 500 if deleting feedback fails', async () => {
        deleteFeedbackByTitle.mockRejectedValue(new Error('Database error'));

        const response = await request(app).delete('/feedback/title');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Fehler beim Loeschen des Feedbacks.');
    });
});