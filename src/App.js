import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useDispatch } from 'react-redux';

import NonPage from './pages/nonPage';
import MyStorage from './util/redux_storage';
import Spinner from "../src/styles/image/loading.gif"
const Home = React.lazy(() => import('./pages/main_page'));
const Book = React.lazy(() => import('./pages/book_page'));
const CompleteBook = React.lazy(() => import('./pages/completeBook_page'));
const Reserve = React.lazy(() => import('./pages/reserve_page'));
const RoomsReserve =React.lazy(()=>import('./pages/roomsreserve_page'));

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
  const [userId, setUserId] = useState(parseInt(sessionStorage.getItem("userId")));
  const [name, setName] = useState(sessionStorage.getItem("name"));

  useEffect(() => {
    const unsubscribe = MyStorage.subscribe(onStorageChange);
    return () => {
      unsubscribe();
    };
  }, []);

  const onStorageChange = () => {
    setUserId(parseInt(sessionStorage.getItem("userId")));
    setName(sessionStorage.getItem("name"));
  };

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
          <Route exact path="/Reserve" element={<Reserve />} />
          <Route exact path="/Rooms/searchDetail/:Id" element={<RoomsReserve />} />
          <Route exact path="/MyPage/:userId" element={<LoginRoute userId={userId} element={<MyPage />} />} />
          <Route exact path="/Book" element={<LoginRoute userId={userId} element={<Book />} />} />
          <Route exact path="/CompleteBook/:Id" element={<LoginRoute userId={userId} element={<CompleteBook />} />} />

          <Route path="*" element={<NonPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}