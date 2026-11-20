import axios from 'axios';

export const aiApi = axios.create({
  baseURL: '/api/services/ai',
});

// Evidence Engine running on 8002
export const evidenceApi = axios.create({
  baseURL: '/api/services/evidence',
});

// Graph Services running on 8001
export const graphApi = axios.create({
  baseURL: '/api/services/graph',
});
