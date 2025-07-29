import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

const initialFormState = {
  stand_id: '',
  software_version_stand: '',
  hardware_version_stand: '',
  serial_number_ob_jlink: '',
  status: 'активен',
  additional_notes: ''
};

const StandModal = ({ 
  open, 
  handleClose, 
  onSubmit, 
  isLoading, 
  initialData = null, 
  isEditMode = false,
  errors = {}
}) => {
  const [formData, setFormData] = useState(initialFormState);
  
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(initialFormState);
    }
  }, [open, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const dialogTitle = isEditMode ? "Редактирование стенда" : "Добавить новый стенд";
  const icon = isEditMode ? <EditIcon sx={{ mr: 1 }} /> : <AddIcon sx={{ mr: 1 }} />;
  const submitButtonText = isEditMode ? "Сохранить" : "Создать";

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
          {icon}
          <Typography variant="h6">{dialogTitle}</Typography>
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
        <Typography
            variant="subtitle1"
            sx={{
            fontWeight: 'bold',
            mb: 2,
            color: 'primary.main',
            borderBottom: '2px solid',
            borderColor: 'primary.main',
            pb: 0.5,
            display: 'inline-block',
            }}
        >
            {isEditMode ? 'Параметры стенда' : 'Добавление нового стенда'}
        </Typography>

        <Grid container spacing={3}>
            {/* Левая колонка */}
            <Grid item xs={12} sm={6}>
            <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                name="stand_id"
                label="ID стенда *"
                fullWidth
                value={formData.stand_id}
                onChange={handleInputChange}
                error={!!errors.stand_id}
                helperText={errors.stand_id}
                margin="none"
                disabled={isEditMode}
                size="small"
                variant="outlined"
                />

                <FormControl fullWidth size="small">
                <InputLabel>Статус</InputLabel>
                <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Статус"
                >
                    <MenuItem value="активен">Активен</MenuItem>
                    <MenuItem value="требует обслуживания">Требует обслуживания</MenuItem>
                    <MenuItem value="в ремонте">В ремонте</MenuItem>
                    <MenuItem value="не активен">Не активен</MenuItem>
                </Select>
                </FormControl>

                <TextField
                name="software_version_stand"
                label="Программная версия"
                fullWidth
                value={formData.software_version_stand}
                onChange={handleInputChange}
                size="small"
                variant="outlined"
                />

                <TextField
                name="hardware_version_stand"
                label="Аппаратная версия"
                fullWidth
                value={formData.hardware_version_stand}
                onChange={handleInputChange}
                size="small"
                variant="outlined"
                />

                <TextField
                name="serial_number_ob_jlink"
                label="Серийный номер"
                fullWidth
                value={formData.serial_number_ob_jlink}
                onChange={handleInputChange}
                size="small"
                variant="outlined"
                />
            </Box>
            </Grid>

            {/* Правая колонка */}
            <Grid item xs={12} sm={6}>
                <TextField
                    name="additional_notes"
                    label="Дополнительные заметки"
                    fullWidth
                    multiline
                    rows={12}
                    value={formData.additional_notes}
                    onChange={handleInputChange}
                    size="small"
                    variant="outlined"
                />
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
          onClick={handleClose}
          variant="outlined"
        >
          Отмена
        </Button>
        
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={isLoading || (formData.stand_id.trim() === '' && !isEditMode)}
          startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isLoading ? (isEditMode ? "Сохранение..." : "Создание...") : submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StandModal;