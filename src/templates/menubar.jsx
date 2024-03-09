import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link, NavLink } from 'react-router-dom';
import Constant from '../util/constant_variables';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from 'react-query';
import ModalComponent from '../util/custom/modal';
import axios from '../axiosInstance';
import logo from '../styles/image/main_logo.png';
/** 메뉴선택하면 스타일 변함 */
const activeStyle = {
    color: 'var(--white-color)',
    backgroundColor: 'var(--hovering-color)'
}
export default function Menubar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const userId = useSelector(state => state.userId);
    const handleOpenClose = (e) => {
        e.preventDefault();
        setOpen(prev=>!prev);
    };
    const mutation = useMutation(callLogoutAPI, {
        onSuccess: () => {
            // 로그아웃이 성공했을 때의 처리
            dispatch({ type: "Logout" });
            sessionStorage.removeItem('authToken');
            setOpen(prev=>!prev);
            navigate("/");
        },
        onError :(error)=>{
            console.error(error);
        }
    });
    //로그아웃 체크
    const handleSubmit = () => {
        mutation.mutate();
    };
    //로그아웃하는 API
    async function callLogoutAPI() {
        //로그아웃 로직 
        try {
            const response = await axios.post(Constant.serviceURL + `/users/logout`);
            return response;
        }
        catch (error) {
            console.error('로그아웃 오류:', error);
        }
    };
    return (<>
        {
            open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"로그아웃하시겠습니까 ?"} />
        }
        <div className="fixed menubar">

            <div>
                <Link to="/"><img src={logo} width={'100px'} /></Link>
                <div>
                    {
                        userId !== 0 ? <>
                            <NavLink
                                className="btn btn-nav-item btn-style-item font-family-semibold"
                                style={({ isActive }) => (isActive ? activeStyle : {})}
                                to={`/Mypage/${userId}`}
                            >내정보</NavLink>

                            <NavLink
                                className="btn btn-nav-item btn-style-item font-family-semibold"
                                onClick={(e) => handleOpenClose(e)}
                                to="/"
                            >로그아웃</NavLink>
                        </>
                            : <>
                                <NavLink
                                    className="btn btn-nav-item btn-style-item font-family-semibold"
                                    style={({ isActive }) => (isActive ? activeStyle : {})}
                                    to={"/Signup"}
                                >회원가입</NavLink>
                                <NavLink
                                    className="btn btn-nav-item btn-style-item font-family-semibold"
                                    style={({ isActive }) => (isActive ? activeStyle : {})}
                                    to={"/Login"}
                                >로그인</NavLink>
                            </>

                    }
                </div>

            </div>
        </div>
    </>

    );
}