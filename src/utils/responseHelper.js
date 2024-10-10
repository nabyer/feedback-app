export const sendSuccess = (res, data, message = "Anfrage erfolgreich.", statusCode = 200) => {
    res.status(statusCode).json({ message, data });
};

export const sendError = (res, error, statusCode = 500) => {
    res.status(statusCode).json({ error });
}