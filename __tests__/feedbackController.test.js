import { addFeedback, getAllFeedback, deleteFeedbackByTitle } from '../src/controllers/feedbackController';
import { pool } from '../src/db';

jest.mock('../src/db', () => ({
    pool: {
        query: jest.fn()
    }
}));

describe('Feedback Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should add feedback successfully', async () => {
        const mockFeedback = {
            id: 1,
            title: 'Test Feedback',
            text: 'Test text'
        };

        pool.query.mockResolvedValue( { rows: [mockFeedback] } );

        const result = await addFeedback('Test Feedback', 'Test text');

        expect(result).toEqual(mockFeedback);
        expect(pool.query).toHaveBeenCalledWith(
            'INSERT INTO feedback (title, text) VALUES ($1, $2) RETURNING *;', ['Test Feedback', 'Test text']
        );

    });

    it('should get all feedback successfully', async () => {
        const mockFeedback = [{ id: 1, title: 'Test Feedback', text: 'Test text' }];
        pool.query.mockResolvedValue({ rows: mockFeedback });

        const result = await getAllFeedback();

        expect(result).toEqual(mockFeedback);
        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM feedback;');
    });

    it('should delete feedback by title', async () => {
        const mockResponse = { rowCount: 1 };
        const title = 'Test Feedback';

        pool.query.mockResolvedValue(mockResponse);

        const result = await deleteFeedbackByTitle(title);

        expect(result).toEqual(mockResponse);
        expect(pool.query).toHaveBeenCalledWith('DELETE FROM feedback WHERE title = $1 RETURNING *;', [title]);
    });

    it('should handle delete feedback not found', async () => {
        const mockResponse = { rowCount: 0 };
        const title = '_nonexistent_title_'

        pool.query.mockResolvedValue(mockResponse);

        const result = await deleteFeedbackByTitle(title);

        expect(result.rowCount).toBe(0);
        expect(pool.query).toHaveBeenCalledWith('DELETE FROM feedback WHERE title = $1 RETURNING *;', [title]);
    });
});