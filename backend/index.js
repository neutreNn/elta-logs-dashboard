import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

import { LogsController } from './controllers/LogsController.js';
import { LogsErrorsController } from './controllers/LogsErrorsController.js';
import { OperatorsController } from './controllers/OperatorsController.js';
import { StandsController } from './controllers/StandsController.js';
import { StandIdsController } from './controllers/StandIdController.js';
import { UserController } from './controllers/UserController.js';
import { FirmwareController } from './controllers/FirmwareController.js';
import handleValidationErrors from './utils/handleValidationErrors.js';
import checkAuth from './utils/checkAuth.js';
import { loginValidation, registerValidation } from './validation.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log('DB ok');
})
.catch((err) => {
    console.log('DB error', err);
});

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json({ limit: '50mb' }));
app.use(cors());

//Маршруты для авторизации
app.get('/auth/me', checkAuth, UserController.getMe);
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.post('/auth/validate', checkAuth, (req, res) => {
    res.status(200).json({ valid: true });
});

// Маршруты для логов
app.get('/logs/successful-calibration', checkAuth, LogsController.getSuccessfulCalibrationStats);
app.get('/logs', checkAuth, LogsController.getAllOperatorSettings);
app.get('/logs/:id', checkAuth, LogsController.getOneOperatorSettings);
app.post('/logs', LogsController.createLogEntry);
app.delete('/logs/:id', checkAuth, LogsController.removeLogEntry);
app.get('/logs/:id/calibration-entries', checkAuth, LogsController.getCalibrationEntriesByOperatorId);

// Маршруты для ошибок
app.get('/logs-errors', checkAuth, LogsErrorsController.getAllLogsErrors);
app.get('/logs-errors/aggregated-stats', checkAuth, LogsErrorsController.getErrorsAggregatedStats);
app.get('/logs-errors/unviewed', checkAuth, LogsErrorsController.hasUnviewedErrors);
app.put('/logs-errors/mark-viewed', checkAuth, LogsErrorsController.markAllErrorsAsViewed);

// Маршруты для выпадающих списков
app.get('/operators', checkAuth, OperatorsController.getOperatorNames);
app.get('/stand-ids', checkAuth, StandIdsController.getStandIds);

// Маршруты для стендов
app.get('/stands', checkAuth, StandsController.getAllStands);
app.get('/stands/:id', checkAuth, StandsController.getStandById);
app.get('/stands/by-stand-id/:standId', checkAuth, StandsController.getStandByStandId);
app.post('/stands', checkAuth, StandsController.createStand);
app.put('/stands/:id', checkAuth, StandsController.updateStand);
app.post('/stands/:id/repair', checkAuth, StandsController.addRepairRecord);
app.delete('/stands/:id', checkAuth, StandsController.removeStand);

// Маршруты для прошивок
app.get('/firmware/check', FirmwareController.checkForUpdates);
app.get('/firmware', checkAuth, FirmwareController.getAllFirmwares);
app.get('/firmware/:id', checkAuth, FirmwareController.getFirmwareById);
app.get('/firmware/download/:id', FirmwareController.downloadFirmware);
app.post('/firmware', checkAuth, upload.single('file'), FirmwareController.uploadFirmware);
app.delete('/firmware/:id', checkAuth, FirmwareController.deleteFirmware);

app.listen(4444, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('Server OK');
});