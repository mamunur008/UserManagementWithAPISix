import { http } from '../lib/httpClient.js';

export const meApi = {
  async get() {
    const response = await http.get('/me');
    return response.data;
  }
};

export default meApi;
