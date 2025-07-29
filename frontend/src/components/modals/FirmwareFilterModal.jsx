import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  Chip,
  Box,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

const FirmwareFilterModal = ({ open, handleClose, applyFilters, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    name: '',
    version: '',
    min_upload_date: '',
    max_upload_date: '',
  });
  
  useEffect(() => {
    if (open) {
      const { page, limit, type, subType, ...otherFilters } = initialFilters;
      setFilters({
        name: otherFilters.name || '',
        version: otherFilters.version || '',
        min_upload_date: otherFilters.min_upload_date || '',
        max_upload_date: otherFilters.max_upload_date || '',
      });
    }
  }, [open, initialFilters]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      name: '',
      version: '',
      min_upload_date: '',
      max_upload_date: '',
    });
    applyFilters({});
    handleClose();
  };
  
  const handleApplyFilters = () => {
    const filterParams = {};
    if (filters.name) filterParams.name = filters.name;
    if (filters.version) filterParams.version = filters.version;
    if (filters.min_upload_date) filterParams.min_upload_date = filters.min_upload_date;
    if (filters.max_upload_date) filterParams.max_upload_date = filters.max_upload_date;
    applyFilters(filterParams);
    handleClose();
  };

  const clearFilterField = (fieldName) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [fieldName]: ''
    }));
  };
  
  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="primary" />
          <Typography variant="h6" component="div">
            Фильтр прошивок
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip 
              label={activeFiltersCount} 
              color="primary" 
              size="small" 
            />
          )}
        </Box>
        <IconButton 
          size="small" 
          onClick={handleClose}
          aria-label="закрыть"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Название"
              name="name"
              value={filters.name}
              onChange={handleChange}
              placeholder="Поиск по названию"
              size="small"
              variant="outlined"
              sx={{ mt: 1 }}
              InputProps={{
                endAdornment: filters.name ? (
                  <IconButton 
                    size="small" 
                    onClick={() => clearFilterField('name')}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Версия"
              name="version"
              value={filters.version}
              onChange={handleChange}
              placeholder="Например: 1.0.0"
              size="small"
              variant="outlined"
              sx={{ mt: 1 }}
              InputProps={{
                endAdornment: filters.version ? (
                  <IconButton 
                    size="small" 
                    onClick={() => clearFilterField('version')}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Период загрузки
              </Typography>
            </Divider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="С даты"
              name="min_upload_date"
              value={filters.min_upload_date}
              onChange={handleChange}
              size="small"
              variant="outlined"
              InputLabelProps={{ 
                shrink: true 
              }}
              InputProps={{
                endAdornment: filters.min_upload_date ? (
                  <IconButton 
                    size="small" 
                    onClick={() => clearFilterField('min_upload_date')}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="По дату"
              name="max_upload_date"
              value={filters.max_upload_date}
              onChange={handleChange}
              size="small"
              variant="outlined"
              InputLabelProps={{ 
                shrink: true 
              }}
              InputProps={{
                endAdornment: filters.max_upload_date ? (
                  <IconButton 
                    size="small" 
                    onClick={() => clearFilterField('max_upload_date')}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', justifyContent: 'space-between' }}>
        <Button 
          onClick={resetFilters} 
          variant="outlined" 
          color="error"
          disabled={activeFiltersCount === 0}
        >
          Сбросить фильтры
        </Button>
        <Box>
          <Button 
            onClick={handleClose} 
            sx={{ mr: 1 }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleApplyFilters} 
            variant="contained" 
            color="primary"
          >
            Применить
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default FirmwareFilterModal;