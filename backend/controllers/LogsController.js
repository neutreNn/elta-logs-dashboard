import OperatorSettingsModel from "../models/OperatorSettingsSchema.js";
import CalibrationEntryModel from "../models/CalibrationEntrySchema.js";
import ErrorLogModel from "../models/ErrorLogSchema.js";
import OperatorNameModel from "../models/OperatorNameSchema.js";
import { StandsController } from "./StandsController.js";
import StandIdSchema from "../models/StandIdSchema.js";

// Функция для преобразования версии из "4.5.1" -> [4, 5, 1]
const parseVersion = (version) => {
  return version.split('.').map(num => parseInt(num, 10));
};

// Получение всех настроек операторов с фильтрацией и пагинацией
export const getAllOperatorSettings = async (req, res) => {
  try {
    const { 
      operator_name, 
      software_version_stand, 
      hardware_version_stand, 
      serial_number_ob_jlink, 
      stand_id, 
      device_type, 
      device_firmware_version_min, 
      device_firmware_version_max, 
      application_start_time_from, 
      application_start_time_to, 
      sort = '-createdAt', 
      page = 1, 
      limit = 10 
    } = req.query;

    const filter = {};

    if (operator_name) filter["operator_name"] = operator_name;
    if (software_version_stand) filter["software_version_stand"] = software_version_stand;
    if (hardware_version_stand) filter["hardware_version_stand"] = hardware_version_stand;
    if (serial_number_ob_jlink) filter["serial_number_ob_jlink"] = serial_number_ob_jlink;
    if (stand_id) filter["stand_id"] = stand_id;
    if (device_type) filter["device_type"] = device_type;

    if (device_firmware_version_min || device_firmware_version_max) {
      const minVersion = device_firmware_version_min ? parseVersion(device_firmware_version_min) : null;
      const maxVersion = device_firmware_version_max ? parseVersion(device_firmware_version_max) : null;

      filter["device_firmware_version_parsed"] = {
        $exists: true,
      };

      if (minVersion) filter["device_firmware_version_parsed"]['$gte'] = minVersion;
      if (maxVersion) filter["device_firmware_version_parsed"]['$lte'] = maxVersion;
    }

    // Обработка дат для фильтрации
    if (application_start_time_from || application_start_time_to) {
      filter["application_start_time"] = {};
      
      // Преобразуем формат ГГГГ-ММ-ДД в ДД.ММ.ГГГГ
      if (application_start_time_from) {
        // Формат из формы: "2025-02-10"
        // Преобразуем в "10.02.2025 00:00:00"
        const parts = application_start_time_from.split('-');
        if (parts.length === 3) {
          const formattedDateFrom = `${parts[2]}.${parts[1]}.${parts[0]} 00:00:00`;
          filter["application_start_time"].$gte = formattedDateFrom;
        }
      }
      
      if (application_start_time_to) {
        // Формат из формы: "2025-02-15"
        // Преобразуем в "15.02.2025 23:59:59"
        const parts = application_start_time_to.split('-');
        if (parts.length === 3) {
          const formattedDateTo = `${parts[2]}.${parts[1]}.${parts[0]} 23:59:59`;
          filter["application_start_time"].$lte = formattedDateTo;
        }
      }
    }

    console.log("Формируемый фильтр запроса:", filter);

    // Получаем настройки операторов с применением фильтров
    const operatorSettings = await OperatorSettingsModel.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();
    
    // Получаем количество ошибок и общее количество записей для каждого оператора
    const enrichedOperatorSettings = await Promise.all(operatorSettings.map(async (os) => {
      const entriesCount = await CalibrationEntryModel.countDocuments({ 
        operator_settings_id: os._id 
      });
      
      const errorCount = await CalibrationEntryModel.countDocuments({ 
        operator_settings_id: os._id,
        error_detected: true 
      });
      
      return {
        ...os.toObject(),
        entriesCount,
        hasErrors: errorCount > 0
      };
    }));
    
    const total = await OperatorSettingsModel.countDocuments(filter);

    res.json({
      operatorSettings: enrichedOperatorSettings,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error("Ошибка при получении настроек операторов:", err);
    res.status(500).json({ message: 'Ошибка получения настроек операторов' });
  }
};

// Получение одной настройки оператора по ID
export const getOneOperatorSettings = async (req, res) => {
  try {
    const operatorSettings = await OperatorSettingsModel.findById(req.params.id);
    if (!operatorSettings) {
      return res.status(404).json({ message: "Настройки оператора не найдены" });
    }
    
    const entriesCount = await CalibrationEntryModel.countDocuments({ 
      operator_settings_id: operatorSettings._id 
    });
    
    const errorCount = await CalibrationEntryModel.countDocuments({ 
      operator_settings_id: operatorSettings._id,
      error_detected: true 
    });
    
    const result = {
      ...operatorSettings.toObject(),
      entriesCount,
      hasErrors: errorCount > 0
    };
    
    res.json(result);
  } catch (err) {
    console.error("Ошибка при получении настроек оператора:", err);
    res.status(500).json({ message: "Ошибка при получении настроек оператора" });
  }
};

// Получение калибровочных записей для конкретного оператора с пагинацией
export const getCalibrationEntriesByOperatorId = async (req, res) => {
  try {
    const operatorId = req.params.id;
    const { page = 1, limit = 20 } = req.query;
    
    // Проверяем существование оператора
    const operatorSettings = await OperatorSettingsModel.findById(operatorId);
    if (!operatorSettings) {
      return res.status(404).json({ message: "Настройки оператора не найдены" });
    }
    
    // Получаем записи с пагинацией
    const entries = await CalibrationEntryModel.find({ operator_settings_id: operatorId })
      .sort('start_time')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();
      
    const total = await CalibrationEntryModel.countDocuments({ operator_settings_id: operatorId });
    
    res.json({
      entries,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error("Ошибка при получении calibration_entries:", err);
    res.status(500).json({ message: "Ошибка при получении данных калибровки" });
  }
};

// Создание новой записи (оператор + калибровочные данные)
export const createLogEntry = async (req, res) => {
  try {
    console.log("Полученные данные:", req.body);
    
    // 1. Создаем OperatorSettings
    const operatorSettingsData = req.body.operator_settings || {};
    
    // Парсим прошивку
    if (operatorSettingsData.device_firmware_version) {
      operatorSettingsData.device_firmware_version_parsed = parseVersion(operatorSettingsData.device_firmware_version);
    }
    
    const operatorSettings = new OperatorSettingsModel(operatorSettingsData);
    const savedOperatorSettings = await operatorSettings.save();
    
    // Проверяем и добавляем оператора в список операторов, если он новый
    const operatorName = operatorSettingsData.operator_name?.trim();
    if (operatorName) {
      const exists = await OperatorNameModel.findOne({ name: operatorName });
      if (!exists) {
        try {
          await OperatorNameModel.create({ name: operatorName });
          console.log(`Добавлен новый оператор: ${operatorName}`);
        } catch (e) {
          console.warn("Ошибка при добавлении нового оператора:", e.message);
        }
      }
    }

    const standId = operatorSettingsData.stand_id?.trim();
    if (standId) {
      const standExists = await StandIdSchema.findOne({ standId });
      if (!standExists) {
        try {
          await StandIdSchema.create({ standId });
          console.log(`Добавлен новый стенд: ${standId}`);
        } catch (e) {
          console.warn("Ошибка при добавлении нового стенда:", e.message);
        }
      }
    }
    
    // 2. Обрабатываем calibration_entries
    const entries = req.body.calibration_entries || [];
    
    // Создаем записи calibration_entries
    if (Array.isArray(entries) && entries.length > 0) {
      const entriesWithSettingsId = entries.map(entry => ({
        ...entry,
        operator_settings_id: savedOperatorSettings._id
      }));
      
      // Проверяем наличие ошибок
      const hasErrors = entries.some(entry => entry.error_detected === true);
      
      // Создаем записи в базе
      await CalibrationEntryModel.insertMany(entriesWithSettingsId);
      
      // Если есть ошибки, создаем записи в ErrorLog
      if (hasErrors) {
        console.log("Найдено логов с ошибками:", entries.filter(e => e.error_detected).length);
        
        const entriesWithError = entries.filter(entry => entry.error_detected === true);
        
        // Формируем данные для ErrorLog
        const errorLogData = entriesWithError.map(entry => ({
          parent_log_id: savedOperatorSettings._id,
          start_time: entry.start_time ?? null,
          calibration_source: entry.calibration_source ?? null,
          
          operator_name: operatorSettingsData.operator_name ?? null,
          software_version_stand: operatorSettingsData.software_version_stand ?? null,
          hardware_version_stand: operatorSettingsData.hardware_version_stand ?? null,
          serial_number_ob_jlink: operatorSettingsData.serial_number_ob_jlink ?? null,
          stand_id: operatorSettingsData.stand_id ?? null,
          device_type: operatorSettingsData.device_type ?? null,
          device_firmware_version: operatorSettingsData.device_firmware_version ?? null,
          device_firmware_version_parsed: operatorSettingsData.device_firmware_version_parsed ?? [],
        }));
        
        await ErrorLogModel.insertMany(errorLogData);
        console.log('Лог(и) с ошибками успешно добавлены');
      }
    }
    
    // Обновление данных стенда, если есть stand_id
    if (operatorSettingsData.stand_id) {
      try {
        // Изменяем формат данных для соответствия ожиданиям StandsController
        const modifiedData = {
          operator_settings: operatorSettingsData,
          calibration_entries: entries
        };
        await StandsController.createOrUpdateStandFromLog(modifiedData);
      } catch (standErr) {
        console.error("Ошибка при создании/обновлении стенда:", standErr);
      }
    }
    
    // Подсчитываем количество записей и ошибок для ответа
    const entriesCount = entries.length;
    const hasErrors = entries.some(entry => entry.error_detected === true);
    
    // Возвращаем результат
    const result = {
      ...savedOperatorSettings.toObject(),
      entriesCount,
      hasErrors
    };
    
    res.status(201).json(result);
  } catch (err) {
    console.error("Ошибка при создании лога:", err);
    res.status(500).json({ message: "Ошибка при создании лога", error: err.message });
  }
};

// Удаление записи и всех связанных данных
export const removeLogEntry = async (req, res) => {
  try {
    const operatorId = req.params.id;
    
    const operatorSettings = await OperatorSettingsModel.findById(operatorId);
    if (!operatorSettings) {
      return res.status(404).json({ message: "Настройки оператора не найдены" });
    }
    
    // Удаляем связанные calibration_entries
    await CalibrationEntryModel.deleteMany({ operator_settings_id: operatorId });
    
    // Удаляем связанные error logs
    await ErrorLogModel.deleteMany({ operator_settings_id: operatorId });
    
    // Удаляем operatorSettings
    await OperatorSettingsModel.findByIdAndDelete(operatorId);
    
    res.json({ message: "Лог и связанные данные удалены" });
  } catch (err) {
    console.error("Ошибка при удалении лога:", err);
    res.status(500).json({ message: "Ошибка при удалении лога" });
  }
};

export const LogsController = { 
  getAllOperatorSettings, 
  getOneOperatorSettings, 
  getCalibrationEntriesByOperatorId,
  createLogEntry, 
  removeLogEntry
};