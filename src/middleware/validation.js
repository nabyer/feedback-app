import { body, validationResult } from 'express-validator';

export const feedbackValidation = [
    body('title').notEmpty().withMessage("Titel ist erforderlich."),
    body('text').notEmpty().withMessage("Text ist erforderlich."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];