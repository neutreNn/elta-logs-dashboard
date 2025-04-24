import jwt from 'jsonwebtoken';
import User from '../models/UserSchema.js';

export default async (req, res, next) => {
    try {
      const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
      
      if (!token) {
        return res.status(403).json({
          message: 'Нет доступа',
        });
      }
      
      // Проверяем токен
      const decoded = jwt.verify(token, 'secret123');
      
      // Проверяем существование пользователя в базе данных
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(403).json({
          message: 'Пользователь не найден',
        });
      }
      
      // Если токен валидный и пользователь существует
      req.userId = decoded._id;
      next();
    } catch (err) {
      return res.status(403).json({
        message: 'Недействительный токен',
      });
    }
};