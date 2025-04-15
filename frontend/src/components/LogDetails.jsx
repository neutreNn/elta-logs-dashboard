import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Typography, 
  Paper, 
  Grid, 
  Box, 
  TablePagination 
} from '@mui/material';
import CalibrationEntry from './CalibrationEntry';
import ErrorMessage from './common/ErrorMessage';
import CircleLoader from './common/CircleLoader';
import { 
  useGetOperatorByIdQuery, 
  useGetCalibrationEntriesByOperatorIdQuery 
} from '../api/apiLogs';

function LogDetails() {
  const { logId } = useParams();
  const [calibrationParams, setCalibrationParams] = useState({
    page: 1,
    limit: 10
  });
  
  // Запрос данных оператора
  const { 
    data: operatorData, 
    isLoading: isOperatorLoading, 
    isError: isOperatorError 
  } = useGetOperatorByIdQuery(logId);
  
  // Запрос калибровочных данных с пагинацией
  const { 
    data: calibrationData, 
    isLoading: isCalibrationLoading, 
    isError: isCalibrationError 
  } = useGetCalibrationEntriesByOperatorIdQuery({
    operatorId: logId,
    page: calibrationParams.page,
    limit: calibrationParams.limit
  });

  // Обработка смены страницы для калибровочных данных
  const handleChangePage = (event, newPage) => {
    setCalibrationParams({
      ...calibrationParams,
      page: newPage + 1,
    });
  };

  // Обработка изменения количества записей на странице
  const handleChangeRowsPerPage = (event) => {
    setCalibrationParams({
      ...calibrationParams,
      limit: parseInt(event.target.value, 10),
      page: 1,
    });
  };

  if (isOperatorLoading || isCalibrationLoading) return <CircleLoader />;
  if (isOperatorError || isCalibrationError) return <ErrorMessage />;

  // Получаем корректные данные
  const operatorSettings = operatorData || {};
  const calibrationEntries = calibrationData?.entries || [];
  const totalCalibrationItems = calibrationData?.total || 0;

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 2 }}>
      {/* Блок с оператором и настройками */}
      <Paper sx={{ padding: 2, marginBottom: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom><strong>Настройки оператора</strong></Typography>
        <Grid container spacing={3}>
          {/* Левый столбец */}
          <Grid item xs={12} sm={6}>
            <Typography gutterBottom><strong>Оператор:</strong> {operatorSettings.operator_name || 'Не указан'}</Typography>
            <Typography gutterBottom><strong>Дата запуска:</strong> {operatorSettings.application_start_time || 'Не указана'}</Typography>
            <Typography gutterBottom><strong>СОМ порты:</strong> {operatorSettings.com_ports?.join(', ') || 'Не указан'}</Typography>
            <Typography gutterBottom><strong>Программная версия стенда:</strong> {operatorSettings.software_version_stand || 'Нет данных'}</Typography>
            <Typography gutterBottom><strong>Аппаратная версия стенда:</strong> {operatorSettings.hardware_version_stand || 'Нет данных'}</Typography>
          </Grid>

          {/* Правый столбец */}
          <Grid item xs={12} sm={6}>
            <Typography gutterBottom><strong>Серийный номер OB-JLINK:</strong> {operatorSettings.serial_number_ob_jlink || 'Нет данных'}</Typography>
            <Typography gutterBottom><strong>ID стенда:</strong> {operatorSettings.stand_id || 'Нет данных'}</Typography>
            <Typography gutterBottom><strong>Тип прибора:</strong> {operatorSettings.device_type || 'Нет данных'}</Typography>
            <Typography gutterBottom><strong>Записываемая в прибор версия ПО:</strong> {operatorSettings.device_firmware_version || 'Нет данных'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Заголовок блока калибровок */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="h6"><strong>Данные по калибровкам</strong></Typography>
        <TablePagination
          component="div"
          count={totalCalibrationItems}
          page={calibrationParams.page - 1}
          onPageChange={handleChangePage}
          rowsPerPage={calibrationParams.limit}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Записей на странице:"
        />
      </Box>

      {/* Блок с данными калибровки */}
      {calibrationEntries.length > 0 ? (
        calibrationEntries.map((calibration, idx) => (
          <CalibrationEntry 
            key={calibration._id || idx} 
            calibration={calibration} 
            index={idx + (calibrationParams.page - 1) * calibrationParams.limit} 
          />
        ))
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">Нет данных по калибровке</Typography>
        </Paper>
      )}
    </Box>
  );
}

export default LogDetails;