import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FirmwareModel from "../models/FirmwareSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isValidDate = (date) => {
  return date && date instanceof Date && !isNaN(date) && date.getFullYear() > 1970;
};

const parseVersion = (version) => {
  if (!version || typeof version !== 'string' || version.trim() === '') {
    throw new Error('Некорректная версия: версия должна быть непустой строкой');
  }
  const versionParts = version.split('.').map(num => {
    const parsed = parseInt(num, 10);
    if (isNaN(parsed) || parsed < 0) {
      throw new Error(`Некорректная версия: ${version} содержит нечисловые или отрицательные компоненты`);
    }
    return parsed;
  });
  if (versionParts.length !== 3) {
    throw new Error(`Некорректная версия: ${version} должна быть в формате X.Y.Z`);
  }
  return versionParts;
};

const compareVersions = (v1, v2) => {
  const v1Parts = parseVersion(v1);
  const v2Parts = parseVersion(v2);
  
  for (let i = 0; i < 3; i++) {
    const part1 = v1Parts[i] || 0;
    const part2 = v2Parts[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
};

export const uploadFirmware = async (req, res) => {
  try {
    const { 
      name, 
      version, 
      type, 
      subType, 
      description, 
      created_date 
    } = req.body;

    console.log('Upload firmware request:', { name, version, type, subType, description, created_date });

    if (!name || !version || !type || !subType || !created_date) {
      return res.status(400).json({ message: 'Обязательные поля: name, version, type, subType, created_date' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Файл прошивки не загружен' });
    }

    let versionParsed;
    try {
      versionParsed = parseVersion(version);
      console.log('Parsed version:', versionParsed);
    } catch (parseError) {
      return res.status(400).json({ message: parseError.message });
    }

    let parsedCreatedDate = new Date(created_date);
    if (!isValidDate(parsedCreatedDate)) {
      return res.status(400).json({ message: 'Некорректная дата создания' });
    }

    const filter = { type, subType, version };
    const existingFirmware = await FirmwareModel.findOne(filter);
    if (existingFirmware) {
      return res.status(400).json({ 
        message: `Прошивка с типом "${type}", подтипом "${subType}" и версией "${version}" уже существует` 
      });
    }

    const baseDir = path.join(__dirname, '../Uploads/firmware');
    const typeDir = path.join(baseDir, type);

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }

    const originalExt = path.extname(req.file.originalname);
    const fileName = `${name}_${version}${path.extname(req.file.originalname)}`;
    const filePath = path.join(typeDir, fileName);

    fs.writeFileSync(filePath, req.file.buffer);

    const firmwareData = {
      name,
      version,
      type,
      subType,
      version_parsed: parseVersion(version),
      file_path: `/Uploads/firmware/${type}/${fileName}`,
      file_size: req.file.size,
      description: description || '',
      created_date: parsedCreatedDate
    };

    const firmware = new FirmwareModel(firmwareData);
    const savedFirmware = await firmware.save();

    res.status(201).json(savedFirmware);
  } catch (err) {
    console.error("Ошибка при загрузке прошивки:", err);
    res.status(500).json({ message: "Ошибка при загрузке прошивки", error: err.message });
  }
};

export const getAllFirmwares = async (req, res) => {
  try {
    const { 
      type, 
      subType,
      version,
      name,
      min_upload_date,
      max_upload_date,
      sort = '-createdAt', 
      page = 1, 
      limit = 10 
    } = req.query;

    const filter = {};

    if (type) {
      filter.type = type;
    }
    
    if (subType) {
      filter.subType = subType;
    }
    
    if (version) filter.version = version;
    
    if (name) filter.name = { $regex: name, $options: 'i' };
    
    if (min_upload_date || max_upload_date) {
      filter.upload_date = {};
      
      if (min_upload_date) {
        filter.upload_date.$gte = new Date(min_upload_date);
      }
      
      if (max_upload_date) {
        const endDate = new Date(max_upload_date);
        endDate.setHours(23, 59, 59, 999);
        filter.upload_date.$lte = endDate;
      }
    }

    const firmwares = await FirmwareModel.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    const total = await FirmwareModel.countDocuments(filter);

    res.json({
      firmwares,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (err) {
    console.error("Ошибка при получении прошивок:", err);
    res.status(500).json({ message: "Ошибка при получении прошивок" });
  }
};

export const getFirmwareById = async (req, res) => {
  try {
    const firmware = await FirmwareModel.findById(req.params.id);
    if (!firmware) {
      return res.status(404).json({ message: "Прошивка не найдена" });
    }
    res.json(firmware);
  } catch (err) {
    console.error("Ошибка при получении прошивки:", err);
    res.status(500).json({ message: "Ошибка при получении прошивки" });
  }
};

export const checkForUpdates = async (req, res) => {
  try {
    const { 
      firmware_type,
      subType,
      current_version,
      target_version
    } = req.query;

    if (!firmware_type) {
      return res.status(400).json({ 
        message: "Тип прошивки обязателен",
        has_updates: false 
      });
    }
    if (!subType) {
      return res.status(400).json({ 
        message: "Подтип обязателен для всех типов прошивок",
        has_updates: false 
      });
    }
    if (!current_version) {
      return res.status(400).json({ 
        message: "Текущая версия (current_version) обязательна",
        has_updates: false 
      });
    }

    try {
      parseVersion(current_version);
    } catch (err) {
      return res.status(400).json({ 
        message: `Некорректный формат current_version: ${current_version}. Используйте X.Y.Z`,
        has_updates: false 
      });
    }
    if (target_version) {
      try {
        parseVersion(target_version);
      } catch (err) {
        return res.status(400).json({ 
          message: `Некорректный формат target_version: ${target_version}. Используйте X.Y.Z`,
          has_updates: false 
        });
      }
    }

    // Проверка: target_version не может быть меньше current_version
    if (target_version && compareVersions(current_version, target_version) >= 0) {
      return res.status(400).json({ 
        message: "target_version должен быть больше current_version",
        has_updates: false 
      });
    }

    const filter = { type: firmware_type, subType };

    let allFirmwares = await FirmwareModel.find(filter).sort('version_parsed');

    let filteredFirmwares = allFirmwares.filter(fw => {
      const aboveCurrent = compareVersions(fw.version, current_version) > 0;
      const belowOrEqualTarget = target_version ? compareVersions(fw.version, target_version) <= 0 : true;
      return aboveCurrent && belowOrEqualTarget;
    });

    const hasUpdates = filteredFirmwares.length > 0;

    if (!hasUpdates) {
      return res.json({ 
        has_updates: false,
        message: target_version 
          ? "Нет прошивок в диапазоне от current_version до target_version"
          : "Обновления не требуются"
      });
    }

    const firmwaresToInstall = filteredFirmwares.map(fw => ({
      _id: fw._id,
      name: fw.name,
      version: fw.version,
      subType: fw.subType,
      description: fw.description,
      download_url: `/firmware/download/${fw._id}`,
      file_size: fw.file_size
    }));

    const response = {
      has_updates: true,
      firmwares: firmwaresToInstall,
      updates_count: filteredFirmwares.length,
      latest_version: filteredFirmwares[filteredFirmwares.length - 1].version,
      current_version,
    };
    if (target_version) response.target_version = target_version;

    res.json(response);
  } catch (err) {
    console.error("Ошибка при проверке обновлений:", err);
    res.status(500).json({ 
      message: "Ошибка при проверке обновлений",
      has_updates: false,
      error: err.message 
    });
  }
};

export const downloadFirmware = async (req, res) => {
  try {
    const firmware = await FirmwareModel.findById(req.params.id);
    if (!firmware) {
      return res.status(404).json({ message: "Прошивка не найдена" });
    }

    const filePath = path.join(__dirname, '..', firmware.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Файл прошивки не найден" });
    }

    const originalFileName = `${firmware.name}_${firmware.version}${path.extname(filePath)}`;
    
    res.download(filePath, originalFileName);
  } catch (err) {
    console.error("Ошибка при скачивании прошивки:", err);
    res.status(500).json({ message: "Ошибка при скачивании прошивки" });
  }
};

export const deleteFirmware = async (req, res) => {
  try {
    const firmware = await FirmwareModel.findById(req.params.id);
    if (!firmware) {
      return res.status(404).json({ message: "Прошивка не найдена" });
    }

    const filePath = path.join(__dirname, '..', firmware.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await FirmwareModel.findByIdAndDelete(req.params.id);

    res.json({ message: "Прошивка успешно удалена" });
  } catch (err) {
    console.error("Ошибка при удалении прошивки:", err);
    res.status(500).json({ message: "Ошибка при удалении прошивки" });
  }
};

export const FirmwareController = {
  uploadFirmware,
  getAllFirmwares,
  getFirmwareById,
  downloadFirmware,
  checkForUpdates,
  deleteFirmware
};