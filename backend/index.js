import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import { LogsController } from './controllers/LogsController.js';
import { LogsErrorsController } from './controllers/LogsErrorsController.js';
import { OperatorsController } from './controllers/OperatorsController.js';
import { StandsController } from './controllers/StandsController.js';
import { StandIdsController } from './controllers/StandIdController.js';

dotenv.config();

mongoose.connect('mongodb+srv://qwerty:qwerty123@cluster0.qlftfsl.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
    console.log('DB ok');
})
.catch((err) => {
    console.log('DB error', err);
});

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Маршруты для логов
app.get('/logs/successful-calibration', LogsController.getSuccessfulCalibrationStats);
app.get('/logs', LogsController.getAllOperatorSettings);
app.get('/logs/:id', LogsController.getOneOperatorSettings);
app.post('/logs', LogsController.createLogEntry);
app.delete('/logs/:id', LogsController.removeLogEntry);
app.get('/logs/:id/calibration-entries', LogsController.getCalibrationEntriesByOperatorId);

// Маршруты для ошибок
app.get('/logs-errors', LogsErrorsController.getAllLogsErrors);
app.get('/logs-errors/unviewed', LogsErrorsController.hasUnviewedErrors);
app.put('/logs-errors/mark-viewed', LogsErrorsController.markAllErrorsAsViewed);

// Маршруты для выпадающих списков
app.get('/operators', OperatorsController.getOperatorNames);
app.get('/stand-ids', StandIdsController.getStandIds);

// Маршруты для стендов
app.get('/stands', StandsController.getAllStands);
app.get('/stands/:id', StandsController.getStandById);
app.get('/stands/by-stand-id/:standId', StandsController.getStandByStandId);
app.post('/stands', StandsController.createStand);
app.put('/stands/:id', StandsController.updateStand);
app.post('/stands/:id/repair', StandsController.addRepairRecord);
app.delete('/stands/:id', StandsController.removeStand);

app.listen(4444, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('Server OK');
});
