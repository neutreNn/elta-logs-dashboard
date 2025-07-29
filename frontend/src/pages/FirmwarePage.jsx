import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Button,
  TablePagination,
  Badge,
  Tooltip
} from '@mui/material';
import { useGetAllFirmwaresQuery } from '../api/apiFirmware';
import CircleLoader from '../components/common/CircleLoader';
import ErrorMessage from '../components/common/ErrorMessage';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import FirmwareUploadModal from '../components/modals/FirmwareUploadModal';
import FirmwareFilterModal from '../components/modals/FirmwareFilterModal';
import FirmwareTable from '../components/FirmwareTable';

const FirmwareTabs = ({ value, onChange }) => {
  return (
    <Tabs 
      value={value} 
      onChange={onChange} 
      variant="fullWidth" 
      indicatorColor="primary"
      textColor="primary"
      sx={{ mb: 3 }}
    >
      <Tab label="Все прошивки" value="all" />
      <Tab label="Стенды" value="stand" />
      <Tab label="Приборы" value="device" />
      <Tab label="Приложения" value="desktop" />
    </Tabs>
  );
};

function FirmwarePage() {
  const [tabValue, setTabValue] = useState('all');
  const [subTabValue, setSubTabValue] = useState('all');
  const [standSubTabValue, setStandSubTabValue] = useState('all');
  const [desktopSubTabValue, setDesktopSubTabValue] = useState('all');
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSubTabValue('all');
    setStandSubTabValue('all');
    setDesktopSubTabValue('all');
    const newParams = {
      page: 1,
      limit: filterParams.limit,
    };
    if (newValue !== 'all') {
      newParams.type = newValue;
    }
    setFilterParams(newParams);
  };

  const handleSubTabChange = (event, newValue) => {
    setSubTabValue(newValue);
    const newParams = {
      ...filterParams,
      page: 1,
      type: 'device',
    };
    if (newValue !== 'all') {
      newParams.subType = newValue;
    } else {
      delete newParams.subType;
    }
    setFilterParams(newParams);
  };

  const handleStandSubTabChange = (event, newValue) => {
    setStandSubTabValue(newValue);
    const newParams = {
      ...filterParams,
      page: 1,
      type: 'stand',
    };
    if (newValue !== 'all') {
      newParams.subType = newValue;
    } else {
      delete newParams.subType;
    }
    setFilterParams(newParams);
  };

  const handleDesktopSubTabChange = (event, newValue) => {
    setDesktopSubTabValue(newValue);
    const newParams = {
      ...filterParams,
      page: 1,
      type: 'desktop',
    };
    if (newValue !== 'all') {
      newParams.subType = newValue;
    } else {
      delete newParams.subType;
    }
    setFilterParams(newParams);
  };

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
    if (tabValue !== 'all') {
      newParams.type = tabValue;
    }
    if (tabValue === 'device' && subTabValue !== 'all') {
      newParams.subType = subTabValue;
    } else if (tabValue === 'stand' && standSubTabValue !== 'all') {
      newParams.subType = standSubTabValue;
    } else if (tabValue === 'desktop' && desktopSubTabValue !== 'all') {
      newParams.subType = desktopSubTabValue;
    }
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

  const { data, isLoading, isError } = useGetAllFirmwaresQuery(filterParams);

  if (isLoading) return <CircleLoader />;
  if (isError) return <ErrorMessage />;

  const firmwares = data?.firmwares || [];
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
        <FirmwareTabs value={tabValue} onChange={handleTabChange} />
        
        {tabValue === 'device' && (
          <Tabs 
            value={subTabValue} 
            onChange={handleSubTabChange}
            variant="fullWidth" 
            indicatorColor="secondary"
            textColor="secondary"
            sx={{ mb: 2 }}
          >
            <Tab label="Все виды" value="all" />
            <Tab label="Voice" value="voice" />
            <Tab label="Express" value="express" />
            <Tab label="Online" value="online" />
          </Tabs>
        )}

        {tabValue === 'stand' && (
          <Tabs 
            value={standSubTabValue} 
            onChange={handleStandSubTabChange}
            variant="fullWidth" 
            indicatorColor="secondary"
            textColor="secondary"
            sx={{ mb: 2 }}
          >
            <Tab label="Все виды" value="all" />
            <Tab label="Приборы" value="devices" />
            <Tab label="Тест-полоски" value="test-strips" />
          </Tabs>
        )}

        {tabValue === 'desktop' && (
          <Tabs 
            value={desktopSubTabValue} 
            onChange={handleDesktopSubTabChange}
            variant="fullWidth" 
            indicatorColor="secondary"
            textColor="secondary"
            sx={{ mb: 2 }}
          >
            <Tab label="Все виды" value="all" />
            <Tab label="Приборы" value="devices" />
            <Tab label="Тест-полоски" value="test-strips" />
          </Tabs>
        )}
        
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
              <Tooltip title="Фильтровать прошивки" placement="left">
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

            <Tooltip title="Загрузить прошивку" placement="left">
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

        <FirmwareTable firmwares={firmwares} />
        
        {firmwares.length === 0 && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Прошивки не найдены. Загрузите новую прошивку или измените параметры фильтра.
            </Typography>
          </Box>
        )}
      </Paper>

      <FirmwareUploadModal
        open={uploadModalOpen}
        handleClose={handleUploadModalClose}
      />
      
      <FirmwareFilterModal
        open={filterModalOpen}
        handleClose={handleFilterModalClose}
        applyFilters={applyFilters}
        initialFilters={filterParams}
      />
    </Box>
  );
}

export default FirmwarePage;