import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Container, 
  Button, 
  FormControl, 
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import StandCard from '../components/StandCard';
import { useGetAllStandsQuery, useCreateStandMutation } from '../api/apiStands';
import StandModal from '../components/modals/StandModal';

const StandsPage = () => {
  const [filterParams, setFilterParams] = useState({
    status: '',
    page: 1,
    limit: 12
  });

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [errors, setErrors] = useState({});

  const { data, isLoading, isFetching, refetch } = useGetAllStandsQuery(filterParams);
  const [createStand, { isLoading: isCreating }] = useCreateStandMutation();

  const handleCreateDialogOpen = () => {
    setOpenCreateDialog(true);
    setErrors({});
  };

  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
    setErrors({});
  };

  const handleCreateStand = async (standData) => {
    try {
      await createStand(standData).unwrap();
      handleCreateDialogClose();
    } catch (error) {
      console.error('Ошибка при создании стенда:', error);
      if (error.status === 400 && error.data?.message.includes('уже существует')) {
        setErrors({
          stand_id: 'Стенд с таким ID уже существует'
        });
      }
    }
  };

  const handleStatusFilterChange = (e) => {
    setFilterParams({
      ...filterParams,
      status: e.target.value,
      page: 1
    });
  };

  const handleClearFilters = () => {
    setFilterParams({
      status: '',
      page: 1,
      limit: filterParams.limit
    });
  };

  const handlePageChange = (event, value) => {
    setFilterParams({
      ...filterParams,
      page: value
    });
  };

  const stands = data?.stands || [];
  const totalPages = data?.totalPages || 1;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      
      <Box 
        sx={{ 
          mb: 4, 
          p: 2, 
          bgcolor: 'background.paper', 
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)', 
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <FilterListIcon color="action" />
        <Typography variant="subtitle1" fontWeight="medium">
          Фильтры:
        </Typography>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={filterParams.status}
            onChange={handleStatusFilterChange}
            label="Статус"
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="активен">Активен</MenuItem>
            <MenuItem value="требует обслуживания">Требует обслуживания</MenuItem>
            <MenuItem value="в ремонте">В ремонте</MenuItem>
            <MenuItem value="не активен">Не активен</MenuItem>
          </Select>
        </FormControl>
        {(filterParams.status) && (
          <Button 
            startIcon={<HighlightOffIcon />}
            size="small"
            onClick={handleClearFilters}
            color="primary"
          >
            Сбросить
          </Button>
        )}
        <Box sx={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
          >
            Добавить стенд
          </Button>
          
          <Tooltip title="Обновить список">
            <IconButton 
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : stands.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {stands.map((stand) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={stand._id}>
                <StandCard stand={stand} />
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={filterParams.page} 
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      ) : (
        <Box 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Стенды не найдены
          </Typography>
          <Typography color="text.secondary" align="center">
            {filterParams.status ? 
              `Нет стендов со статусом "${filterParams.status}".` : 
              'В системе пока нет стендов.'}
          </Typography>
          {filterParams.status && (
            <Button 
              onClick={handleClearFilters} 
              sx={{ mt: 2 }}
              variant="outlined"
            >
              Сбросить фильтры
            </Button>
          )}
        </Box>
      )}
      <StandModal
        open={openCreateDialog}
        handleClose={handleCreateDialogClose}
        onSubmit={handleCreateStand}
        isLoading={isCreating}
        errors={errors}
        isEditMode={false}
      />
    </Container>
  );
};

export default StandsPage;