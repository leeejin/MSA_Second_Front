import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createTheme, ThemeProvider, Box } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import store from './util/redux_storage'; // Redux 스토어 임포트

import App from './App';
import reportWebVitals from './reportWebVitals';
const theme = createTheme({ //Mui에서는 이 선언을 해줘야 컴포넌트 전체 글씨체가 다 바뀜
  typography: {
    fontFamily: 'jua'
  }
});
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
  <LocalizationProvider dateAdapter={AdapterDayjs} dateFormats={{ monthShort: `M` }}>
  <Provider store={store}>
    <App />
  </Provider>
  </LocalizationProvider>
  </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
