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
  MenuItem,
  Select,
  Box
} from '@mui/material';

const RepairModal = ({ open, handleClose, handleSubmit }) => {

  const [repairForm, setRepairForm] = useState({
    repair_description: '',
    repaired_by: '',
    repair_status: 'запланирован',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRepairForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = () => {
    handleSubmit(repairForm);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Запись о ремонте стенда</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Описание проблемы/ремонта"
            name="repair_description"
            value={repairForm.repair_description}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            multiline
            rows={4}
            required
          />
          <TextField
            fullWidth
            label="Кем выполняется"
            name="repaired_by"
            value={repairForm.repaired_by}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Статус ремонта</InputLabel>
            <Select
              name="repair_status"
              value={repairForm.repair_status}
              onChange={handleInputChange}
              label="Статус ремонта"
            >
              <MenuItem value="запланирован">Запланирован</MenuItem>
              <MenuItem value="в процессе">В процессе</MenuItem>
              <MenuItem value="завершен">Завершен</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button
          onClick={handleFormSubmit}
          variant="contained"
          disabled={!repairForm.repair_description || !repairForm.repaired_by}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RepairModal;
