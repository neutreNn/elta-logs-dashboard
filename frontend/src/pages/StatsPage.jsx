import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Chip,
  Button,
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import SpeedIcon from '@mui/icons-material/Speed';
import { useGetErrorsAggregatedStatsQuery } from '../api/apiErrorsLogs';
import { useGetAllStandsQuery } from '../api/apiStands';
import { useGetSuccessfulCalibrationQuery } from '../api/apiLogs';
import CircleLoader from '../components/common/CircleLoader';
import StatCard from '../components/StatCard';
import SectionTitle from '../components/SectionTitle';
import FilterStatsModal from '../components/modals/FilterStatsModal';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useGetOperatorNamesQuery } from '../api/apiOperators';

const chartColors = {
  primary: '#3f51b5',
  secondary: '#f50057',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  grey: '#9e9e9e'
};

const COLORS = [
  chartColors.primary,
  chartColors.error,
  chartColors.secondary,
  chartColors.success,
  chartColors.warning,
  chartColors.info
];

function StatsPage() {
  const theme = useTheme();

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    startMonth: new Date().getMonth(),
    startYear: new Date().getFullYear(),
    endMonth: new Date().getMonth(),
    endYear: new Date().getFullYear(),
    stand: '',
    deviceType: '',
    operator: '',
    device_firmware_version_min: '',
    device_firmware_version_max: '',
  });

  const getQueryParams = () => {
    const { 
      startMonth, 
      startYear, 
      endMonth, 
      endYear, 
      stand, 
      deviceType, 
      operator, 
      device_firmware_version_min, 
      device_firmware_version_max 
    } = filters;
    
    const startDate = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-01`;

    const lastDay = new Date(endYear, endMonth + 1, 0).getDate();
    const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-${lastDay}`;
    
    let params = {
      application_start_time_from: startDate,
      application_start_time_to: endDate
    };
    
    if (stand) params.stand_id = stand;
    if (deviceType) params.device_type = deviceType;
    if (operator) params.operator_name = operator;
    if (device_firmware_version_min) params.device_firmware_version_min = device_firmware_version_min;
    if (device_firmware_version_max) params.device_firmware_version_max = device_firmware_version_max;
    
    return params;
  };

  const queryParams = getQueryParams();
  const { data: errorsAggregatedData, isLoading: isLoadingErrors } = useGetErrorsAggregatedStatsQuery(queryParams);
  const { data: standsData, isLoading: isLoadingStands } = useGetAllStandsQuery({limit: 100});
  const { data: operatorsNamesData, isLoading: isLoadingOperatorsNames } = useGetOperatorNamesQuery();
  const { data: calibrationStatsData, isLoading: isLoadingCalibrationStats } = useGetSuccessfulCalibrationQuery(queryParams);

  const handleOpenFilterModal = () => {
    setFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setFilterModalOpen(false);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = () => {
    const currentDate = new Date();
    return filters.startMonth !== currentDate.getMonth() || 
           filters.startYear !== currentDate.getFullYear() || 
           filters.endMonth !== currentDate.getMonth() || 
           filters.endYear !== currentDate.getFullYear() ||
           !!filters.stand ||
           !!filters.deviceType ||
           !!filters.operator;
  };

    const getFilterPeriodText = () => {
      const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ];
      
      const { startMonth, startYear, endMonth, endYear } = filters;
      
      if (startMonth === endMonth && startYear === endYear) {
        return `${monthNames[startMonth]} ${startYear}`;
      }
      
      return `${monthNames[startMonth]} ${startYear} - ${monthNames[endMonth]} ${endYear}`;
    };

  const [errorsByStand, setErrorsByStand] = useState([]);
  const [errorsByOperator, setErrorsByOperator] = useState([]);
  const [errorsByDeviceType, setErrorsByDeviceType] = useState([]);
  const [errorsByNumber, setErrorsByNumber] = useState([]);
  const [topStandsWithErrors, setTopStandsWithErrors] = useState([]);
  const [errorTrends, setErrorTrends] = useState([]);
  const [calibrationTrends, setCalibrationTrends] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalSuccess: 0,
    totalErrors: 0,
    totalStands: 0,
    totalOperators: 0,
    activeStands: 0,
    standsInMaintenance: 0
  });

useEffect(() => {
  if (errorsAggregatedData && standsData?.stands && calibrationStatsData?.successfulCalibrationsByDay) {
    setErrorsByStand(errorsAggregatedData.errorsByStand);
    setErrorsByOperator(errorsAggregatedData.errorsByOperator);
    setErrorsByDeviceType(errorsAggregatedData.errorsByDeviceType);
    setErrorsByNumber(errorsAggregatedData.errorsByNumber);
    setTopStandsWithErrors(errorsAggregatedData.errorsByStand.slice(0, 5));

    const calibrationsByDay = {};

    const startDate = new Date(filters.startYear, filters.startMonth, 1);
    const endDate = new Date(filters.endYear, filters.endMonth + 1, 0);

    const currentDateSuccess = new Date(startDate);
    while (currentDateSuccess <= endDate) {
      const dateKey = currentDateSuccess.toISOString().split('T')[0];
      calibrationsByDay[dateKey] = 0;
      currentDateSuccess.setDate(currentDateSuccess.getDate() + 1);
    }

    if (calibrationStatsData.successfulCalibrationsByDay && Array.isArray(calibrationStatsData.successfulCalibrationsByDay)) {
      calibrationStatsData.successfulCalibrationsByDay.forEach(item => {
        calibrationsByDay[item.date] = item.count;
      });
    }

    const calibrationTrendData = Object.entries(calibrationsByDay).map(([date, count]) => {
      const formatDate = new Date(date);
      return {
        name: formatDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        fullDate: formatDate,
        successful: count
      };
    }).sort((a, b) => a.fullDate - b.fullDate);

    setCalibrationTrends(calibrationTrendData);

    const errorsByDay = {};
    
    const currentDateError = new Date(startDate);
    while (currentDateError <= endDate) {
      const dateKey = currentDateError.toISOString().split('T')[0];
      errorsByDay[dateKey] = 0;
      currentDateError.setDate(currentDateError.getDate() + 1);
    }

    if (errorsAggregatedData.errorsByDay && Array.isArray(errorsAggregatedData.errorsByDay)) {
      errorsAggregatedData.errorsByDay.forEach(item => {
        errorsByDay[item.date] = item.count;
      });
    }

    const trendData = Object.entries(errorsByDay).map(([date, count]) => {
      const formatDate = new Date(date);
      return {
        name: formatDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        fullDate: formatDate,
        errors: count
      };
    }).sort((a, b) => a.fullDate - b.fullDate);
    
    setErrorTrends(trendData);
    
    const activeStands = standsData.stands.filter(stand => stand.status === 'активен').length;
    const standsInMaintenance = standsData.stands.filter(stand => 
      stand.status === 'в ремонте' || stand.status === 'требует обслуживания'
    ).length;

    setTotalStats({
      totalSuccess: calibrationStatsData.totalSuccess || 0,
      totalErrors: errorsAggregatedData.totalErrors || 0,
      totalStands: standsData.total || 0,
      totalOperators: operatorsNamesData?.length || 0,
      activeStands,
      standsInMaintenance
    });
  }
}, [errorsAggregatedData, standsData, operatorsNamesData, calibrationStatsData, filters]);

  if (isLoadingErrors || isLoadingStands || isLoadingOperatorsNames || isLoadingCalibrationStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircleLoader />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, bgcolor: '#f5f5f7', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
          <Typography variant="subtitle1" color="textSecondary">
            Период: {getFilterPeriodText()}
          </Typography>
          {(filters.stand || filters.deviceType || filters.operator) && (
            <Typography variant="subtitle1" color="textSecondary">
              Фильтры: 
              {filters.stand && ` Стенд - ${filters.stand}`}
              {filters.deviceType && ` Тип устройства - ${filters.deviceType}`}
              {filters.operator && ` Оператор - ${filters.operator}`}
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          color={hasActiveFilters() ? "primary" : "inherit"}
          onClick={handleOpenFilterModal}
          sx={{ 
            borderRadius: 1, 
            width: '48px',
            minWidth: '48px',
            height: '48px',
            padding: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FilterListIcon />
        </Button>
      </Box>
      <FilterStatsModal
        open={filterModalOpen}
        onClose={handleCloseFilterModal}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />
      {/* Общая статистика */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Выпуски" 
            value={totalStats.totalSuccess}
            icon={<SpeedIcon sx={{ color: chartColors.primary }} />}
            color={chartColors.primary}
            subtitle={`${(totalStats.totalSuccess + totalStats.totalErrors) 
              ? Math.round((totalStats.totalSuccess / (totalStats.totalSuccess + totalStats.totalErrors)) * 100) 
              : 0}% от общего кол-во`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Ошибки" 
            value={totalStats.totalErrors}
            icon={<ErrorOutlineIcon sx={{ color: chartColors.error }} />}
            color={chartColors.error}
            subtitle={`${(totalStats.totalSuccess + totalStats.totalErrors) 
              ? Math.round((totalStats.totalErrors / (totalStats.totalSuccess + totalStats.totalErrors)) * 100) 
              : 0}% от общего кол-во`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Стенды" 
            value={totalStats.totalStands}
            icon={<SettingsIcon sx={{ color: chartColors.info }} />}
            color={chartColors.info}
            subtitle={`Активных: ${totalStats.activeStands} (${totalStats.totalStands ? Math.round((totalStats.activeStands / totalStats.totalStands) * 100) : 0}%)`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Операторы" 
            value={totalStats.totalOperators}
            icon={<PersonIcon sx={{ color: chartColors.success }} />}
            color={chartColors.success}
            subtitle="Уникальные пользователи системы"
          />
        </Grid>
      </Grid>

      <SectionTitle title="Тренды и динамика" />

      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '360px',
              borderRadius: 2,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <Typography variant="h6" gutterBottom>
              Динамика выпуска за период
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Количество выпуска по дням
            </Typography>
            
            {/* Контейнер для графика с горизонтальной прокруткой */}
            <Box sx={{ 
              width: '100%', 
              height: '85%', 
              overflowX: 'auto', 
              overflowY: 'hidden',
              '&::-webkit-scrollbar': {
                height: '8px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: '4px'
              }
            }}>
              {/* Внутренний контейнер с фиксированной шириной */}
              <Box sx={{
                width: Math.max(calibrationTrends.length * 20, '100%'),
                minWidth: '100%',
                height: '100%'
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={calibrationTrends}
                    margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                    <XAxis 
                      dataKey="name"
                      tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                      height={50}
                      tickMargin={10}
                      interval={Math.max(0, Math.floor(calibrationTrends.length / 30))}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fill: theme.palette.text.secondary }} 
                      width={35}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 4
                      }}
                      formatter={(value) => [`${value} выпуска`, 'Количество']}
                      labelFormatter={(label) => `Дата: ${label}`}
                    />
                    <Bar 
                      dataKey="successful" 
                      name="Успешные калибровки" 
                      fill={chartColors.success}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={8}
                      minPointSize={4}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={12}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '360px',
              borderRadius: 2,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <Typography variant="h6" gutterBottom>
              Динамика ошибок за период
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Количество зарегистрированных ошибок по дням
            </Typography>
            
            {/* Контейнер только для графика с горизонтальной прокруткой */}
            <Box sx={{ 
              width: '100%', 
              height: '85%', 
              overflowX: 'auto', 
              overflowY: 'hidden',
              '&::-webkit-scrollbar': {
                height: '8px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: '4px'
              }
            }}>
              {/* Внутренний контейнер с фиксированной шириной */}
              <Box sx={{
                width: Math.max(errorTrends.length * 20, '100%'), // Уменьшил ширину на элемент с 40px до 20px
                minWidth: '100%',
                height: '100%'
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={errorTrends}
                    margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                    <XAxis 
                      dataKey="name"
                      tick={{ fill: theme.palette.text.secondary, fontSize: 10 }} // Уменьшил размер шрифта
                      height={50}
                      tickMargin={10}
                      interval={Math.max(0, Math.floor(errorTrends.length / 30))} // Показываем примерно 30 подписей
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fill: theme.palette.text.secondary }} 
                      width={35} // Уменьшил ширину
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 4
                      }}
                      formatter={(value) => [`${value} ошибок`, 'Количество']}
                      labelFormatter={(label) => `Дата: ${label}`}
                    />
                    <Bar 
                      dataKey="errors" 
                      name="Ошибки" 
                      fill={chartColors.error}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={8} // Уменьшил максимальную ширину столбца
                      minPointSize={4} // Уменьшил минимальный размер
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <SectionTitle title="Распределение ошибок" />
      
      {/* Тренд ошибок */}
      <Grid container spacing={3}>
        {/* Распределение ошибок по типам устройств (круговая диаграмма) */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '360px',
              borderRadius: 2,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <Typography variant="h6" gutterBottom>
              Распределение ошибок по типам устройств
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={errorsByDeviceType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {errorsByDeviceType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} ошибок`, 'Количество']}
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Распределение ошибок по номеру ошибки (вертикальный столбчатый график) */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '360px',
              borderRadius: 2,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <Typography variant="h6" gutterBottom>
              Распределение ошибок по номеру
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Количество ошибок по их номеру
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={errorsByNumber}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                <XAxis 
                  dataKey="name"
                  tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fill: theme.palette.text.secondary }} 
                />
                <Tooltip 
                  formatter={(value) => [`${value} ошибок`, 'Количество']}
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4
                  }}
                />
                <Bar 
                  dataKey="value" 
                  name="Количество ошибок" 
                  fill={chartColors.error}
                  radius={[4, 4, 0, 0]}
                >
                  {errorsByNumber.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors.error} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <SectionTitle title="Критические показатели" />

      <Grid container spacing={3}>
        {/* Ошибки по стендам (график) */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '400px',
              borderRadius: 2,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <Typography variant="h6" gutterBottom>
              Количество ошибок по стендам
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Топ-10 стендов с наибольшим числом ошибок
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={errorsByStand.slice(0, 10)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                <XAxis 
                  type="number"
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  width={120}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4
                  }}
                />
                <Bar 
                  dataKey="errors" 
                  name="Количество ошибок" 
                  fill={chartColors.error}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Ошибки по операторам (график) */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '400px',
              borderRadius: 2,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <Typography variant="h6" gutterBottom>
              Ошибки по операторам
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Топ-5 операторов с наибольшим числом ошибок
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={errorsByOperator.slice(0, 5)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                <XAxis 
                  type="number"
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  width={120}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4
                  }}
                />
                <Bar 
                  dataKey="errors" 
                  name="Количество ошибок" 
                  fill={chartColors.error}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <SectionTitle title="Статистика по стендам" />

      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <Typography variant="h6" gutterBottom>
              Детализация по стендам с ошибками
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom mb={2}>
              Стенды, требующие внимания
            </Typography>
            <TableContainer sx={{ width: '100%' }} >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID стенда</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Количество ошибок</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Процент от общего числа</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Статус</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topStandsWithErrors.map((row) => {
                    // Найдем соответствующий стенд для получения статуса
                    const stand = standsData.stands.find(s => s.stand_id === row.name);
                    const errorPercent = totalStats.totalErrors 
                      ? ((row.errors / totalStats.totalErrors) * 100).toFixed(1) 
                      : '0';
                      
                    return (
                      <TableRow key={row.name} hover>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                          {row.name}
                        </TableCell>
                        <TableCell align="center">{row.errors}</TableCell>
                        <TableCell align="center">{errorPercent}%</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={stand?.status || 'Неизвестно'} 
                            size="small"
                            color={
                              stand?.status === 'активен' ? 'success' :
                              stand?.status === 'в ремонте' ? 'error' :
                              stand?.status === 'требует обслуживания' ? 'warning' : 'default'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default StatsPage;