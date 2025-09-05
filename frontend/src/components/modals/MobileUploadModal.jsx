import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
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
import { useUploadMobileMutation } from '../../api/apiMobile';

const MobileUploadModal = ({ open, handleClose }) => {
  const [uploadMobile, { isLoading }] = useUploadMobileMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file: null
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
      const allowedTypes = ['application/vnd.android.package-archive'];
      const allowedExtensions = ['.apk'];
      const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        setError(`Файл должен быть в формате: ${allowedExtensions.join(', ')}`);
        return;
      }

      const fileName = file.name;
      const lastDotIndex = fileName.lastIndexOf('.');
      const name = lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex);

      setFormData(prevData => ({
        ...prevData,
        name: prevData.name || name,
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
    handleFileChange(file);
  };
  
  const isFormValid = () => {
    return formData.name;
  };
  
  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError('Заполните все обязательные поля');
      return;
    }

    setError('');
    setSuccess(false);

    const uploadData = new FormData();
    uploadData.append('name', formData.name);
    uploadData.append('description', formData.description);
    uploadData.append('type', 'Приложение');
    if (formData.file) {
      uploadData.append('file', formData.file);
    }

    try {
      await uploadMobile(uploadData).unwrap();
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.data?.message || 'Ошибка при создании записи');
    }
  };
  
  const onClose = () => {
    setFormData({
      name: '',
      description: '',
      file: null
    });
    setError('');
    setSuccess(false);
    handleClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
          Создание записи
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {error && (
        <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mx: 2, mb: 2 }}>
          Запись успешно создана!
        </Alert>
      )}
      
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Название"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Название приложения"
            />
          </Grid>
          
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
              placeholder="Опишите изменения и новые функции"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Файл (опционально)
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
                },
                maxWidth: '100%',
                overflow: 'hidden'
              }}
              onClick={() => document.getElementById('mobile-file-input').click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="mobile-file-input"
                accept=".apk"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
              
              <UploadFileIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              
              <Typography 
                variant="body1" 
                gutterBottom 
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}
              >
                {formData.file ? formData.file.name : 'Нажмите или перетащите файл сюда'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {formData.file ? `${(formData.file.size / (1024 * 1024)).toFixed(2)} МБ` : 'Формат: .apk'}
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
          {isLoading ? 'Создание...' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MobileUploadModal;