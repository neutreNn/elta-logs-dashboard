﻿import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import UserSchema from '../models/UserSchema.js'
import { validationResult } from 'express-validator';

import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }
    
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
    
        const doc = new UserSchema({
            login: req.body.login,
            passwordHash: hash,
        });
    
        const user = await doc.save();

        const token = jwt.sign(
            {
                _id: user._id,
            },
            jwtSecret,
            {
                expiresIn: '30d',
            },
        );

        const { passwordHash, ...userData } = user._doc;
    
        res.json({
            ...userData,
            token,
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось зарегистрироваться',
        });
    }
};

export const login = async (req, res) => {
    try {
        const user = await UserSchema.findOne({ login: req.body.login });

        if (!user) {
            return res.status(404).json({
                message: "Пользователь не найден",
            });
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if (!isValidPass) {
            return res.status(400).json({
                message: "Неверный логин или пароль",
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
            },
            jwtSecret,
            {
                expiresIn: '30d',
            },
        );

        const { passwordHash, ...userData } = user._doc;
    
        res.json({
            ...userData,
            token,
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось авторизоватся',
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await UserSchema.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        const {passwordHash, ...userData} = user._doc;

        res.json(userData);
        
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Нет доступа',
        });
    }
};

export const getLogin = async (req, res, next) => {
    try {
        const user = await UserSchema.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        req.login = user.login;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при получении данных пользователя' });
    }
};

export const UserController = { 
  register,
  login,
  getMe,
  getLogin
};