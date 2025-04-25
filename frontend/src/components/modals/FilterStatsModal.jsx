// components/modals/FilterStatsModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { format } from 'date-fns';
import { useGetOperatorNamesQuery } from '../../api/apiOperators';
import { useGetStandIdsQuery } from '../../api/apiStandIds';

// Константа для типов устройств
const DEVICE_TYPES = [
  { id: null, name: '*Не выбрано*' },
  { id: 'online', name: 'Онлайн' },
  { id: 'express', name: 'Экспресс' },
  { id: 'voice', name: 'Voice' },
];

const FilterStatsModal = ({ open, onClose, onApply, currentFilters }) => {
  const { data: operatorNames = [], isLoadingOperators } = useGetOperatorNamesQuery();
  const { data: standIds = [], isLoadingIds } = useGetStandIdsQuery();
  
  // Измененное состояние для фильтров - только один выбор
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: null,
      endDate: null
    },
    selectedStand: '',
    selectedDeviceType: '',
    selectedOperator: ''
  });
  
  // Инициализация фильтров при открытии модального окна
  useEffect(() => {
    if (open && currentFilters) {
      // Преобразуем месяц и год в объекты даты
      const startDate = new Date(currentFilters.startYear, currentFilters.startMonth, 1);
      
      // Для конечной даты берем последний день месяца
      const endDate = new Date(currentFilters.endYear, currentFilters.endMonth + 1, 0);
      
      setFilters({
        dateRange: {
          startDate,
          endDate
        },
        selectedStand: currentFilters.stand || '',
        selectedDeviceType: currentFilters.deviceType || '',
        selectedOperator: currentFilters.operator || ''
      });
    }
  }, [open, currentFilters]);

  // Обработчики изменения значений дат
  const handleStartDateChange = (date) => {
    setFilters({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        startDate: date
      }
    });
  };

  const handleEndDateChange = (date) => {
    setFilters({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        endDate: date
      }
    });
  };

  // Обработчик изменения для выпадающих списков с одним выбором
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Применение фильтров
  const handleApply = () => {
    if (!isValidRange()) return;
    
    // Преобразуем выбранные даты обратно в формат месяц/год для совместимости
    const startMonth = filters.dateRange.startDate.getMonth();
    const startYear = filters.dateRange.startDate.getFullYear();
    const endMonth = filters.dateRange.endDate.getMonth();
    const endYear = filters.dateRange.endDate.getFullYear();
    
    onApply({
      startMonth,
      startYear,
      endMonth,
      endYear,
      stand: filters.selectedStand,
      deviceType: filters.selectedDeviceType,
      operator: filters.selectedOperator
    });
    
    onClose();
  };

  // Сброс фильтров
  const handleReset = () => {
    const currentDate = new Date();
    setFilters({
      dateRange: {
        startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      },
      selectedStand: '',
      selectedDeviceType: '',
      selectedOperator: ''
    });
  };

  // Проверка валидности диапазона дат
  const isValidRange = () => {
    if (!filters.dateRange.startDate || !filters.dateRange.endDate) return false;
    return filters.dateRange.startDate <= filters.dateRange.endDate;
  };

  // Форматирование дат для отображения
  const formatDateDisplay = (date) => {
    if (!date) return "";
    return format(date, 'LLLL yyyy', { locale: ru });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Настройка фильтров
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          {/* Период дат - более компактное отображение */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Период
            </Typography>
            <Divider sx={{ mb: 1 }} />
          </Grid>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <Grid container item xs={12} spacing={2}>
              {/* Начальная дата */}
              <Grid item xs={12} sm={6}>
                <DatePicker
                  views={['month', 'year']}
                  label="Начальная дата"
                  value={filters.dateRange.startDate}
                  onChange={handleStartDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      size: 'small',
                      helperText: formatDateDisplay(filters.dateRange.startDate)
                    }
                  }}
                />
              </Grid>
              
              {/* Конечная дата */}
              <Grid item xs={12} sm={6}>
                <DatePicker
                  views={['month', 'year']}
                  label="Конечная дата"
                  value={filters.dateRange.endDate}
                  onChange={handleEndDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      size: 'small',
                      helperText: formatDateDisplay(filters.dateRange.endDate)
                    }
                  }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
          
          {/* Предупреждение о невалидном диапазоне */}
          {!isValidRange() && filters.dateRange.startDate && filters.dateRange.endDate && (
            <Grid item xs={12}>
              <Typography color="error" variant="body2">
                Начальная дата не может быть позже конечной даты
              </Typography>
            </Grid>
          )}
          
          {/* Секция фильтров с единичным выбором */}
          <Grid item xs={12} container spacing={2}>
            {/* Стенд */}
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="ID стенда"
                name="selectedStand"
                value={filters.selectedStand}
                onChange={handleInputChange}
                fullWidth
                size="small"
                variant="outlined"
                disabled={isLoadingIds}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 250, // высота в пикселях
                      },
                    },
                  },
                }}
              >
                <MenuItem value=""><em>Не выбрано</em></MenuItem>
                {standIds.map((id, index) => (
                  <MenuItem key={index} value={id}>{id}</MenuItem>
                ))}
              </TextField>
            </Grid>
            
            {/* Тип устройства */}
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Тип устройства"
                name="selectedDeviceType"
                value={filters.selectedDeviceType}
                onChange={handleInputChange}
                fullWidth
                size="small"
                variant="outlined"
              >
                <MenuItem value=""><em>Не выбрано</em></MenuItem>
                {DEVICE_TYPES.slice(1).map((deviceType) => (
                  <MenuItem key={deviceType.id} value={deviceType.name}>
                    {deviceType.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            {/* Оператор */}
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Имя оператора"
                name="selectedOperator"
                value={filters.selectedOperator}
                onChange={handleInputChange}
                fullWidth
                size="small"
                variant="outlined"
                disabled={isLoadingOperators}
              >
                <MenuItem value=""><em>Не выбрано</em></MenuItem>
                {operatorNames.map((name, index) => (
                  <MenuItem key={index} value={name}>{name}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={handleReset} color="error">
          Сбросить
        </Button>
        <Button onClick={onClose} color="primary">
          Отмена
        </Button>
        <Button 
          onClick={handleApply} 
          color="primary" 
          variant="contained"
          disabled={!isValidRange()}
        >
          Применить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterStatsModal;