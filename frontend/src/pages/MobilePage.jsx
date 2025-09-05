import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  TablePagination,
  Badge,
  Tooltip
} from '@mui/material';
import { useGetAllMobilesQuery } from '../api/apiMobile';
import CircleLoader from '../components/common/CircleLoader';
import ErrorMessage from '../components/common/ErrorMessage';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import MobileUploadModal from '../components/modals/MobileUploadModal';
import MobileFilterModal from '../components/modals/MobileFilterModal';
import MobileTable from '../components/MobileTable';

function MobilePage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [filterParams, setFilterParams] = useState({
    page: 1,
    limit: 10,
  });
  
  useEffect(() => {
    const { page, limit, ...otherParams } = filterParams;
    const activeFiltersCount = Object.keys(otherParams).length;
    setActiveFilters(activeFiltersCount);
  }, [filterParams]);

  const handleUploadModalOpen = () => setUploadModalOpen(true);
  const handleUploadModalClose = () => setUploadModalOpen(false);
  const handleFilterModalOpen = () => setFilterModalOpen(true);
  const handleFilterModalClose = () => setFilterModalOpen(false);

  const applyFilters = (filters) => {
    const currentPage = filterParams.page;
    const currentLimit = filterParams.limit;
    const newParams = {
      page: 1,
      limit: currentLimit,
    };
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        newParams[key] = filters[key];
      }
    });
    setFilterParams(newParams);
  };

  const handleChangePage = (event, newPage) => {
    setFilterParams({
      ...filterParams,
      page: newPage + 1,
    });
  };

  const handleChangeRowsPerPage = (event) => {
    setFilterParams({
      ...filterParams,
      limit: parseInt(event.target.value, 10),
      page: 1,
    });
  };

  const { data, isLoading, isError } = useGetAllMobilesQuery(filterParams);

  if (isLoading) return <CircleLoader />;
  if (isError) return <ErrorMessage />;

  const mobiles = data?.mobiles || [];
  const total = data?.total || 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          borderRadius: 1
        }}
      > 
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Badge
              badgeContent={activeFilters > 0 ? activeFilters : null}
              color="error"
              overlap="circular"
            >
              <Tooltip title="Фильтровать приложения" placement="left">
                <Button
                  onClick={handleFilterModalOpen}
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

            <Tooltip title="Загрузить APK" placement="left">
              <Button
                variant="contained"
                color="primary"
                onClick={handleUploadModalOpen}
                sx={{
                  minWidth: '50px',
                  width: '50px',
                  height: '50px',
                  p: 0,
                  borderRadius: 1
                }}
              >
                <AddIcon />
              </Button>
            </Tooltip>
          </Box>

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

        <MobileTable mobiles={mobiles} />
        
        {mobiles.length === 0 && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Приложения не найдены. Загрузите новое APK или измените параметры фильтра.
            </Typography>
          </Box>
        )}
      </Paper>

      <MobileUploadModal
        open={uploadModalOpen}
        handleClose={handleUploadModalClose}
      />
      
      <MobileFilterModal
        open={filterModalOpen}
        handleClose={handleFilterModalClose}
        applyFilters={applyFilters}
        initialFilters={filterParams}
      />
    </Box>
  );
}

export default MobilePage;