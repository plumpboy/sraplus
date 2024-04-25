/* eslint-disable no-console */
import axios from 'axios'

function requestSRA() {
  const API_URL = "https://sra-api.smartosc.com/api";
  axios.defaults.baseURL = API_URL;
  axios.defaults.headers.common.Accept = 'application/json';
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  axios.defaults.headers.common['authority'] = 'sra-api.smartosc.com';
  axios.defaults.headers.common['accept-language'] = 'en-US,en;q=0.9';
  axios.defaults.headers.common['content-type'] = 'application/json';
  // axios.defaults.headers.common['origin'] = 'https://sra.smartosc.com';
  // axios.defaults.headers.common['referer'] = 'https://sra.smartosc.com/';
  // axios.defaults.headers.common['sec-ch-ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"';
  // axios.defaults.headers.common['sec-ch-ua-mobile'] = '?0';
  // axios.defaults.headers.common['sec-ch-ua-platform'] = '"Linux"';
  // axios.defaults.headers.common['sec-fetch-dest'] = 'empty';
  // axios.defaults.headers.common['sec-fetch-mode'] = 'cors';
  // axios.defaults.headers.common['sec-fetch-site'] = 'same-site';
  // axios.defaults.headers.common['user-agent'] = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';

  axios.interceptors.request.use(request => {
    let token = localStorage.getItem('accessToken');

    console.log('token', token);

    if (!!token) {
      request.headers.common['Authorization'] = `Bearer ${token}`
    }

    return request
  }, (error) => console.log(error), {
    synchronous: true
  })

  return axios
}

export default requestSRA()