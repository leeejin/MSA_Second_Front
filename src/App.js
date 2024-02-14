import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import NonPage from './pages/nonPage';
import Spinner from "../src/styles/image/loading.gif"

const Home = React.lazy(() => import('./pages/main_page')); //로딩중이 끝나면 해당 경로로 날려버림
const Reserve = React.lazy(() => import('./pages/reserve_page')); //로딩중이 끝나면 해당 경로로 날려버림
const Pay = React.lazy(() => import('./pages/pay_page')); //로딩중이 끝나면 해당 경로로 날려버림

const Login = React.lazy(() => import('./pages/login_page')); //로딩중이 끝나면 해당 경로로 날려버림
const Signup = React.lazy(() => import('./pages/signup_page')); //로딩중이 끝나면 해당 경로로 날려버림

const MyPage = React.lazy(() => import('./pages/mypage_page')); //로딩중이 끝나면 해당 경로로 날려버림
const ReservedList = React.lazy(() => import('./pages/reservedlist_page')); //로딩중이 끝나면 해당 경로로 날려버림
const PaidList = React.lazy(() => import('./pages/paidlist_page')); //로딩중이 끝나면 해당 경로로 날려버림


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
    <BrowserRouter>
      <Suspense fallback={<div className="loading">
        <img src={Spinner} alt="로딩" width="10%" />
      </div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route exact path="/Login" element={<Login />} />
          <Route exact path="/Signup" element={<Signup />} />
          <Route exact path="/MyPage" element={<MyPage />} />

          {/* <Route exact path="/MyPage/:userId" element={<ConditionRoute element={<MyPage />} />} /> */}
          <Route exact path="/ReservedList" element={<ReservedList />} />
          <Route exact path="/PaidList" element={<PaidList />} />
          {/* <Route exact path="/ReservedList/:userId" element={<ReservedList />} />
          <Route exact path="/PaidList/:userId" element={<PaidList />} /> */}
          <Route exact path="/Reserve" element={<Reserve />} />
          {/* <Route exact path="/Reserve" element={<ConditionRoute element={<Reserve />} />} /> */}
          <Route exact path="/Pay/:Id" element={<Pay />} />
          {/* <Route exact path="/Pay/:Id" element={<ConditionRoute element={<Pay />} />} /> */}
          <Route path="*" element={<NonPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}