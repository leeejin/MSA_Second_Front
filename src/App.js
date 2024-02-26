import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import Constant from './util/constant_variables';
import axios from './axiosInstance';
import NonPage from './pages/nonPage';
import MyStorage from './util/redux_storage';
import Spinner from "../src/styles/image/loading.gif"
import { jwtDecode } from 'jwt-decode';
const Home = React.lazy(() => import('./pages/main_page'));
const Reserve = React.lazy(() => import('./pages/reserve_page'));
const CompleteReserve = React.lazy(() => import('./pages/completeReserve_page'));

const Login = React.lazy(() => import('./pages/login_page'));
const Signup = React.lazy(() => import('./pages/signup_page'));

const MyPage = React.lazy(() => import('./pages/mypage_page'));

/** 로그인/로그아웃 여부 */
const LoginRoute = ({ userId, element }) => {

  if (userId !== 0) { //로그인한 상태라면
    return element;
  } else { //아니면 로그인창으로 날려버림
    return <Navigate to="*" />;
  }
}

export default function App() {
  const dispatch = useDispatch();
  const [userId, setUserId] = useState(parseInt(sessionStorage.getItem("userId")));
  const [name, setName] = useState(sessionStorage.getItem("name"));
  // const [logoutTimerId, setLogoutTimerId] = useState(null);
  // const token = localStorage.getItem('authToken');
  // const checkExpiry = () => {
  //   if (!token) {
  //     console.log("토큰없음");
  //     return false;
  //   } else {
  //     const decodedToken = jwtDecode(token);
  //     const currentTime = Date.now() / 1000;
  //     console.log("토큰있음");
  //     return decodedToken.exp < currentTime;
  //   }
  // };

  // const resetLogoutTimer = () => {
  //   console.log("마우스감지");
  //   if (logoutTimerId) clearTimeout(logoutTimerId);

  //   const newTimerId = setTimeout(checkExpiryInterval, 5000);
  //   setLogoutTimerId(newTimerId);
  // };

  useEffect(() => {
    const unsubscribe = MyStorage.subscribe(onStorageChange);
    return () => {
      unsubscribe();
    };
  }, []);
  // useEffect(() => {
  //   if (token) {
  //     window.addEventListener('mousemove', resetLogoutTimer);
  //     window.addEventListener('keydown', resetLogoutTimer);
  //     return () => {
  //       clearInterval(checkExpiryInterval);
  //       window.removeEventListener('mousemove', resetLogoutTimer);
  //       window.removeEventListener('keydown', resetLogoutTimer);
  //     };
  //   }
  // }, [token]);
  const onStorageChange = () => {
    setUserId(parseInt(sessionStorage.getItem("userId")));
    setName(sessionStorage.getItem("name"));
  };

  // const checkExpiryInterval = () => {
  //   console.log("계속확인중")
  //   if (checkExpiry()) {
  //     callLogoutAPI().then((response) => {
  //       if (response) {
  //         dispatch({ type: "Logout" });
  //         localStorage.removeItem('authToken');
  //         setUserId(0);
  //         setName("");
  //         alert("일정시간동안 활동이 없어 자동으로 로그아웃되었습니다");
  //       }
  //     })
  //     localStorage.removeItem('authToken');
  //     dispatch({ type: "Logout" });
  //     setUserId(0);
  //     setName("");
  //   }
  // };

  // async function callLogoutAPI() {
  //   try {
  //     const response = await axios.post(Constant.serviceURL + `/users/logout`, { withCredentials: true });
  //     return response;
  //   }
  //   catch (error) {
  //     console.error('로그아웃 오류:', error);
  //   }
  // };

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
          <Route exact path="/MyPage/:userId" element={<LoginRoute userId={userId} element={<MyPage />} />} />
          <Route exact path="/Reserve" element={<LoginRoute userId={userId} element={<Reserve />} />} />
          <Route exact path="/CompleteReserve/:Id" element={<LoginRoute userId={userId} element={<CompleteReserve />} />} />
          <Route path="*" element={<NonPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}