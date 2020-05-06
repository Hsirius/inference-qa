import axios from 'axios';
import { stringify } from 'qs';

const request = axios.create({
  paramsSerializer: params => stringify(params, { arrayFormat: 'comma' }),
});

request.interceptors.request.use(req => {
  req.withCredentials = true;
  return req;
});

request.interceptors.response.use(response => {
  if (!response.data.success || !response.data.data) {
    return Promise.reject(response);
  }
  return { ...response, data: response.data.data };
});

export default request;
