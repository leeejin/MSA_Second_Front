import React, { useState } from "react";
import { Provider } from 'react-redux';
import store from '../util/redux_storage'; // Redux 스토어 임포트
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import axios from 'axios';
import Constant from '../util/constant_variables';
import { useDispatch, useSelector } from 'react-redux';
import ModalComponent from '../util/modal';

export default function Menubar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴

    const handleOpenClose = () => {
        setOpen(!open);
    };

    //로그아웃 체크
    const handleSubmit = () => {
        callLogoutAPI().then((response) => {
            if (response) {
                dispatch({ type: "Logout" });
                navigate("/");
            }
        })
    };
    //로그아웃하는 API
    async function callLogoutAPI() {
        //로그아웃 로직 
        try {
            const response = await axios.get(Constant.serviceURL + `/logout`, { withCredentials: true });
            return response;
        }
        catch (error) {
            console.error('로그아웃 오류:', error);
        }
    };
    return (
        <div className="menubar-container">
            {
                open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"로그아웃하시겠습니까?"} />
            }

            <div>
                <Link to="/">로고</Link>
                <div>
                {
                    userId !== 0 ? <>
                        <button color="inherit" onClick={() => { navigate('/MyPage') }}>마이페이지</button>
                        <button color="inherit" onClick={handleOpenClose}>로그아웃</button>
                    </>
                        : <>
                            <button color="inherit" onClick={() => { navigate('/Signup') }}>회원가입</button>
                            <button color="inherit" onClick={() => { navigate('/Login') }}>로그인</button>
                        </>

                }
                </div>
                
            </div>
        </div>
    );
}