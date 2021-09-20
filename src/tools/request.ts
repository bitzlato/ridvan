import Agent from 'agentkeepalive';
import axios from 'axios';

const keepAliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});

const request = axios.create({ httpAgent: keepAliveAgent });

export default request;
