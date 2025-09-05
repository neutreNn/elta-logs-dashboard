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
} from '@mui/material';
import { useUpdateMobileMutation } from '../../api/apiMobile';

const MobileUpdateModal = ({ open, handleClose, id, initialName = '', initialDescription = '', onUpdate }) => {
  const [editForm, setEditForm] = useState({ name: initialName, description: initialDescription });
  const [updateMobile] = useUpdateMobileMutation();

  useEffect(() => {
    if (open) {
      setEditForm({ name: initialName, description: initialDescription });
    }
  }, [open, initialName, initialDescription]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditMobile = async () => {
    try {
      await updateMobile({ id, ...editForm }).unwrap();
      onUpdate({ success: true, message: 'Запись успешно обновлена' });
      handleClose();
    } catch (error) {
      console.error('Ошибка при обновлении записи:', error);
      onUpdate({ success: false, message: error.data?.message || 'Не удалось обновить запись' });
      handleClose();
    }
  };

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
        <Typography variant="h6">Редактировать запись</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Название"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              size="medium"
              variant="outlined"
              placeholder="Введите название"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Описание"
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
              size="medium"
              variant="outlined"
              placeholder="Введите описание"
              multiline
              rows={4}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', justifyContent: 'flex-end' }}>
        <Button onClick={handleClose} sx={{ mr: 1 }}>
          Отмена
        </Button>
        <Button 
          onClick={handleEditMobile} 
          variant="contained" 
          color="primary"
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MobileUpdateModal;