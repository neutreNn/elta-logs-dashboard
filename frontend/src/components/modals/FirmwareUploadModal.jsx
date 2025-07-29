import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  Grid,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useUploadFirmwareMutation } from '../../api/apiFirmware';

const FirmwareUploadModal = ({ open, handleClose }) => {
  const [uploadFirmware, { isLoading }] = useUploadFirmwareMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    type: '',
    subType: '',
    description: '',
    file: null,
    created_date: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleFileChange = (file) => {
    if (file) {
      const fileName = file.name;
      const lastDotIndex = fileName.lastIndexOf('.');

      if (lastDotIndex === -1) {
        setError('Файл должен иметь расширение');
        return;
      }

      const baseName = fileName.substring(0, lastDotIndex);
      const underscoreIndex = baseName.lastIndexOf('_');
      if (underscoreIndex === -1) {
        setError('Неверный формат имени файла. Ожидается: название_версия.расширение');
        return;
      }

      const name = baseName.substring(0, underscoreIndex);
      const version = baseName.substring(underscoreIndex + 1);

      const versionMatch = version.match(/^(\d+\.\d+\.\d+)$/);
      if (!versionMatch) {
        setError('Неверный формат версии в имени файла. Ожидается: X.Y.Z');
        return;
      }

      let type = '';
      let subType = '';
      
      if (['Express', 'Online', 'Voice'].includes(name)) {
        type = 'device';
        subType = name.toLowerCase();
      } else if (name === 'AppStandControl') {
        type = 'stand';
        subType = '';
      } else if (name === 'setupStandControl') {
        type = 'desktop';
        subType = '';
      } else if (name === 'AppStripStandControl') {
        type = 'stand';
        subType = 'test-strips';
      } else if (name === 'AppDeviceStandControl') {
        type = 'stand';
        subType = 'devices';
      } else if (name === 'updateDeviceStandControl') {
        type = 'desktop';
        subType = 'devices';
      } else if (name === 'updateStripStandControl') {
        type = 'desktop';
        subType = 'test-strips';
      } else {
        setError('Неизвестное название прошивки. Ожидается: Express, Online, Voice, AppStripStandControl, AppDeviceStandControl, updateDeviceStandControl, updateStripStandControl');
        return;
      }

      setFormData(prevData => ({
        ...prevData,
        name,
        version,
        type,
        subType,
        file
      }));
      setError('');
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };
  
  const isFormValid = () => {
    const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    return (
      formData.name && 
      formData.version && 
      formData.type && 
      formData.file && 
      formData.created_date && 
      datetimeRegex.test(formData.created_date) &&
      (formData.type !== 'device' || formData.subType) &&
      formData.version.match(/^\d+\.\d+\.\d+$/)
    );
  };
  
  const handleSubmit = async () => {
    try {
      setError('');
      
      if (!isFormValid()) {
        setError('Заполните все обязательные поля, включая дату и время создания, выберите файл и укажите версию в формате X.Y.Z');
        return;
      }
      
      const uploadData = new FormData();
      uploadData.append('name', formData.name);
      uploadData.append('version', formData.version);
      uploadData.append('type', formData.type);
      uploadData.append('description', formData.description || '');
      uploadData.append('file', formData.file);
      uploadData.append('created_date', `${formData.created_date}:00Z`);
      if (formData.subType) {
        uploadData.append('subType', formData.subType);
      }
      
      await uploadFirmware(uploadData).unwrap();
      
      setSuccess(true);
      resetForm();
      
      setTimeout(() => {
        handleClose();
        setSuccess(false);
      }, 1500);
      
    } catch (err) {
      console.error('Ошибка при загрузке прошивки:', err);
      if (err.data?.message?.includes('уже существует')) {
        setError('Прошивка с такой версией, типом и подтипом уже существует');
      } else {
        setError(err.data?.message || 'Произошла ошибка при загрузке файла');
      }
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      version: '',
      type: '',
      subType: '',
      description: '',
      file: null,
      created_date: ''
    });
  };
  
  const onClose = () => {
    resetForm();
    setError('');
    setSuccess(false);
    handleClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        <Typography variant="h6" component="div">
          Загрузка новой прошивки
        </Typography>
        <IconButton 
          size="small" 
          onClick={onClose}
          aria-label="закрыть"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Прошивка успешно загружена!
          </Alert>
        )}
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Название прошивки"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Версия"
              name="version"
              value={formData.version}
              onChange={handleChange}
              error={formData.version && !formData.version.match(/^\d+\.\d+\.\d+$/)}
              helperText={formData.version && !formData.version.match(/^\d+\.\d+\.\d+$/) ? 'Формат: X.Y.Z' : ''}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Дата и время создания"
              name="created_date"
              value={formData.created_date}
              onChange={handleChange}
              required
              InputLabelProps={{ 
                shrink: true 
              }}
              inputProps={{
                max: new Date().toISOString().slice(0, 16)
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth required margin="normal">
              <InputLabel>Тип прошивки</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Тип прошивки"
                onChange={handleChange}
              >
                <MenuItem value="stand">Стенд</MenuItem>
                <MenuItem value="device">Прибор</MenuItem>
                <MenuItem value="desktop">Приложение</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {formData.type === 'device' && (
            <Grid item xs={12}>
              <FormControl fullWidth required margin="normal">
                <InputLabel>Подтип прошивки</InputLabel>
                <Select
                  name="subType"
                  value={formData.subType}
                  label="Подтип прошивки"
                  onChange={handleChange}
                >
                  <MenuItem value="express">Express</MenuItem>
                  <MenuItem value="voice">Voice</MenuItem>
                  <MenuItem value="online">Online</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {(formData.type === 'stand' || formData.type === 'desktop') && (
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Подтип прошивки</InputLabel>
                <Select
                  name="subType"
                  value={formData.subType}
                  label="Подтип прошивки"
                  onChange={handleChange}
                >
                  <MenuItem value="devices">Приборы</MenuItem>
                  <MenuItem value="test-strips">Тест-полоски</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <TextField
              margin="normal"
              fullWidth
              multiline
              rows={3}
              label="Описание"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Опишите внесенные изменения и новые функции"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Файл прошивки
              </Typography>
            </Divider>
          </Grid>
          
          <Grid item xs={12}>
            <Box 
              sx={{ 
                border: '2px dashed #e0e0e0',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragging ? '#e3f2fd' : 'inherit',
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
              onClick={() => document.getElementById('firmware-file-input').click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="firmware-file-input"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
              
              <UploadFileIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              
              <Typography variant="body1" gutterBottom>
                {formData.file ? formData.file.name : 'Нажмите или перетащите файл прошивки сюда'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {formData.file ? `${(formData.file.size / (1024 * 1024)).toFixed(2)} МБ` : 'Поддерживаемые форматы: .hex, .exe, .bin, .zip'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} variant="outlined">
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={isLoading || !isFormValid()}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Загрузка...' : 'Загрузить прошивку'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FirmwareUploadModal;