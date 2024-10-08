export const sendSuccess = (res, data, mes = "Anfrage erfolgreich.") => {
    res.status(200).json({ message, data });
};

export const sendError = (res, error, statusCode = 500) => {
    res.status(statusCode).json({ error });
};