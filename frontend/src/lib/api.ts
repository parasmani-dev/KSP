import axios from 'axios';

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

// AI Services running on 8000
export const aiApi = axios.create({
  baseURL: `http://${hostname}:8000`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Graph Services running on 8001
export const graphApi = axios.create({
  baseURL: `http://${hostname}:8001`,
  headers: {
    'Content-Type': 'application/json',
  },
});
