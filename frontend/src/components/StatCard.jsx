import React from 'react';
import { Card, CardContent, Box, Typography, alpha, useTheme } from '@mui/material';

function StatCard({ title, value, icon, color, subtitle }) {
  const theme = useTheme();
  
  return (
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
}

export default StatCard;