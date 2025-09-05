import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Box,
} from '@mui/material';
import { useAddMobileFileMutation } from '../../api/apiMobile';

function MobileFileUploadModal({ open, onClose, id, onUpdate }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [addMobileFile] = useAddMobileFileMutation();

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', fileType);

      await addMobileFile({ id, formData }).unwrap();
      onUpdate({ success: true, message: 'Файл успешно добавлен' });
      setSelectedFile(null);
      setFileType('');
      onClose();
    } catch (error) {
      onUpdate({ success: false, message: error.data?.message || 'Не удалось добавить файл' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить файл</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ p: 2, textAlign: 'left' }}
          >
            {selectedFile ? (selectedFile.name.length > 50 ? `${selectedFile.name.substring(0, 47)}...` : selectedFile.name) : 'Выберите файл'}
            <input
              type="file"
              hidden
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </Button>
          <Autocomplete
            options={['Приложение', 'Спецификация', 'Изображение', 'Файл', 'Другое']}
            value={fileType}
            onChange={(event, newValue) => setFileType(newValue || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Тип файла"
                fullWidth
                placeholder="Выберите тип файла"
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedFile || !fileType}
        >
          Загрузить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MobileFileUploadModal;