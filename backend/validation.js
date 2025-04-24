import { body } from 'express-validator';

export const loginValidation = [
    body('login', 'Неверный формат логина').isLength({ min: 3 }).isString(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 5 }),
];

export const registerValidation = [
    body('login', 'Неверный формат логина').isLength({ min: 3 }).isString(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 5 }),
];