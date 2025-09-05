import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import truncateText from '../../utils/truncateText';

function MobileDeleteModal({ open, onClose, handleDelete, name }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Подтверждение удаления</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Вы действительно хотите удалить запись "{truncateText(name, 30)}"?
          Это действие нельзя будет отменить.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleDelete} color="error" variant="contained">
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MobileDeleteModal;