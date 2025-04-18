import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

function SectionTitle({ title }) {
  const theme = useTheme();
  
  return (
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
}

export default SectionTitle;