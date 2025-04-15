import ErrorLogModel from "../models/ErrorLogSchema.js";

// Функция для преобразования версии из "4.5.1" -> [4, 5, 1]
const parseVersion = (version) => {
  return version.split('.').map(num => parseInt(num, 10));
};

export const getAllLogsErrors = async (req, res) => {
  try {
    const { 
      serial_number,
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
      limit = 10,
    } = req.query;

    const filter = {};

    // Фильтрация по serial_number
    if (serial_number) filter["serial_number"] = serial_number;

    // Фильтрация по operator_name (если оно не в operator_settings)
    if (operator_name) filter["operator_name"] = operator_name;

    // Фильтрация по software_version_stand (если оно не в operator_settings)
    if (software_version_stand) filter["software_version_stand"] = software_version_stand;

    // Фильтрация по hardware_version_stand (если оно не в operator_settings)
    if (hardware_version_stand) filter["hardware_version_stand"] = hardware_version_stand;

    // Фильтрация по serial_number_ob_jlink
    if (serial_number_ob_jlink) filter["serial_number_ob_jlink"] = serial_number_ob_jlink;

    // Фильтрация по stand_id
    if (stand_id) filter["stand_id"] = stand_id;

    // Фильтрация по device_type
    if (device_type) filter["device_type"] = device_type;

    // Фильтрация по device_firmware_version_min и device_firmware_version_max
    if (device_firmware_version_min || device_firmware_version_max) {
      const minVersion = device_firmware_version_min ? parseVersion(device_firmware_version_min) : null;
      const maxVersion = device_firmware_version_max ? parseVersion(device_firmware_version_max) : null;

      filter["device_firmware_version_parsed"] = {
          $exists: true,
      };

      if (minVersion) filter["device_firmware_version_parsed"]['$gte'] = minVersion;
      if (maxVersion) filter["device_firmware_version_parsed"]['$lte'] = maxVersion;
    }

    // Фильтрация по application_start_time_from и application_start_time_to
    if (application_start_time_from || application_start_time_to) {
      filter["start_time"] = {};
      
      // Преобразуем формат ГГГГ-ММ-ДД в ДД.ММ.ГГГГ
      if (application_start_time_from) {
          // Формат из формы: "2025-02-10"
          // Преобразуем в "10.02.2025 00:00:00"
          const parts = application_start_time_from.split('-');
          if (parts.length === 3) {
              const formattedDateFrom = `${parts[2]}.${parts[1]}.${parts[0]} 00:00:00`;
              filter["start_time"].$gte = formattedDateFrom;
          }
      }
      
      if (application_start_time_to) {
          // Формат из формы: "2025-02-15"
          // Преобразуем в "15.02.2025 23:59:59"
          const parts = application_start_time_to.split('-');
          if (parts.length === 3) {
              const formattedDateTo = `${parts[2]}.${parts[1]}.${parts[0]} 23:59:59`;
              filter["start_time"].$lte = formattedDateTo;
          }
      }
    }

    console.log("Формируемый фильтр запроса ошибок:", filter);

    // Запрос на получение ошибок с пагинацией
    const logs = await ErrorLogModel.find(filter)
      .sort(sort) // Сортировка
      .skip((page - 1) * limit) // Пропуск страниц
      .limit(Number(limit)) // Лимитирование
      .exec();

    const total = await ErrorLogModel.countDocuments(filter); // Подсчет общего числа

    res.json({
      logs,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error("Ошибка при получении логов ошибок:", err);
    res.status(500).json({ message: "Ошибка при получении логов ошибок" });
  }
};

// Проверка наличия непросмотренных ошибок
export const hasUnviewedErrors = async (req, res) => {
  try {
    // Проверяем существование хотя бы одной непросмотренной записи
    const hasUnviewed = await ErrorLogModel.findOne({ viewed: false }).limit(1);
    
    // Возвращаем булево значение - есть ли непросмотренные ошибки
    res.json({ hasUnviewed: Boolean(hasUnviewed) });
  } catch (err) {
    console.error("Ошибка при проверке непросмотренных ошибок:", err);
    res.status(500).json({ message: "Ошибка при проверке непросмотренных ошибок" });
  }
};

// Отметка всех ошибок как просмотренных
export const markAllErrorsAsViewed = async (req, res) => {
  try {
    // Обновляем все записи с viewed: false на viewed: true
    const result = await ErrorLogModel.updateMany(
      { viewed: false }, 
      { $set: { viewed: true } }
    );
    
    res.json({ 
      success: true, 
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} ошибок отмечены как просмотренные`
    });
  } catch (err) {
    console.error("Ошибка при отметке всех ошибок как просмотренных:", err);
    res.status(500).json({ 
      success: false,
      message: "Ошибка при отметке всех ошибок как просмотренных" 
    });
  }
};

export const LogsErrorsController = { 
  getAllLogsErrors, 
  hasUnviewedErrors, 
  markAllErrorsAsViewed 
};
