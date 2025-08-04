import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  IconButton, 
  Tooltip, 
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDeleteFirmwareMutation, useDownloadFirmwareMutation } from '../api/apiFirmware';
import formatDate from '../utils/formatDate';
import { Link, useNavigate } from 'react-router-dom';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const subTypeLabels = {
  'test-strips': 'Тест-полоски',
  'devices': 'Приборы',
  'express': 'Express',
  'voice': 'Voice',
  'online': 'Online'
};

const FirmwareTypeChip = ({ type, subType }) => {
  const getTypeInfo = (type) => {
    switch (type) {
      case 'stand':
        return { label: 'Стенд', color: 'primary' };
      case 'device':
        return { label: 'Прибор', color: 'secondary' };
      case 'desktop':
        return { label: 'Приложение', color: 'success' };
      default:
        return { label: type, color: 'default' };
    }
  };

  const typeInfo = getTypeInfo(type);
  const subTypeLabel = subType ? ` (${subTypeLabels[subType] || subType})` : '';
  
  return (
    <Chip 
      label={`${typeInfo.label}${subTypeLabel}`} 
      color={typeInfo.color} 
      size="small" 
      variant="outlined"
    />
  );
};

function FirmwareTable({ firmwares }) {
  const [deleteFirmware, { isLoading: isDeleting }] = useDeleteFirmwareMutation();
  const [downloadFirmware] = useDownloadFirmwareMutation();
  const navigate = useNavigate();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [firmwareToDelete, setFirmwareToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleOpenDeleteDialog = (firmware) => {
    setFirmwareToDelete(firmware);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setFirmwareToDelete(null);
  };

  const handleDeleteFirmware = async () => {
    if (!firmwareToDelete) return;
    
    try {
      await deleteFirmware(firmwareToDelete._id).unwrap();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Ошибка при удалении прошивки:', error);
      setErrorMessage(error.data?.message || 'Не удалось удалить прошивку');
      setSnackbarOpen(true);
      handleCloseDeleteDialog();
    }
  };

  const handleDownloadFirmware = async (firmware) => {
    try {
      const fileName = firmware.file_path.split('/').pop();
      await downloadFirmware({ id: firmware._id, fileName }).unwrap();
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

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Название</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Версия</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Тип</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Размер</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Дата создания</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Дата загрузки</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {firmwares.map((firmware) => (
              <TableRow key={firmware._id} hover>
                <TableCell>{firmware.name}</TableCell>
                <TableCell>{firmware.version}</TableCell>
                <TableCell>
                  <FirmwareTypeChip type={firmware.type} subType={firmware.subType} />
                </TableCell>
                <TableCell>{formatFileSize(firmware.file_size)}</TableCell>
                <TableCell>{firmware.created_date ? formatDate(firmware.created_date) : '-'}</TableCell>
                <TableCell>{formatDate(firmware.upload_date)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Скачать">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDownloadFirmware(firmware)}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Подробнее">
                      <IconButton 
                        size="small"
                        component={Link}
                        to={`/firmware/${firmware._id}`}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(firmware)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить прошивку "{firmwareToDelete?.name} v{firmwareToDelete?.version}"?
            Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteFirmware} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
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
    </>
  );
}

export default FirmwareTable;