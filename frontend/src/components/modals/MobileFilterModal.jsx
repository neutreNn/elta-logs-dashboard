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
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';

const MobileFilterModal = ({ open, handleClose, applyFilters, initialFilters = {} }) => {
  
  const [filters, setFilters] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });
  
  useEffect(() => {
    if (open) {
      const { page, limit, ...otherFilters } = initialFilters;
      setFilters({
        name: otherFilters.name || '',
        startDate: otherFilters.startDate || '',
        endDate: otherFilters.endDate || '',
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
      startDate: '',
      endDate: '',
    });
    applyFilters({});
    handleClose();
  };
  
  const handleApplyFilters = () => {
    const filterParams = {};
    if (filters.name) filterParams.name = filters.name;
    if (filters.startDate) filterParams.startDate = filters.startDate;
    if (filters.endDate) filterParams.endDate = filters.endDate;
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
        pb: 2
      }}>
        <Typography variant="h6">
          Фильтры
          {activeFiltersCount > 0 && (
            <Chip 
              label={activeFiltersCount} 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }} 
            />
          )}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Название"
              name="name"
              value={filters.name}
              onChange={handleChange}
              size="medium"
              variant="outlined"
              placeholder="Введите название"
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
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              size="medium"
              variant="outlined"
              InputLabelProps={{ 
                shrink: true 
              }}
              InputProps={{
                endAdornment: filters.startDate ? (
                  <IconButton 
                    size="small" 
                    onClick={() => clearFilterField('startDate')}
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
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              size="medium"
              variant="outlined"
              InputLabelProps={{ 
                shrink: true 
              }}
              InputProps={{
                endAdornment: filters.endDate ? (
                  <IconButton 
                    size="small" 
                    onClick={() => clearFilterField('endDate')}
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

export default MobileFilterModal;