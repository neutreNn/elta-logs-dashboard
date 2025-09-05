import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import MobileModel from "../models/MobileSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadMobile = async (req, res) => {
  try {
    const { 
      name, 
      description,
    } = req.body;

    console.log('Upload Mobile request:', { name, description });

    if (!name) {
      return res.status(400).json({ message: 'Обязательное поле: name' });
    }

    const mobile = new MobileModel({
      name,
      description,
      files: []
    });

    if (req.file) {
      const allowedExtensions = ['.apk'];
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ message: `Файл должен быть в формате: ${allowedExtensions.join(', ')}` });
      }

      const uploadDir = path.join(__dirname, '..', 'Uploads', 'mobile', mobile._id.toString());
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
      const filePath = path.join(uploadDir, fileName);

      if (fs.existsSync(filePath)) {
        return res.status(400).json({ message: `Файл с именем "${fileName}" уже существует` });
      }

      fs.writeFileSync(filePath, req.file.buffer);

      mobile.files.push({
        file_path: `Uploads/mobile/${mobile._id}/${fileName}`,
        file_name: fileName,
        file_size: req.file.size,
        file_type: req.body.type,
      });
    }

    await mobile.save();

    res.json({ message: 'Запись успешно создана', mobile });
  } catch (err) {
    console.error('Ошибка при создании записи:', err);
    res.status(500).json({ message: 'Ошибка при создании записи' });
  }
};

export const getAllMobiles = async (req, res) => {
  try {
    const { page = 1, limit = 10, name, startDate, endDate, sortBy = 'upload_date', sortOrder = 'desc' } = req.query;

    const filter = {};
    if (name) filter.name = new RegExp(name, 'i');
    if (startDate || endDate) {
      filter.upload_date = {};
      if (startDate) filter.upload_date.$gte = new Date(startDate);
      if (endDate) {
        const endDateAdjusted = new Date(endDate);
        endDateAdjusted.setDate(endDateAdjusted.getDate() + 1);
        filter.upload_date.$lte = endDateAdjusted;
      }
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const mobiles = await MobileModel.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    const total = await MobileModel.countDocuments(filter);

    res.json({
      mobiles,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (err) {
    console.error("Ошибка при получении записей:", err);
    res.status(500).json({ message: "Ошибка при получении записей" });
  }
};

export const getMobileById = async (req, res) => {
  try {
    const mobile = await MobileModel.findById(req.params.id);
    if (!mobile) {
      return res.status(404).json({ message: "Запись не найдена" });
    }
    res.json(mobile);
  } catch (err) {
    console.error("Ошибка при получении записи:", err);
    res.status(500).json({ message: "Ошибка при получении записи" });
  }
};

export const downloadMobile = async (req, res) => {
  try {
    const mobile = await MobileModel.findById(req.params.id);
    if (!mobile) {
      return res.status(404).json({ message: "Запись не найдена" });
    }

    const fileIndex = req.query.fileIndex ? parseInt(req.query.fileIndex, 10) : 0;
    if (!mobile.files[fileIndex]) {
      return res.status(404).json({ message: "Файл не найден" });
    }

    const file = mobile.files[fileIndex];
    const filePath = path.join(__dirname, '..', file.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Файл не найден на сервере" });
    }

    res.download(filePath, file.file_name);
  } catch (err) {
    console.error("Ошибка при скачивании файла:", err);
    res.status(500).json({ message: "Ошибка при скачивании файла" });
  }
};

export const deleteMobile = async (req, res) => {
  try {
    const mobile = await MobileModel.findById(req.params.id);
    if (!mobile) {
      return res.status(404).json({ message: "Запись не найдена" });
    }

    const uploadDir = path.join(__dirname, '..', 'Uploads', 'mobile', mobile._id.toString());
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }

    await MobileModel.findByIdAndDelete(req.params.id);

    res.json({ message: "Запись успешно удалена" });
  } catch (err) {
    console.error("Ошибка при удалении записи:", err);
    res.status(500).json({ message: "Ошибка при удалении записи" });
  }
};

export const updateMobile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Обязательное поле: name' });
    }

    const mobile = await MobileModel.findById(id);
    if (!mobile) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    mobile.name = name;
    mobile.description = description || '';
    await mobile.save();

    res.json({ message: 'Запись успешно обновлена', mobile });
  } catch (err) {
    console.error('Ошибка при обновлении записи:', err);
    res.status(500).json({ message: 'Ошибка при обновлении записи' });
  }
};

export const addMobileFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Файл не предоставлен' });
    }
    if (!type) {
      return res.status(400).json({ message: 'Тип файла обязателен' });
    }

    const mobile = await MobileModel.findById(id);
    if (!mobile) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    const uploadDir = path.join(__dirname, '..', 'Uploads', 'mobile', mobile._id.toString());
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    const filePath = path.join(uploadDir, fileName);

    if (fs.existsSync(filePath)) {
      return res.status(400).json({ message: `Файл с именем "${fileName}" уже существует` });
    }

    fs.writeFileSync(filePath, req.file.buffer);

    mobile.files.push({
      file_path: `Uploads/mobile/${mobile._id}/${fileName}`,
      file_name: fileName,
      file_size: req.file.size,
      file_type: type,
      created_date: new Date(),
    });

    await mobile.save();

    res.json({ message: 'Файл успешно добавлен', mobile });
  } catch (err) {
    console.error('Ошибка при добавлении файла:', err);
    res.status(500).json({ message: 'Ошибка при добавлении файла' });
  }
};

export const deleteMobileFile = async (req, res) => {
  try {
    const { id } = req.params;
    const mobile = await MobileModel.findOne({ 'files._id': id });
    if (!mobile) {
      return res.status(404).json({ message: 'Файл не найден' });
    }

    const file = mobile.files.find((f) => f._id.toString() === id);
    if (!file) {
      return res.status(404).json({ message: 'Файл не найден' });
    }

    const filePath = path.join(__dirname, '..', file.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    mobile.files = mobile.files.filter((f) => f._id.toString() !== id);
    await mobile.save();

    res.json({ message: 'Файл успешно удалён' });
  } catch (err) {
    console.error('Ошибка при удалении файла:', err);
    res.status(500).json({ message: 'Ошибка при удалении файла' });
  }
};

export const MobileController = {
  uploadMobile,
  getAllMobiles,
  getMobileById,
  downloadMobile,
  deleteMobile,
  updateMobile,
  addMobileFile,
  deleteMobileFile,
};