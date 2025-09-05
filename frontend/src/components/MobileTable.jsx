import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Tooltip, 
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDeleteMobileMutation } from '../api/apiMobile';
import formatDate from '../utils/formatDate';
import { Link } from 'react-router-dom';
import truncateText from '../utils/truncateText';
import MobileDeleteModal from './modals/MobileDeleteModal';

function MobileTable({ mobiles }) {
  const [deleteMobile] = useDeleteMobileMutation();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mobileToDelete, setMobileToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleOpenDeleteDialog = (mobile) => {
    setMobileToDelete(mobile);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMobileToDelete(null);
  };

  const handleDeleteMobile = async () => {
    if (!mobileToDelete) return;
    
    try {
      await deleteMobile(mobileToDelete._id).unwrap();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Ошибка при удалении записи:', error);
      setErrorMessage(error.data?.message || 'Не удалось удалить запись');
      setSnackbarOpen(true);
      handleCloseDeleteDialog();
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
              <TableCell sx={{ fontWeight: 'bold' }}>Дата загрузки</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mobiles.map((mobile) => {
              const apkFile = mobile.files.find(file => file.file_type === 'Приложение');
              return (
                <TableRow key={mobile._id} hover>
                  <TableCell>{truncateText(mobile.name, 50)}</TableCell>
                  <TableCell>{formatDate(mobile.upload_date)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Подробнее">
                        <IconButton 
                          size="small"
                          component={Link}
                          to={`/mobile/${mobile._id}`}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(mobile)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <MobileDeleteModal
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        handleDelete={handleDeleteMobile}
        name={mobileToDelete?.name}
      />

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

export default MobileTable;