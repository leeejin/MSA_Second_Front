import axios from 'axios';

const instance = axios.create({
    withCredentials: true
});

instance.interceptors.response.use(
  function (response) {
    if (response.headers.authorization) { // 응답 헤더에서 토큰 추출
      const token = response.headers.authorization.split(' ')[1]; // Bearer 토큰형식을 가정
      localStorage.setItem('authToken', `Bearer ${token}`);
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('토큰 저장 완료:', token); // 토큰 저장 확인
      console.log('axios 기본 헤더 설정 완료:', instance.defaults.headers.common['Authorization']); // 헤더 설정 확인
    }

    // 서버로부터 받은 응답 메시지를 출력
    if (response.data) {
      console.log('서버 응답 메시지:', response.data);
    } else {
      console.log('서버 응답 메시지가 없습니다.');
    }

    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default instance;