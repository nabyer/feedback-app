import { errorHandler } from '../src/middleware/errorHandler';
import express from 'express';
import request from 'supertest';

const app = express();

app.get('/error', (req, res) => {
    throw new Error('Test Error')
});

app.use(errorHandler);

describe('Error Handler Middleware', () => {
    it('should handle errors and return 500', async () => {
        const response = await request(app).get('/error');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });
});