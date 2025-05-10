import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Stock Analyzer
        </Typography>
        <Button color="inherit" component={Link} to="/">Stock Page</Button>
        <Button color="inherit" component={Link} to="/heatmap">Correlation Heatmap</Button>
      </Toolbar>
    </AppBar>
  );
}