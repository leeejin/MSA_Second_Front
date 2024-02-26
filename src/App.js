import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import NonPage from './pages/nonPage';
import MyStorage from './util/redux_storage';
import Spinner from "../src/styles/image/loading.gif"
const Home = React.lazy(() => import('./pages/main_page')); //로딩중이 끝나면 해당 경로로 날려버림
const Reserve = React.lazy(() => import('./pages/reserve_page')); //로딩중이 끝나면 해당 경로로 날려버림
const CompleteReserve = React.lazy(() => import('./pages/completeReserve_page')); //로딩중이 끝나면 해당 경로로 날려버림

const Login = React.lazy(() => import('./pages/login_page')); //로딩중이 끝나면 해당 경로로 날려버림
const Signup = React.lazy(() => import('./pages/signup_page')); //로딩중이 끝나면 해당 경로로 날려버림

const MyPage = React.lazy(() => import('./pages/mypage_page')); //로딩중이 끝나면 해당 경로로 날려버림

/** 로그인/로그아웃 여부 */
const LoginRoute = ({ element }) => {
  const [userId, setUserId] = useState(parseInt(localStorage.getItem("userId")));
  const [name, setName] = useState(localStorage.getItem("name"));
  const [username, setUserName] = useState(localStorage.getItem("username"));
  useEffect(() => {
    const unsubscribe = MyStorage.subscribe(onStorageChange);
    return () => {
      unsubscribe();
    };
  }, [])
  const onStorageChange = () => {
    setUserId(parseInt(localStorage.getItem("userId")));
    setName(localStorage.getItem("name"));
    setUserName(localStorage.getItem("username"));
  };
  if (userId !== 0) { //로그인한 상태라면
    return element;
  } else { //아니면 로그인창으로 날려버림
    return <Navigate to="*" />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="loading">
          <img src={Spinner} alt="로딩" width="100px" />
        </div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route exact path="/Login" element={<Login />} />
          <Route exact path="/Signup" element={<Signup />} />

          <Route exact path="/MyPage/:userId" element={<LoginRoute element={<MyPage />} />} />
          <Route exact path="/Reserve" element={<LoginRoute element={<Reserve />} />} />
          <Route exact path="/CompleteReserve/:Id" element={<LoginRoute element={<CompleteReserve />} />} />
          <Route path="*" element={<NonPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}