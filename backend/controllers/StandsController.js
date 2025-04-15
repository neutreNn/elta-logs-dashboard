import StandModel from "../models/StandSchema.js";

// Получение всех стендов
export const getAllStands = async (req, res) => {
  try {
    const { 
      status, 
      sort = '-created_at', 
      page = 1, 
      limit = 10 
    } = req.query;

    const filter = {};

    // Фильтрация по статусу, если указан
    if (status) {
      filter.status = status;
    }

    const stands = await StandModel.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    const total = await StandModel.countDocuments(filter);

    res.json({
      stands,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (err) {
    console.error("Ошибка при получении стендов:", err);
    res.status(500).json({ message: 'Ошибка получения стендов' });
  }
};

// Получение одного стенда по ID
export const getStandById = async (req, res) => {
  try {
    const stand = await StandModel.findById(req.params.id);
    if (!stand) {
      return res.status(404).json({ message: "Стенд не найден" });
    }
    res.json(stand);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при получении стенда" });
  }
};

// Получение стенда по stand_id
export const getStandByStandId = async (req, res) => {
  try {
    const stand = await StandModel.findOne({ stand_id: req.params.standId });
    if (!stand) {
      return res.status(404).json({ message: "Стенд не найден" });
    }
    res.json(stand);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при получении стенда" });
  }
};

// Создание стенда
export const createStand = async (req, res) => {
  try {
    const { stand_id } = req.body;
    
    // Проверка на существование стенда с таким stand_id
    const existingStand = await StandModel.findOne({ stand_id });
    if (existingStand) {
      return res.status(400).json({ message: "Стенд с таким ID уже существует" });
    }
    
    const stand = new StandModel(req.body);
    const savedStand = await stand.save();
    
    res.status(201).json(savedStand);
  } catch (err) {
    console.error("Ошибка при создании стенда:", err);
    res.status(500).json({ message: "Ошибка при создании стенда", error: err.message });
  }
};

// Обновление стенда
export const updateStand = async (req, res) => {
  try {
    const standId = req.params.id;
    
    // Обновляем поле updated_at
    req.body.updated_at = new Date();
    
    const updatedStand = await StandModel.findByIdAndUpdate(
      standId,
      req.body,
      { new: true } // Возвращает обновленный документ
    );
    
    if (!updatedStand) {
      return res.status(404).json({ message: "Стенд не найден" });
    }
    
    res.json(updatedStand);
  } catch (err) {
    console.error("Ошибка при обновлении стенда:", err);
    res.status(500).json({ message: "Ошибка при обновлении стенда", error: err.message });
  }
};

// Добавление записи о ремонте
export const addRepairRecord = async (req, res) => {
  try {
    const standId = req.params.id;
    const repairData = req.body;
    
    const stand = await StandModel.findById(standId);
    if (!stand) {
      return res.status(404).json({ message: "Стенд не найден" });
    }
    
    stand.repair_history.push(repairData);
    
    // Если ремонт завершен, обновляем статус стенда
    if (repairData.repair_status === 'завершен') {
      stand.status = 'активен';
    } else {
      stand.status = 'в ремонте';
    }
    
    stand.updated_at = new Date();
    
    const updatedStand = await stand.save();
    res.json(updatedStand);
  } catch (err) {
    console.error("Ошибка при добавлении записи о ремонте:", err);
    res.status(500).json({ message: "Ошибка при добавлении записи о ремонте", error: err.message });
  }
};

// Удаление стенда
export const removeStand = async (req, res) => {
  try {
    const stand = await StandModel.findByIdAndDelete(req.params.id);
    if (!stand) {
      return res.status(404).json({ message: "Стенд не найден" });
    }
    res.json({ message: "Стенд удалён" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка при удалении стенда" });
  }
};

// Функция для автоматического создания/обновления стенда из лога
export const createOrUpdateStandFromLog = async (logData) => {
  try {
    if (!logData?.operator_settings?.stand_id) {
      console.log("Невозможно создать стенд: отсутствует stand_id в логе");
      return null;
    }

    const standData = {
      stand_id: logData.operator_settings.stand_id,
      software_version_stand: logData.operator_settings.software_version_stand || "",
      hardware_version_stand: logData.operator_settings.hardware_version_stand || "",
      serial_number_ob_jlink: logData.operator_settings.serial_number_ob_jlink || "",
      last_used: new Date()
    };

    // Пробуем найти стенд по stand_id
    const existingStand = await StandModel.findOne({ stand_id: standData.stand_id });

    if (existingStand) {
      // Если стенд существует, обновляем его данные
      Object.assign(existingStand, standData);
      existingStand.updated_at = new Date();
      
      await existingStand.save();
      console.log(`Стенд ${standData.stand_id} обновлен`);
      return existingStand;
    } else {
      // Если стенд не существует, создаем новый
      const newStand = new StandModel(standData);
      await newStand.save();
      console.log(`Создан новый стенд ${standData.stand_id}`);
      return newStand;
    }
  } catch (err) {
    console.error("Ошибка при создании/обновлении стенда:", err);
    return null;
  }
};

export const StandsController = { 
  getAllStands, 
  getStandById, 
  getStandByStandId, 
  createStand, 
  updateStand, 
  addRepairRecord, 
  removeStand,
  createOrUpdateStandFromLog
};