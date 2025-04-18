import React, { useState } from 'react';
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Grid, Accordion, AccordionSummary, AccordionDetails, IconButton, Dialog, DialogTitle, DialogContent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';
import formatDate from '../utils/formatDate';

const CalibrationEntry = ({ calibration, index }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const calibrationSteps = calibration.calibration_steps ?? {};

  return (
    <Paper sx={{ padding: 2, marginTop: 2, backgroundColor: calibration.error_detected ? '#ffcccb' : '#f5f5f5', position: 'relative'}}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}><strong>Калибровка #{index + 1}</strong></Typography>

      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: '8px' }}>
        {calibration.parent_log_id && (
          <IconButton sx={{ backgroundColor: '#fff', borderRadius: 1 }} onClick={() => navigate(`/logs/${calibration.parent_log_id}`)}>
            <LinkIcon />
          </IconButton>
        )}

        <IconButton sx={{ backgroundColor: '#fff', borderRadius: 1 }} onClick={() => setOpen(true)}>
          <VisibilityIcon />
        </IconButton>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Исходник лога</DialogTitle>
        <DialogContent>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {calibration.calibration_source ?? 'Нет данных'}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Информация о калибровке */}
      <Grid container spacing={10}>
        {/* Левый столбец */}
        <Grid item xs={12} sm={6}>
            <Typography sx={{ marginBottom: 1 }}><strong>Время:</strong> {formatDate(calibration.start_time) ?? 'Нет данных'}</Typography>
            <Typography sx={{ marginBottom: 1 }}><strong>Конец калибровки:</strong> температура: {calibration.end_of_calibration?.temperature ?? 'Нет данных'}°C, напряжение: {calibration.end_of_calibration?.sensor_voltage ?? 'Нет данных'} V</Typography>
            <Typography sx={{ marginBottom: 1 }}><strong>Активный ток:</strong> {calibration.active_mode_current ?? 'Нет данных'}</Typography>
            <Typography sx={{ marginBottom: 2 }}><strong>Длительность теста:</strong> {calibration.test_duration ?? 'Нет данных'}</Typography>
        </Grid>

        {/* Правый столбец */}
        <Grid item xs={12} sm={6}>
            <Typography sx={{ marginBottom: 1 }}><strong>Спящий режим (мА):</strong> {calibration.sleep_mode_current?.length > 0 ? `[${calibration.sleep_mode_current.join(', ')}]` : 'Нет данных'}</Typography>
            <Typography sx={{ marginBottom: 1 }}><strong>Средний ток в спящем режиме (мА):</strong> {calibration.average_sleep_mode_current ?? 'Нет данных'}</Typography>
            <Typography sx={{ marginBottom: 1 }}><strong>Серийный номер:</strong> {calibration.serial_number ?? 'Нет данных'}</Typography>
        </Grid>
      </Grid>

      {/* Калибровочные шаги и DAC Шаги на одной строке */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        
        {/* Шаги калибровки для разных токов */}
        <Grid item xs={12} sm={5}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Шаги калибровки для разных токов</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ток</TableCell>
                    <TableCell>Значения</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(calibrationSteps).map((key) => (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      <TableCell>{`[${calibrationSteps[key].join(', ')}]`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* DAC Шаги */}
        <Grid item xs={12} sm={3}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">DAC Шаги</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>DAC Регистр</TableCell>
                    <TableCell>Напряжение</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calibration.dac_steps?.length > 0 ? (
                    calibration.dac_steps.map((step, stepIndex) => (
                      <TableRow key={stepIndex}>
                        <TableCell>{step.dac_register}</TableCell>
                        <TableCell>{step.voltage}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2}>Нет данных</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* DAC Min */}
        <Grid item xs={6} sm={3}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">DAC Min</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Шаг</TableCell>
                    <TableCell>Uw</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calibration.dac_min_steps?.length > 0 ? (
                    calibration.dac_min_steps.map((step, stepIndex) => (
                      <TableRow key={stepIndex}>
                        <TableCell>{stepIndex + 1}</TableCell>
                        <TableCell>{step}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2}>Нет данных</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* DAC Max */}
        <Grid item xs={6} sm={2}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">DAC Max</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Шаг</TableCell>
                    <TableCell>Uw</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calibration.dac_max_steps?.length > 0 ? (
                    calibration.dac_max_steps.map((step, stepIndex) => (
                      <TableRow key={stepIndex}>
                        <TableCell>{stepIndex + 1}</TableCell>
                        <TableCell>{step}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2}>Нет данных</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={6} sm={6}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Калибровочные шаги</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Шаг</TableCell>
                    <TableCell>Напряжение</TableCell>
                    <TableCell>rawVref</TableCell>
                    <TableCell>uicRegVref</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calibration.reference_voltage_steps?.length > 0 ? (
                    calibration.reference_voltage_steps.map((step, stepIndex) => (
                      <TableRow key={stepIndex}>
                        <TableCell>{step.step}</TableCell>
                        <TableCell>{step.voltage}</TableCell>
                        <TableCell>{step.rawVref}</TableCell>
                        <TableCell>{step.uicRegVref}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4}>Нет данных</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CalibrationEntry;
