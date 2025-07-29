import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Badge, 
  Tooltip, 
  TablePagination 
} from '@mui/material';
import { useGetAllLogsErrorsQuery, useMarkAllErrorsAsViewedMutation } from '../api/apiErrorsLogs';
import FilterListIcon from '@mui/icons-material/FilterList';
import CircleLoader from '../components/common/CircleLoader';
import ErrorMessage from '../components/common/ErrorMessage';
import FilterModal from '../components/modals/FilterModal';
import ErrorCard from '../components/ErrorCard';

function LogsErrorsPage() {
  const [filterParams, setFilterParams] = useState({
    page: 1,
    limit: 10
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  const { data: errorLogs, isError, isLoading } = useGetAllLogsErrorsQuery(filterParams);
  const [markAllAsViewed] = useMarkAllErrorsAsViewedMutation();

  useEffect(() => {
    markAllAsViewed().unwrap()
      .then(() => {
        console.log('Все ошибки отмечены как просмотренные');
      })
      .catch((error) => {
        console.error('Ошибка при отметке ошибок как просмотренных:', error);
      });
  }, []);

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
      page: newPage + 1
    });
  };

  const handleChangeRowsPerPage = (event) => {
    setFilterParams({
      ...filterParams,
      limit: parseInt(event.target.value, 10),
      page: 1
    });
  };

  if (isLoading) return <CircleLoader />;
  if (isError) return <ErrorMessage />;

  const totalPages = errorLogs?.totalPages || 0;
  const total = errorLogs?.total || 0;

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
          <Tooltip title="Фильтровать ошибки" placement="left">
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
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Записей на странице:"
        />
      </Box>
      <Box>
        {errorLogs?.logs?.length > 0 ? (
          errorLogs.logs.map((error, idx) => (
            <ErrorCard key={idx} error={error} />
          ))
        ) : (
          <Typography>Нет данных по ошибкам</Typography>
        )}
      </Box>
      <FilterModal 
        open={modalOpen} 
        handleClose={handleModalClose}
        applyFilters={applyFilters}
      />
    </Box>
  );
}

export default LogsErrorsPage;
