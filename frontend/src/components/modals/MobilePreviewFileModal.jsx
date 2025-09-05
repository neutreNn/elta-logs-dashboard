import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import truncateText from '../../utils/truncateText';

function MobilePreviewFileModal({ open, onClose, fileName, url, content, previewType }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Предпросмотр: {truncateText(fileName, 50)}</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          maxHeight: '70vh',
          p: 2,
        }}
      >
        {previewType === 'image' && url ? (
          <img
            src={url}
            alt={fileName}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        ) : previewType === 'pdf' && url ? (
          <iframe
            src={url}
            title={fileName}
            style={{ width: '100%', height: '70vh', border: 'none' }}
          />
        ) : previewType === 'text' && content ? (
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'auto', maxHeight: '70vh', width: '100%' }}>
            {content}
          </pre>
        ) : (
          <CircularProgress />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

export default MobilePreviewFileModal;