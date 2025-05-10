import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import * as math from 'mathjs';
import { HeatMapGrid } from 'react-grid-heatmap'; // Make sure this is installed

const API_BASE = 'http://20.244.56.144/evaluation-service/stocks';

export default function CorrelationHeatmap() {
  const [stocks, setStocks] = useState({});
  const [minutes, setMinutes] = useState(50);
  const [dataMap, setDataMap] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(API_BASE)
      .then(res => setStocks(res.data.stocks))
      .catch(err => console.error("Error fetching stock list:", err));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const map = {};
      const tickers = Object.values(stocks);
      for (let ticker of tickers) {
        try {
          const res = await axios.get(`${API_BASE}/${ticker}?minutes=${minutes}`);
          map[ticker] = res.data.map(d => d.price);
        } catch (error) {
          console.error(`Error fetching data for ${ticker}:`, error);
        }
      }
      setDataMap(map);
      setLoading(false);
    };
    if (Object.keys(stocks).length) fetchData();
  }, [stocks, minutes]);

  const tickers = Object.values(stocks);
  const matrix = tickers.map(t1 => tickers.map(t2 => {
    const x = dataMap[t1] || [], y = dataMap[t2] || [];
    const len = Math.min(x.length, y.length);
    if (len === 0) return 0;
    const xAligned = x.slice(-len), yAligned = y.slice(-len);
    const meanX = math.mean(xAligned);
    const meanY = math.mean(yAligned);
    const cov = math.mean(xAligned.map((v, i) => (v - meanX) * (yAligned[i] - meanY)));
    const stdX = math.std(xAligned);
    const stdY = math.std(yAligned);
    const correlation = cov / (stdX * stdY);
    return parseFloat(correlation.toFixed(2));
  }));

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Stock Correlation Heatmap
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Time Frame (minutes)</InputLabel>
        <Select value={minutes} onChange={e => setMinutes(e.target.value)}>
          {[10, 20, 30, 50, 60].map(m => (
            <MenuItem key={m} value={m}>{m} minutes</MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Box mt={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : matrix.length > 0 ? (
        <Box mt={4}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            * Hover over a cell to view the correlation value
          </Typography>
          <HeatMapGrid
            data={matrix}
            xLabels={tickers}
            yLabels={tickers}
            cellRender={(x, y, value) => (
              <Tooltip title={`Correlation: ${value}`} arrow>
                <span>{value}</span>
              </Tooltip>
            )}
            cellStyle={(_, __, ratio) => ({
              background: `rgba(0, 123, 255, ${Math.abs(ratio)})`,
              fontSize: '12px',
              color: '#fff',
              textAlign: 'center',
            })}
            cellHeight="35px"
            xLabelsStyle={() => ({
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#333',
            })}
            yLabelsStyle={() => ({
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#333',
            })}
            square
          />
        </Box>
      ) : (
        <Box mt={4}>
          <Typography variant="body1" color="textSecondary">
            No data available. Please select a timeframe or wait for data to load.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
