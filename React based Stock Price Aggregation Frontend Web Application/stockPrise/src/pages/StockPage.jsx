import React, { useEffect, useState } from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, Typography, Box
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine
} from 'recharts';
import axios from 'axios';

const API_BASE = 'http://20.244.56.144/evaluation-service/stocks';
const AUTH_API = 'http://20.244.56.144/evaluation-service/auth';

export default function StockPage() {
  const [stocks, setStocks] = useState({});
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [minutes, setMinutes] = useState(50);
  const [priceData, setPriceData] = useState([]);
  const [token, setToken] = useState('');

  // Step 1: Get the token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await axios.post(AUTH_API, {
          email: 'kulkarnishreyas1947@gmail.com',
          name: 'shreyas shridhar kulkarni',
          rollNo: '4ad22ec101',
          accessCode: 'UnvCuq',
          clientID: '18b072cab-5fc9-412a-a7ee-3a522b131bc5',
          clientSecret: 'ZSNseHUQEYBfta9b'
        });
        setToken(res.data.access_token);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    fetchToken();
  }, []);

  // Step 2: Fetch stock names
  useEffect(() => {
    if (!token) return;

    axios.get(API_BASE, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => setStocks(res.data.stocks))
      .catch(err => console.error('Error fetching stocks:', err));
  }, [token]);

  // Step 3: Fetch stock price data
  useEffect(() => {
    if (!token || !selectedTicker) return;

    axios.get(`${API_BASE}/${selectedTicker}?minutes=${minutes}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => setPriceData(res.data))
      .catch(err => console.error('Error fetching prices:', err));
  }, [token, selectedTicker, minutes]);

  const avg = priceData.length > 0
    ? (priceData.reduce((a, b) => a + b.price, 0) / priceData.length).toFixed(2)
    : 0;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Stock Price Chart</Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Select Stock</InputLabel>
        <Select value={selectedTicker} onChange={e => setSelectedTicker(e.target.value)}>
          {Object.entries(stocks).map(([name, ticker]) => (
            <MenuItem key={ticker} value={ticker}>{name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Time Frame (minutes)</InputLabel>
        <Select value={minutes} onChange={e => setMinutes(e.target.value)}>
          {[10, 20, 30, 50, 60].map(m => (
            <MenuItem key={m} value={m}>{m} minutes</MenuItem>
          ))}
        </Select>
      </FormControl>

      <LineChart width={800} height={400} data={priceData.map(p => ({
        ...p, time: new Date(p.lastUpdatedAt).toLocaleTimeString()
      }))}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={['auto', 'auto']} />
        <Tooltip formatter={value => `$${value.toFixed(2)}`} />
        <Line type="monotone" dataKey="price" stroke="#8884d8" />
        <ReferenceLine y={parseFloat(avg)} label={`Avg: $${avg}`} stroke="red" strokeDasharray="3 3" />
      </LineChart>
    </Box>
  );
}
