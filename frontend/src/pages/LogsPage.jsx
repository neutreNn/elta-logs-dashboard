import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Box, 
  Typography, 
  Tooltip, 
  Badge, 
  TablePagination
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useGetAllOperatorsQuery } from '../api/apiLogs';
import CircleLoader from '../components/common/CircleLoader';
import ErrorMessage from '../components/common/ErrorMessage';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterModal from '../components/modals/FilterModal';

function LogsPage() {
  const [filterParams, setFilterParams] = useState({
    page: 1,
    limit: 10
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  const { data, isError, isLoading } = useGetAllOperatorsQuery(filterParams);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const applyFilters = (filters) => {
    const activeFiltersCount = Object.keys(filters).length;
    setActiveFilters(activeFiltersCount);

    if (activeFiltersCount === 0) {
      setFilterParams({
        page: 1,
        limit: filterParams.limit
      });
    } else {
      setFilterParams({
        ...filterParams,
        ...filters,
        page: 1
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setFilterParams({
      ...filterParams,
      page: newPage + 1,
    });
  };

  if (isLoading) return <CircleLoader />;
  if (isError) return <ErrorMessage />;

  const logs = data?.operatorSettings || [];
  const totalPages = data?.totalPages || 0;
  const total = data?.total || 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Badge
          badgeContent={activeFilters > 0 ? activeFilters : null}
          color="error"
          overlap="circular"
        >
          <Tooltip title="Фильтровать логи" placement="left">
            <Button
              onClick={handleModalOpen}
              variant={activeFilters > 0 ? "contained" : "outlined"}
              color="primary"
              sx={{
                minWidth: '50px',
                width: '50px',
                height: '50px',
                p: 0,
                borderRadius: 1
              }}
            >
              <FilterListIcon />
            </Button>
          </Tooltip>
        </Badge>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={filterParams.limit}
          page={filterParams.page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={(event) => {
            setFilterParams({
              ...filterParams,
              limit: parseInt(event.target.value, 10),
              page: 1,
            });
          }}
          labelRowsPerPage="Записей на странице:"
        />
      </Box>
      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Дата</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ID стенда</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Программная версия</TableCell> 
              <TableCell sx={{ fontWeight: 'bold' }}>Аппаратная версия</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Прошивка</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log._id} hover>
                  <TableCell>{log.application_start_time}</TableCell>
                  <TableCell>{log.stand_id}</TableCell>
                  <TableCell>{log.software_version_stand}</TableCell>
                  <TableCell>{log.hardware_version_stand}</TableCell>
                  <TableCell>{log.device_firmware_version}</TableCell>
                  <TableCell>
                    <Button 
                      component={Link} 
                      to={`/logs/${log._id}`} 
                      variant="outlined" 
                      size="small"
                      sx={{ borderRadius: 1 }}
                    >
                      Просмотреть
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">Нет данных для отображения</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <FilterModal 
        open={modalOpen} 
        handleClose={handleModalClose}
        applyFilters={applyFilters}
      />
    </Box>
  );
}

export default LogsPage;
