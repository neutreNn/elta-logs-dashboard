import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Stack, 
  Typography, 
  Grid,
  FormControl,
  InputLabel,
  Input,
  Divider,
  Box,
  MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useGetOperatorNamesQuery } from '../../api/apiOperators';
import { useGetStandIdsQuery } from '../../api/apiStandIds';

function FilterModal({ open, handleClose, applyFilters }) {
  const { data: operatorNames = [], isLoadingOperators } = useGetOperatorNamesQuery();
  const { data: standIds = [], isLoadingIds } = useGetStandIdsQuery();

  const [filters, setFilters] = useState({
    operator_name: '',
    software_version_stand: '',
    hardware_version_stand: '',
    serial_number_ob_jlink: '',
    stand_id: '',
    device_type: '',
    device_firmware_version_min: '',
    device_firmware_version_max: '',
    application_start_time_from: '',
    application_start_time_to: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleApplyFilters = () => {
    // Удаляем пустые значения из объекта фильтров
    const cleanFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') {
        cleanFilters[key] = value;
      }
    });

    applyFilters(cleanFilters);
    handleClose();
  };

  const handleResetFilters = () => {
    setFilters({
        operator_name: '',
        software_version_stand: '',
        hardware_version_stand: '',
        serial_number_ob_jlink: '',
        stand_id: '',
        device_type: '',
        device_firmware_version_min: '',
        device_firmware_version_max: '',
        application_start_time_from: '',
        application_start_time_to: '',
    });
      
    applyFilters({});
    handleClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: 'primary.main',
        color: 'white',
        py: 1.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterAltIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Фильтрация логов</Typography>
        </Box>
        <Button 
          onClick={handleClose} 
          color="inherit" 
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="subtitle1" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 2, 
            color: 'primary.main',
            borderBottom: '2px solid',
            borderColor: 'primary.main',
            pb: 0.5,
            display: 'inline-block'
          }}
        >
          Параметры фильтрации логов
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 2 }}>
          {/* Первая колонка */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2.5}>
              <TextField
                select
                label="Имя оператора"
                name="operator_name"
                value={filters.operator_name}
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
              
              <TextField
                label="Версия ПО стенда"
                name="software_version_stand"
                value={filters.software_version_stand}
                onChange={handleInputChange}
                fullWidth
                size="small"
                variant="outlined"
              />
              
              <TextField
                label="Версия железа стенда"
                name="hardware_version_stand"
                value={filters.hardware_version_stand}
                onChange={handleInputChange}
                fullWidth
                size="small"
                variant="outlined"
              />
              
              <TextField
                label="Серийный номер OB JLink"
                name="serial_number_ob_jlink"
                value={filters.serial_number_ob_jlink}
                onChange={handleInputChange}
                fullWidth
                size="small"
                variant="outlined"
              />
            </Stack>
          </Grid>
          
          {/* Вторая колонка */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2.5}>
              <TextField
                select
                label="ID стенда"
                name="stand_id"
                value={filters.stand_id}
                onChange={handleInputChange}
                fullWidth
                size="small"
                variant="outlined"
                disabled={isLoadingIds}
              >
                <MenuItem value=""><em>Не выбрано</em></MenuItem>
                {standIds.map((name, index) => (
                  <MenuItem key={index} value={name}>{name}</MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                label="Тип устройства"
                name="device_type"
                value={filters.device_type}
                onChange={handleInputChange}
                fullWidth
                size="small"
                variant="outlined"
              >
                <MenuItem value=""><em>Не выбрано</em></MenuItem>
                <MenuItem value="Онлайн">Онлайн</MenuItem>
                <MenuItem value="Экспресс">Экспресс</MenuItem>
                <MenuItem value="Голосовой">Voice</MenuItem>
              </TextField>
              
              <TextField
                label="Минимальная версия прошивки"
                name="device_firmware_version_min"
                value={filters.device_firmware_version_min}
                onChange={handleInputChange}
                placeholder="Например: 4.5.1"
                fullWidth
                size="small"
                variant="outlined"
              />
              
              <TextField
                label="Максимальная версия прошивки"
                name="device_firmware_version_max"
                value={filters.device_firmware_version_max}
                onChange={handleInputChange}
                placeholder="Например: 5.0.0"
                fullWidth
                size="small"
                variant="outlined"
              />
            </Stack>
          </Grid>
          
          {/* Третья колонка (даты) */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2.5}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel shrink htmlFor="application_start_time_from">
                  Время запуска (от)
                </InputLabel>
                <Input
                  id="application_start_time_from"
                  name="application_start_time_from"
                  type="date"
                  value={filters.application_start_time_from}
                  onChange={handleInputChange}
                  fullWidth
                  sx={{ p: 1 }}
                />
              </FormControl>
              
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel shrink htmlFor="application_start_time_to">
                  Время запуска (до)
                </InputLabel>
                <Input
                  id="application_start_time_to"
                  name="application_start_time_to"
                  type="date"
                  value={filters.application_start_time_to}
                  onChange={handleInputChange}
                  fullWidth
                  sx={{ p: 1 }}
                />
              </FormControl>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        justifyContent: 'space-between',
        bgcolor: '#f5f5f5'
      }}>
        <Button 
          onClick={handleResetFilters} 
          color="error" 
          variant="outlined"
          startIcon={<RestartAltIcon />}
        >
          Сбросить фильтры
        </Button>
        
        <Button 
            onClick={handleApplyFilters} 
            color="primary" 
            variant="contained"
            startIcon={<FilterAltIcon />}
        >
          Применить фильтры
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FilterModal;