// Создание пользователя приложения
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'mydatabase'
    }
  ]
});
  
// Переключение на базу данных приложения
db = db.getSiblingDB('mydatabase');
  
// Создание первого пользователя для авторизации в приложении
// Хеш для пароля "password123" сгенерированный bcryptjs
db.users.insertOne({
  login: "admin",
  passwordHash: "$2b$10$oKNJjeJXkCj/fXBMjohXtuKfhevWgmX8iC04sjRahVUE.7.LJN8lK",
  createdAt: new Date(),
  updatedAt: new Date()
});