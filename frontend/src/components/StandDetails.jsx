import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import { 
  useGetStandByIdQuery, 
  useUpdateStandMutation, 
  useAddRepairRecordMutation,
  useRemoveStandMutation
} from '../api/apiStands';
import CircleLoader from './common/CircleLoader';
import RepairModal from './modals/RepairModal';
import formatDate from '../utils/formatDate';
import StandModal from './modals/StandModal';
import { statusColors } from '../constants/statusColors';

function StandDetails() {
  const { standId } = useParams();
  const navigate = useNavigate();
  
  // Состояния для модальных окон
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [repairDialogOpen, setRepairDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Состояния для форм
  const [editForm, setEditForm] = useState({
    software_version_stand: '',
    hardware_version_stand: '',
    serial_number_ob_jlink: '',
    status: '',
    additional_notes: ''
  });
  
  const [repairForm, setRepairForm] = useState({
    repair_description: '',
    repaired_by: '',
    repair_status: 'запланирован'
  });
  
  // RTK Query хуки
  const { data: stand, isLoading, isError, refetch } = useGetStandByIdQuery(standId);
  const [updateStand, { isLoading: isUpdating }] = useUpdateStandMutation();
  const [addRepairRecord, { isLoading: isAddingRepair }] = useAddRepairRecordMutation();
  const [removeStand, { isLoading: isRemoving }] = useRemoveStandMutation();
  
  // Обработчики для диалоговых окон
  const handleEditDialogOpen = () => {
    if (stand) {
      setEditForm({
        software_version_stand: stand.software_version_stand || '',
        hardware_version_stand: stand.hardware_version_stand || '',
        serial_number_ob_jlink: stand.serial_number_ob_jlink || '',
        status: stand.status || 'активен',
        additional_notes: stand.additional_notes || ''
      });
      setEditDialogOpen(true);
    }
  };
  
  const handleEditDialogClose = () => setEditDialogOpen(false);
  const handleRepairDialogOpen = () => setRepairDialogOpen(true);
  const handleRepairDialogClose = () => setRepairDialogOpen(false);
  const handleDeleteDialogOpen = () => setDeleteDialogOpen(true);
  const handleDeleteDialogClose = () => setDeleteDialogOpen(false);
  
  const handleEditSubmit = async (editFormData) => {
    try {
      await updateStand({ standId, ...editFormData }).unwrap();
      handleEditDialogClose();
      refetch();
    } catch (error) {
      console.error('Ошибка при обновлении стенда:', error);
    }
  };
  
  const handleRepairSubmit = async (repairForm) => {
    try {
      await addRepairRecord({ standId, ...repairForm }).unwrap();
      handleRepairDialogClose();
      setRepairForm({
        repair_description: '',
        repaired_by: '',
        repair_status: 'запланирован'
      });
      refetch();
    } catch (error) {
      console.error('Ошибка при добавлении записи о ремонте:', error);
    }
  };
  
  const handleDeleteSubmit = async () => {
    try {
      await removeStand(standId).unwrap();
      handleDeleteDialogClose();
      navigate('/stands');
    } catch (error) {
      console.error('Ошибка при удалении стенда:', error);
    }
  };
  
  const handleBack = () => navigate('/stands');
  
  if (isLoading) return <CircleLoader />;
  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке информации о стенде. Пожалуйста, попробуйте позже.
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
          onClick={handleBack}
        >
          Вернуться к списку стендов
        </Button>
      </Box>
    );
  }
  
  if (!stand) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Стенд не найден.
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
          onClick={handleBack}
        >
          Вернуться к списку стендов
        </Button>
      </Box>
    );
  }

  const editFormData = {
    stand_id: stand.stand_id,
    software_version_stand: stand.software_version_stand || '',
    hardware_version_stand: stand.hardware_version_stand || '',
    serial_number_ob_jlink: stand.serial_number_ob_jlink || '',
    status: stand.status || 'активен',
    additional_notes: stand.additional_notes || ''
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок с навигацией и действиями */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Информация о стенде: {stand.stand_id}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Редактировать стенд">
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />} 
              onClick={handleEditDialogOpen}
              sx={{ mr: 1 }}
            >
              Редактировать
            </Button>
          </Tooltip>
          <Tooltip title="Добавить запись о ремонте">
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<BuildIcon />} 
              onClick={handleRepairDialogOpen}
              sx={{ mr: 1 }}
            >
              Ремонт
            </Button>
          </Tooltip>
          <Tooltip title="Удалить стенд">
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />} 
              onClick={handleDeleteDialogOpen}
            >
              Удалить
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Основная информация о стенде */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Основная информация
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">ID стенда</Typography>
            <Typography variant="body1" fontWeight="medium">{stand.stand_id}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">Статус</Typography>
            <Chip 
              label={stand.status} 
              color={statusColors[stand.status]} 
              sx={{ mt: 0.5 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">Программная версия</Typography>
            <Typography variant="body1">{stand.software_version_stand || "Не указана"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">Аппаратная версия</Typography>
            <Typography variant="body1">{stand.hardware_version_stand || "Не указана"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">OB-JLINK</Typography>
            <Typography variant="body1">{stand.serial_number_ob_jlink || "Не указан"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">Последнее использование</Typography>
            <Typography variant="body1">{formatDate(stand.last_used)}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Примечания</Typography>
            <Typography variant="body1">{stand.additional_notes || "Отсутствуют"}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* История ремонтов */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          История ремонтов
        </Typography>
        
        {stand.repair_history && stand.repair_history.length > 0 ? (
          <TableContainer>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell>Кем выполнено</TableCell>
                    <TableCell>Статус</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stand.repair_history.slice().reverse().map((repair, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{formatDate(repair.repair_date)}</TableCell>
                      <TableCell sx={{ maxWidth: 300, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {repair.repair_description}
                      </TableCell>
                      <TableCell>{repair.repaired_by}</TableCell>
                      <TableCell>
                        <Chip 
                          label={repair.repair_status} 
                          size="small" 
                          color={
                            repair.repair_status === 'запланирован' ? 'info' :
                            repair.repair_status === 'в процессе' ? 'warning' :
                            repair.repair_status === 'завершен' ? 'success' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </TableContainer>
        ) : (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
            История ремонтов отсутствует
          </Typography>
        )}
      </Paper>

      <StandModal
        open={editDialogOpen}
        handleClose={handleEditDialogClose}
        onSubmit={handleEditSubmit}
        isLoading={isUpdating}
        initialData={editFormData}
        isEditMode={true}
      />

      <RepairModal 
        open={repairDialogOpen} 
        handleClose={handleRepairDialogClose} 
        handleSubmit={handleRepairSubmit}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить стенд <strong>{stand.stand_id}</strong>? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Отмена</Button>
          <Button 
            onClick={handleDeleteSubmit} 
            color="error" 
            variant="contained"
            disabled={isRemoving}
          >
            {isRemoving ? "Удаление..." : "Удалить"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StandDetails;