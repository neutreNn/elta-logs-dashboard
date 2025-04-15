import React, { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, IconButton, Dialog, DialogTitle, DialogContent,
  Box, Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';

const ErrorCard = ({ error, isLast }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        backgroundColor: '#ffe5e5',
        borderLeft: '5px solid red',
        margin: 0,
        borderBottom: isLast ? 'none' : '1px solid #ccc',
        '&:before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          '& .MuiAccordionSummary-content': {
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 2,
          },
        }}
      >
        <Typography><strong>Время ошибки:</strong> {error.start_time ?? 'Нет данных'}</Typography>

        <Stack direction="row" spacing={1}>
            {error.parent_log_id && (
                <IconButton
                size="small"
                sx={{ backgroundColor: '#fff' }}
                onClick={(e) => {
                    e.stopPropagation(); // Останавливаем всплытие
                    navigate(`/logs/${error.parent_log_id}`);
                }}
                >
                <LinkIcon />
                </IconButton>
            )}
            <IconButton
                size="small"
                sx={{ backgroundColor: '#fff' }}
                onClick={(e) => {
                e.stopPropagation(); // Останавливаем всплытие
                setOpenDialog(true);
                }}
            >
                <VisibilityIcon />
            </IconButton>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 1, pb: 2 }}>
        <Typography variant="subtitle1"><strong>Информация об операторе и стенде:</strong></Typography>
        <Box sx={{ mt: 1, ml: 2 }}>
          <Typography><strong>Оператор:</strong> {error.operator_name ?? 'Нет данных'}</Typography>
          <Typography><strong>ПО стенда:</strong> {error.software_version_stand ?? 'Нет данных'}</Typography>
          <Typography><strong>Железо стенда:</strong> {error.hardware_version_stand ?? 'Нет данных'}</Typography>
          <Typography><strong>JLink:</strong> {error.serial_number_ob_jlink ?? 'Нет данных'}</Typography>
          <Typography><strong>ID стенда:</strong> {error.stand_id ?? 'Нет данных'}</Typography>
          <Typography><strong>Тип устройства:</strong> {error.device_type ?? 'Нет данных'}</Typography>
          <Typography><strong>Прошивка:</strong> {error.device_firmware_version ?? 'Нет данных'}</Typography>
        </Box>
      </AccordionDetails>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Исходник ошибки</DialogTitle>
        <DialogContent>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {error.calibration_source ?? 'Нет данных'}
          </Typography>
        </DialogContent>
      </Dialog>
    </Accordion>
  );
};

export default ErrorCard;
