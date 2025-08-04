import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useGetFirmwareByIdQuery,
  useDeleteFirmwareMutation,
  useDownloadFirmwareMutation
} from '../api/apiFirmware';
import CircleLoader from '../components/common/CircleLoader';
import ErrorMessage from '../components/common/ErrorMessage';
import formatDate from '../utils/formatDate';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import DevicesIcon from '@mui/icons-material/Devices';
import ComputerIcon from '@mui/icons-material/Computer';
import CodeIcon from '@mui/icons-material/Code';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'stand':
      return <BusinessIcon />;
    case 'device':
      return <DevicesIcon />;
    case 'desktop':
      return <ComputerIcon />;
    default:
      return <CodeIcon />;
  }
};

const getTypeName = (type) => {
  switch (type) {
    case 'stand':
      return 'Прошивка для стенда';
    case 'device':
      return 'Прошивка для прибора';
    case 'desktop':
      return 'Обновление приложения';
    default:
      return type;
  }
};

function FirmwareDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const { data: firmware, isLoading, isError } = useGetFirmwareByIdQuery(id);
  const [deleteFirmware] = useDeleteFirmwareMutation();
  const [downloadFirmware] = useDownloadFirmwareMutation();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteFirmware = async () => {
    try {
      await deleteFirmware(id).unwrap();
      handleCloseDeleteDialog();
      navigate('/firmware');
    } catch (error) {
      console.error('Ошибка при удалении прошивки:', error);
      setErrorMessage(error.data?.message || 'Не удалось удалить прошивку');
      setSnackbarOpen(true);
      handleCloseDeleteDialog();
    }
  };

  const handleDownloadFirmware = async () => {
    try {
      const fileName = firmware.file_path.split('/').pop();
      await downloadFirmware({ id, fileName }).unwrap();
    } catch (error) {
      console.error('Ошибка при скачивании прошивки:', error);
      setErrorMessage(error.data?.message || 'Не удалось скачать прошивку');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setErrorMessage('');
  };

  if (isLoading) return <CircleLoader />;
  if (isError || !firmware) return <ErrorMessage message="Не удалось загрузить информацию о прошивке" />;

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          variant="outlined"
        >
          Назад
        </Button>
      </Box>

      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        borderRadius: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              bgcolor: firmware.type === 'stand' ? 'primary.light' : 
                     firmware.type === 'device' ? 'secondary.light' : 
                     'success.light',
              color: firmware.type === 'stand' ? 'primary.dark' : 
                     firmware.type === 'device' ? 'secondary.dark' : 
                     'success.dark',
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getTypeIcon(firmware.type)}
            </Box>
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                {firmware.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {getTypeName(firmware.type)} • v{firmware.version}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleOpenDeleteDialog}
            >
              Удалить
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadFirmware}
            >
              Скачать
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Информация о прошивке
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <List disablePadding>
                <ListItem divider>
                  <ListItemText 
                    primary="Дата создания" 
                    secondary={firmware.created_date ? formatDate(firmware.created_date) : 'Не указана'} 
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemText 
                    primary="Дата загрузки" 
                    secondary={formatDate(firmware.upload_date)} 
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemText 
                    primary="Размер файла" 
                    secondary={formatFileSize(firmware.file_size)} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Путь к файлу" 
                    secondary={firmware.file_path} 
                  />
                </ListItem>
              </List>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Описание
            </Typography>
            <Card 
              variant="outlined" 
              sx={{ 
                p: 2, 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                minHeight: '200px'
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                  flex: 1
                }}
              >
                {firmware.description || "Описание отсутствует"}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить прошивку "{firmware.name} v{firmware.version}"?
            Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
          <Button onClick={handleDeleteFirmware} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default FirmwareDetailPage;