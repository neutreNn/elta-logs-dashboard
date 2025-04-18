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
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { format } from 'date-fns';

const FilterStatsModal = ({ open, onClose, onApply, currentFilters }) => {
  // Создаем состояние для хранения дат
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  
  // Инициализация фильтров при открытии модального окна
  useEffect(() => {
    if (open && currentFilters) {
      // Преобразуем месяц и год в объекты даты
      const startDate = new Date(currentFilters.startYear, currentFilters.startMonth, 1);
      
      // Для конечной даты берем последний день месяца
      const endDate = new Date(currentFilters.endYear, currentFilters.endMonth + 1, 0);
      
      setDateRange({
        startDate,
        endDate
      });
    }
  }, [open, currentFilters]);

  // Обработчики изменения значений
  const handleStartDateChange = (date) => {
    setDateRange({ ...dateRange, startDate: date });
  };

  const handleEndDateChange = (date) => {
    setDateRange({ ...dateRange, endDate: date });
  };

  // Применение фильтров
  const handleApply = () => {
    // Преобразуем выбранные даты обратно в формат месяц/год для совместимости
    const startMonth = dateRange.startDate.getMonth();
    const startYear = dateRange.startDate.getFullYear();
    const endMonth = dateRange.endDate.getMonth();
    const endYear = dateRange.endDate.getFullYear();
    
    onApply({
      startMonth,
      startYear,
      endMonth,
      endYear
    });
    
    onClose();
  };

  // Сброс фильтров
  const handleReset = () => {
    const currentDate = new Date();
    setDateRange({
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    });
  };

  // Проверка валидности диапазона дат
  const isValidRange = () => {
    if (!dateRange.startDate || !dateRange.endDate) return false;
    return dateRange.startDate <= dateRange.endDate;
  };

  // Форматирование дат для отображения
  const formatDateDisplay = (date) => {
    if (!date) return "";
    return format(date, 'LLLL yyyy', { locale: ru });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Фильтрация по периоду
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Выберите диапазон дат
            </Typography>
          </Grid>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            {/* Начальная дата */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                С:
              </Typography>
              <Box sx={{ mt: 1 }}>
                <DatePicker
                  views={['month', 'year']}
                  value={dateRange.startDate}
                  onChange={handleStartDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      size: 'small',
                      helperText: formatDateDisplay(dateRange.startDate)
                    }
                  }}
                />
              </Box>
            </Grid>
            
            {/* Конечная дата */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                По:
              </Typography>
              <Box sx={{ mt: 1 }}>
                <DatePicker
                  views={['month', 'year']}
                  value={dateRange.endDate}
                  onChange={handleEndDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      size: 'small',
                      helperText: formatDateDisplay(dateRange.endDate)
                    }
                  }}
                />
              </Box>
            </Grid>
          </LocalizationProvider>
          
          {/* Предупреждение о невалидном диапазоне */}
          {!isValidRange() && dateRange.startDate && dateRange.endDate && (
            <Grid item xs={12}>
              <Typography color="error" variant="body2">
                Начальная дата не может быть позже конечной даты
              </Typography>
            </Grid>
          )}
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