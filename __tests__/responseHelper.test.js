import { sendSuccess, sendError } from "../src/utils/responseHelper"; 

const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
};

const mockData = { 
    id: 1, 
    title: 'Test Title', 
    text: 'Test text' 
};

describe('Response Helper', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should send success response with default message', () => {
        sendSuccess(mockRes, mockData)

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Anfrage erfolgreich.',
            data: mockData
        });
    });

    it('should send error response with custom status code', () => {
        sendError(mockRes, 'Es gibt einen Fehler in der Anfrage.', 400);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Es gibt einen Fehler in der Anfrage.' });
    });
});