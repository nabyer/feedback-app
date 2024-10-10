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

describe('Feedback Routes', () => {
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
