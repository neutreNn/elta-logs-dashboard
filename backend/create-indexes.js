// ===== ИНДЕКСЫ ДЛЯ КОЛЛЕКЦИИ operatorsettings =====

// 1. Составной индекс для основных полей фильтрации
db.operatorsettings.createIndex({
  "operator_name": 1,
  "application_start_time": -1
});

// 2. Индекс для фильтрации по датам (часто используется)
db.operatorsettings.createIndex({
  "application_start_time": -1
});

// 3. Индексы для отдельных полей фильтрации
db.operatorsettings.createIndex({ "stand_id": 1 });
db.operatorsettings.createIndex({ "device_type": 1 });
db.operatorsettings.createIndex({ "software_version_stand": 1 });
db.operatorsettings.createIndex({ "hardware_version_stand": 1 });
db.operatorsettings.createIndex({ "serial_number_ob_jlink": 1 });

// 4. Индекс для сравнения версий прошивки
db.operatorsettings.createIndex({ "device_firmware_version_parsed": 1 });

// ===== ИНДЕКСЫ ДЛЯ КОЛЛЕКЦИИ calibrationentries =====

// 1. Главный индекс - связка с operator_settings (самый важный!)
db.calibrationentries.createIndex({ "operator_settings_id": 1 });

// 2. Составной индекс для получения записей оператора с сортировкой
db.calibrationentries.createIndex({
  "operator_settings_id": 1,
  "start_time": 1
});

// 3. Индекс для подсчёта ошибок
db.calibrationentries.createIndex({
  "operator_settings_id": 1,
  "error_detected": 1
});

// 4. Индекс для фильтрации по датам в статистике
db.calibrationentries.createIndex({ "start_time": 1 });

// 5. Составной индекс для статистики успешных калибровок
db.calibrationentries.createIndex({
  "calibration_successful": 1,
  "start_time": 1
});

// 6. Индексы для фильтрации в статистике
db.calibrationentries.createIndex({ "stand_id": 1 });
db.calibrationentries.createIndex({ "device_type": 1 });
db.calibrationentries.createIndex({ "operator_name": 1 });
db.calibrationentries.createIndex({ "device_firmware_version_parsed": 1 });

// ===== ИНДЕКСЫ ДЛЯ КОЛЛЕКЦИИ errorlogs =====

// 1. Связка с родительским логом
db.errorlogs.createIndex({ "parent_log_id": 1 });

// 2. Индекс для непросмотренных ошибок
db.errorlogs.createIndex({ "viewed": 1 });

// 3. Составной индекс для фильтрации ошибок
db.errorlogs.createIndex({
  "parent_log_id": 1,
  "viewed": 1
});

// 4. Индекс по времени возникновения ошибок
db.errorlogs.createIndex({ "start_time": -1 });

// ===== ДОПОЛНИТЕЛЬНЫЕ ИНДЕКСЫ ДЛЯ СПРАВОЧНИКОВ =====

// Для уникальности имён операторов
db.operatornames.createIndex({ "name": 1 }, { unique: true });

// Для уникальности ID стендов  
db.standids.createIndex({ "standId": 1 }, { unique: true });

// ===== КОМАНДЫ ДЛЯ ПРОВЕРКИ СОЗДАННЫХ ИНДЕКСОВ =====

// Просмотр всех индексов коллекции:
// db.operatorsettings.getIndexes()
// db.calibrationentries.getIndexes()
// db.errorlogs.getIndexes()

// Анализ использования индексов (после работы приложения):
// db.operatorsettings.aggregate([{$indexStats:{}}])
// db.calibrationentries.aggregate([{$indexStats:{}}])

console.log("Индексы созданы успешно!");
console.log("Для проверки выполните: db.коллекция.getIndexes()");