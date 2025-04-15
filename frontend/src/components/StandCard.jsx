import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Divider
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import formatDate from '../utils/formatDate';
import { statusColors } from '../constants/statusColors';

const statusIcons = {
  'активен': <CheckCircleIcon color="success" />,
  'требует обслуживания': <WarningIcon color="warning" />,
  'в ремонте': <BuildIcon color="error" />,
  'не активен': <WarningIcon color="disabled" />
};

function StandCard({ stand, onViewDetails }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(stand._id);
    } else {
      navigate(`/stands/${stand._id}`);
    }
  };

  // Получаем последнюю запись о ремонте, если она есть
  const lastRepair = stand.repair_history && stand.repair_history.length > 0
    ? stand.repair_history[stand.repair_history.length - 1]
    : null;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
        }
      }}
      onClick={handleViewDetails}
    >
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: '#f5f7fa',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Box display="flex" alignItems="center" gap={1} sx={{ maxWidth: '100%', overflow: 'hidden' }}>
          {statusIcons[stand.status]}
          <Typography 
            variant="h6" 
            fontWeight="bold"
            noWrap
            sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {stand.stand_id}
          </Typography>
        </Box>
        <Chip 
          label={stand.status} 
          color={statusColors[stand.status]} 
          size="small"
        />
        </Box>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Программная версия
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {stand.software_version_stand || "Не указана"}
          </Typography>
        </Box>
        
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Аппаратная версия
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {stand.hardware_version_stand || "Не указана"}
          </Typography>
        </Box>
        
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            OB-JLINK
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {stand.serial_number_ob_jlink || "Не указан"}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Последнее использование
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {formatDate(stand.last_used)}
          </Typography>
        </Box>
        
        {lastRepair && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Последний ремонт: {formatDate(lastRepair.repair_date)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Статус: <Chip 
                        label={lastRepair.repair_status} 
                        size="small" 
                        color={
                          lastRepair.repair_status === 'завершен' ? 'success' : 
                          lastRepair.repair_status === 'в процессе' ? 'warning' : 
                          'default'
                        }
                        sx={{ ml: 1 }}
                      />
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default StandCard;