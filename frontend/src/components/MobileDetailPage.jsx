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
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  CardContent
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useGetMobileByIdQuery,
  useDeleteMobileMutation,
  useDownloadMobileMutation,
  useDeleteMobileFileMutation
} from '../api/apiMobile';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Description as FileIcon,
  Visibility as VisibilityIcon,
  AppSettingsAlt as AppSettingsAltIcon,
  StarBorder as SpecIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import CircleLoader from '../components/common/CircleLoader';
import ErrorMessage from '../components/common/ErrorMessage';
import MobileUpdateModal from './modals/MobileUpdateModal';
import MobileFileUploadModal from './modals/MobileFileUploadModal';
import MobileDeleteFileModal from './modals/MobileDeleteFileModal';
import MobilePreviewFileModal from './modals/MobilePreviewFileModal';
import formatDate from '../utils/formatDate';
import truncateText from '../utils/truncateText';
import formatFileSize from '../utils/formatFileSize';
import getPreviewType from '../utils/getPreviewType';
import MobileDeleteModal from './modals/MobileDeleteModal';

function MobileDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const [addFileDialogOpen, setAddFileDialogOpen] = useState(false);

  const [deleteFileDialogOpen, setDeleteFileDialogOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState(null);
  const [deleteFileName, setDeleteFileName] = useState('');
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  const [previewDialog, setPreviewDialog] = useState({
    open: false,
    fileName: '',
    url: '',
    content: '',
    previewType: ''
  });
  
  const { data: mobile, isLoading, isError } = useGetMobileByIdQuery(id);
  const [downloadMobile] = useDownloadMobileMutation();
  const [deleteMobile] = useDeleteMobileMutation();
  const [deleteMobileFile] = useDeleteMobileFileMutation();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePreviewMobile = async (file, fileIndex) => {
    try {
      const ext = file.file_name.toLowerCase().split('.').pop();
      const previewType = getPreviewType(ext);

      if (!previewType) {
        setSnackbarSeverity('warning');
        setSnackbarMessage('Предпросмотр не поддерживается для этого типа файла');
        setSnackbarOpen(true);
        return;
      }

      const blob = await downloadMobile({ id, fileIndex, fileName: file.file_name }).unwrap();
      const url = window.URL.createObjectURL(blob);

      if (previewType === 'text') {
        const textContent = await blob.text();
        setPreviewDialog({
          open: true,
          fileName: file.file_name,
          url: '',
          content: textContent,
          previewType: 'text'
        });
      } else {
        setPreviewDialog({
          open: true,
          fileName: file.file_name,
          url,
          content: '',
          previewType
        });
      }
    } catch (error) {
      console.error('Ошибка при предпросмотре файла:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage(error.data?.message || 'Не удалось загрузить файл для предпросмотра');
      setSnackbarOpen(true);
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteMobile = async () => {
    try {
      await deleteMobile(id).unwrap();
      handleCloseDeleteDialog();
      navigate('/mobile');
    } catch (error) {
      console.error('Ошибка при удалении записи:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage(error.data?.message || 'Не удалось удалить запись');
      setSnackbarOpen(true);
      handleCloseDeleteDialog();
    }
  };

  const handleDownloadMobile = async (file, fileIndex) => {
    try {
      const blob = await downloadMobile({ id, fileIndex, fileName: file.file_name }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage(error.data?.message || 'Не удалось скачать файл');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleUpdate = ({ success, message }) => {
    setSnackbarSeverity(success ? 'success' : 'error');
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleDeleteMobileFile = (fileName, fileId) => {
    setDeleteFileName(fileName);
    setDeleteFileId(fileId);
    setDeleteFileDialogOpen(true);
  };

  const handleConfirmDeleteMobileFile = async () => {
    setIsDeletingFile(true);
    try {
      await deleteMobileFile(deleteFileId).unwrap();
      setDeleteFileDialogOpen(false);
      setSnackbarSeverity('success');
      setSnackbarMessage('Файл успешно удален');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage(error.data?.message || 'Ошибка при удалении файла');
      setSnackbarOpen(true);
    } finally {
      setIsDeletingFile(false);
      setDeleteFileId(null);
      setDeleteFileName('');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'Приложение') {
      return <AppSettingsAltIcon sx={{ color: '#1976d2' }} />;
    }
    if (fileType === 'Спецификация') {
      return <SpecIcon />;
    }
    if (fileType === 'Изображение') {
      return <ImageIcon />;
    }
    return <FileIcon />;
  };

  if (isLoading) return <CircleLoader />;
  if (isError || !mobile) return <ErrorMessage message="Не удалось загрузить информацию о записи" />;

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
              bgcolor: 'info.light',
              color: 'info.dark',
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PhoneAndroidIcon />
            </Box>
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                {truncateText(mobile.name, 30)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Редактировать">
              <Button
                variant="contained"
                color="primary"
                sx={{
                  minWidth: '50px',
                  width: '50px',
                  height: '50px',
                  p: 0,
                  borderRadius: 1
                }}
                onClick={handleOpenEditDialog}
              >
                <EditIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Удалить">
              <Button
                variant="outlined"
                color="error"
                sx={{
                  minWidth: '50px',
                  width: '50px',
                  height: '50px',
                  p: 0,
                  borderRadius: 1
                }}
                onClick={handleOpenDeleteDialog}
              >
                <DeleteIcon color="error" />
              </Button>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Информация о записи
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <List disablePadding>
                <ListItem divider>
                  <ListItemText 
                    primary="Дата загрузки" 
                    secondary={formatDate(mobile.upload_date)} 
                  />
                </ListItem>
              </List>
            </Card>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
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
                {mobile.description || "Описание отсутствует"}
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Файлы
              </Typography>
              <Tooltip title="Добавить файл">
                <IconButton onClick={() => setAddFileDialogOpen(true)}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Card variant="outlined" sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              height: '450px'
            }}>
              <CardContent variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1
                }}>
                  {mobile.files && mobile.files.length > 0 ? (
                    mobile.files.map((file, index) => (
                      <Paper
                        key={index}
                        variant="outlined"
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          '&:hover': { backgroundColor: '#f5f5f5' },
                          ...(file.file_type === 'Приложение' && {
                            border: '2px solid #1976d2',
                            backgroundColor: '#e3f2fd',
                            '&:hover': { backgroundColor: '#bbdefb' },
                          }),
                        }}
                      >
                        {getFileIcon(file.file_type)}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              ...(file.file_type === 'Приложение' && {
                                fontWeight: 'bold',
                                color: "#1976d2",
                              }),
                            }}
                            title={file.file_name}
                          >
                            {truncateText(file.file_name)}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{
                              ...(file.file_type === 'Приложение' && {
                                color: '#1976d2',
                                fontWeight: 500,
                              }),
                            }}
                          >
                            {file.file_type} • {formatFileSize(file.file_size)} • {formatDate(file.created_date)}
                          </Typography>
                        </Box>
                        <Tooltip title={"Просмотр"}>
                          <IconButton
                            onClick={() => handlePreviewMobile(file, index)}
                            disabled={!getPreviewType(file.file_name.toLowerCase().split('.').pop())}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Скачать">
                          <IconButton onClick={() => handleDownloadMobile(file, index)}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton onClick={() => handleDeleteMobileFile(file.file_name, file._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                      Файлы не добавлены
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <MobileUpdateModal
        open={editDialogOpen}
        handleClose={handleCloseEditDialog}
        id={id}
        initialName={mobile.name}
        initialDescription={mobile.description || ''}
        onUpdate={handleUpdate}
      />

      <MobileFileUploadModal
        open={addFileDialogOpen}
        onClose={() => setAddFileDialogOpen(false)}
        id={id}
        onUpdate={handleUpdate}
      />

      <MobileDeleteFileModal
        open={deleteFileDialogOpen}
        onClose={() => setDeleteFileDialogOpen(false)}
        onConfirm={handleConfirmDeleteMobileFile}
        isDeleting={isDeletingFile}
        fileName={deleteFileName}
      />

      <MobilePreviewFileModal
        open={previewDialog.open}
        onClose={() => {
          if (previewDialog.url) {
            window.URL.revokeObjectURL(previewDialog.url);
          }
          setPreviewDialog({ open: false, fileName: '', url: '', content: '', previewType: '' });
        }}
        fileName={previewDialog.fileName}
        url={previewDialog.url}
        content={previewDialog.content}
        previewType={previewDialog.previewType}
      />

      <MobileDeleteModal
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        handleDelete={handleDeleteMobile}
        name={mobile.name}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MobileDetailPage;