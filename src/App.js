import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider, Box } from "@mui/material";
import { useSelector } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';
import NonPage from './pages/nonPage';
import Login from './pages/login_page';
import Signup from './pages/signup_page';
import MyPage from './pages/mypage_page';

const Home = React.lazy(() => import('./pages/main_page')); //로딩중이 끝나면 해당 경로로 날려버림

const theme = createTheme({ //Mui에서는 이 선언을 해줘야 컴포넌트 전체 글씨체가 다 바뀜
  typography: {
    fontFamily: 'jua'
  }
});

const ConditionRoute = ({ element }) => {
  const userId = useSelector(state => state.userId); //리덕스로부터 userId를 받음

  if (userId !== 0) { //로그인한 상태라면
    return element;
  } else { //아니면 로그인창으로 날려버림
    return <Navigate to='/Login' />;
  }
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Suspense fallback={<div className="loading">
          <CircularProgress />
        </div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route exact path="/Login" element={<Login />} />
            <Route exact path="/Signup" element={<Signup />} />
            <Route exact path="/MyPage/:userId" element={<ConditionRoute element={<MyPage />} />} />
            <Route path="*" element={<NonPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}