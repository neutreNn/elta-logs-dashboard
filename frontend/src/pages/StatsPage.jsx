import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Chip
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
  LineChart,
  Line
} from 'recharts';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import SpeedIcon from '@mui/icons-material/Speed';
import { useGetAllLogsErrorsQuery } from '../api/apiErrorsLogs';
import { useGetAllStandsQuery } from '../api/apiStands';
import { useGetAllOperatorsQuery } from '../api/apiLogs';
import CircleLoader from '../components/common/CircleLoader';

// Кастомные цвета для графиков
const chartColors = {
  primary: '#3f51b5',
  secondary: '#f50057',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  grey: '#9e9e9e'
};

// Массив цветов для диаграмм
const COLORS = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.success,
  chartColors.warning,
  chartColors.error,
  chartColors.info
];

function StatsPage() {
  const theme = useTheme();
  
  // Получение данных из Redux
  const { data: errorsData, isLoading: isLoadingErrors } = useGetAllLogsErrorsQuery({ limit: 1000 });
  const { data: standsData, isLoading: isLoadingStands } = useGetAllStandsQuery({ limit: 1000 });
  const { data: operatorsData, isLoading: isLoadingOperators } = useGetAllOperatorsQuery({ limit: 1000 });

  // Состояния для хранения обработанных данных
  const [errorsByStand, setErrorsByStand] = useState([]);
  const [errorsByOperator, setErrorsByOperator] = useState([]);
  const [errorsByDeviceType, setErrorsByDeviceType] = useState([]);
  const [topStandsWithErrors, setTopStandsWithErrors] = useState([]);
  const [errorTrends, setErrorTrends] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalLogs: 0,
    totalErrors: 0,
    totalStands: 0,
    totalOperators: 0,
    activeStands: 0,
    standsInMaintenance: 0
  });

  // Обработка данных при их получении
  useEffect(() => {
    if (errorsData?.logs && standsData?.stands && operatorsData?.operatorSettings) {
      // Обработка ошибок по стендам
      const standErrorsMap = {};
      errorsData.logs.forEach(log => {
        if (log.stand_id) {
          standErrorsMap[log.stand_id] = (standErrorsMap[log.stand_id] || 0) + 1;
        }
      });

      const standErrorsArray = Object.entries(standErrorsMap).map(([standId, count]) => ({
        name: standId,
        errors: count
      })).sort((a, b) => b.errors - a.errors);

      setErrorsByStand(standErrorsArray);
      setTopStandsWithErrors(standErrorsArray.slice(0, 5));

      // Обработка ошибок по операторам
      const operatorErrorsMap = {};
      errorsData.logs.forEach(log => {
        if (log.operator_name) {
          operatorErrorsMap[log.operator_name] = (operatorErrorsMap[log.operator_name] || 0) + 1;
        }
      });

      const operatorErrorsArray = Object.entries(operatorErrorsMap).map(([operator, count]) => ({
        name: operator,
        errors: count
      })).sort((a, b) => b.errors - a.errors);

      setErrorsByOperator(operatorErrorsArray);

      // Обработка ошибок по типам устройств
      const deviceTypeErrorsMap = {};
      errorsData.logs.forEach(log => {
        if (log.device_type) {
          deviceTypeErrorsMap[log.device_type] = (deviceTypeErrorsMap[log.device_type] || 0) + 1;
        } else {
          deviceTypeErrorsMap['Неизвестно'] = (deviceTypeErrorsMap['Неизвестно'] || 0) + 1;
        }
      });

      const deviceTypeErrorsArray = Object.entries(deviceTypeErrorsMap).map(([type, count]) => ({
        name: type,
        value: count
      }));

      setErrorsByDeviceType(deviceTypeErrorsArray);

      // Создаем фиктивные данные тренда ошибок (так как у нас нет исторических данных)
      // В реальном приложении это должны быть реальные данные по дням/неделям
      const trendData = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const day = date.toLocaleDateString('ru-RU', { weekday: 'short' });
        trendData.push({
          name: day,
          errors: Math.floor(Math.random() * (errorsData.total / 10)) + 1
        });
      }
      setErrorTrends(trendData);

      // Обработка общей статистики
      const activeStands = standsData.stands.filter(stand => stand.status === 'активен').length;
      const standsInMaintenance = standsData.stands.filter(stand => 
        stand.status === 'в ремонте' || stand.status === 'требует обслуживания'
      ).length;

      setTotalStats({
        totalLogs: operatorsData.total || 0,
        totalErrors: errorsData.total || 0,
        totalStands: standsData.total || 0,
        totalOperators: new Set(operatorsData.operatorSettings.map(os => os.operator_name)).size,
        activeStands,
        standsInMaintenance
      });
    }
  }, [errorsData, standsData, operatorsData]);

  if (isLoadingErrors || isLoadingStands || isLoadingOperators) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircleLoader />
      </Box>
    );
  }

  // Пользовательский компонент для карточки статистики
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%', 
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box 
            sx={{ 
              p: 1.5,
              borderRadius: '50%',
              backgroundColor: alpha(color, 0.1),
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" color={color} fontWeight="bold" sx={{ my: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Пользовательский компонент для секции
  const SectionTitle = ({ title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 4 }}>
      <Box sx={{ 
        width: 4, 
        height: 24, 
        bgcolor: theme.palette.primary.main, 
        mr: 1 
      }} />
      <Typography variant="h5" component="h2">
        {title}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ padding: 3, bgcolor: '#f5f5f7', width: '100%' }}>
      {/* Общая статистика */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Всего логов" 
            value={totalStats.totalLogs}
            icon={<SpeedIcon sx={{ color: chartColors.primary }} />}
            color={chartColors.primary}
            subtitle="Общее количество записей"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Ошибки" 
            value={totalStats.totalErrors}
            icon={<ErrorOutlineIcon sx={{ color: chartColors.error }} />}
            color={chartColors.error}
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

      <Grid container spacing={3} sx={{ display: 'flex' }}>
        <Grid item xs={12} md={8} sx={{ flex: 1 }}>
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
              Динамика ошибок за последнюю неделю
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Количество зарегистрированных ошибок по дням
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart
                data={errorTrends}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                <XAxis 
                  dataKey="name"
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis tick={{ fill: theme.palette.text.secondary }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="errors" 
                  name="Ошибки" 
                  stroke={chartColors.error} 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <SectionTitle title="Тренды и динамика" />
      
      {/* Тренд ошибок */}
      <Grid container spacing={3}>
        {/* Распределение ошибок по типам устройств (круговая диаграмма) */}
        <Grid item xs={12} md={4}>
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
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Процентное соотношение
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
      </Grid>

      <SectionTitle title="Критические показатели" />

      <Grid container spacing={3} sx={{ display: 'flex' }}>
        {/* Ошибки по стендам (график) */}
        <Grid item xs={12} md={6} sx={{ flex: 1 }}>
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
        <Grid item xs={12} md={6} sx={{ flex: 1 }}>
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
                  fill={chartColors.secondary}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <SectionTitle title="Статистика по стендам" />

      <Grid container spacing={3} sx={{ display: 'flex' }}>
        <Grid item xs={12} md={6} sx={{ flex: 1 }}>
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