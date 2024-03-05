import React, { useState } from 'react';
import { useNavigate, NavLink } from "react-router-dom";
import store from '../../util/redux_storage';
import axios from '../../axiosInstance';
import Constant from '../../util/constant_variables';
import PayList from './paidlist';
import ModalComponent from '../../util/modal';
import AccommodationList from './accommodationlist';
import { useDispatch } from 'react-redux';
export default function MyPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [subBoxVisible, setSubBoxVisible] = useState({ accommodationList: false, payList: true });
    const [open, setOpen] = useState(false); // 취소모달창

    const handleLocation = (selectedMenu) => {
        if (selectedMenu === 'payList') {
            setSubBoxVisible({ accommodationList: false, payList: true });
        } else if (selectedMenu === 'accommodationList') {
            setSubBoxVisible({ accommodationList: true, payList: false });
        }
    }
    const handleOpenClose = (e) => {
        e.preventDefault();
        setOpen(!open);
    };
    //로그아웃 체크
    const handleSubmit = () => {
        callLogoutAPI().then((response) => {
            if (response) {
                dispatch({ type: "Logout" });
                sessionStorage.removeItem('authToken');
                navigate("/");
                setOpen(!open);
            }
        })

    };
    //로그아웃하는 API
    async function callLogoutAPI() {
        //로그아웃 로직 
        try {
            const response = await axios.post(Constant.serviceURL + `/users/logout`, { withCredentials: true });
            return response;
        }
        catch (error) {
            console.error('로그아웃 오류:', error);
        }
    };
    return (
        <div>
            {
                open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"로그아웃하시겠습니까 ?"} />
            }
            <div className="fixed menubar-sub">
                <NavLink
                    className={`d-flex menubar-sub-content font-family-semibold ${subBoxVisible.payList && "menubar-sub-selected"}`}
                    onClick={() => handleLocation('payList')}
                >
                    결제목록
                </NavLink>
                <NavLink
                    className={`d-flex menubar-sub-content font-family-semibold ${subBoxVisible.accommodationList && "menubar-sub-selected"}`}
                    onClick={(e) => handleOpenClose(e)}
                >로그아웃</NavLink>
                {/* <NavLink
                    className={`d-flex menubar-sub-content font-family-semibold ${subBoxVisible.accommodationList && "menubar-sub-selected" }`}
                    onClick={() => handleLocation('accommodationList')}
                >
                    숙박목록
                </NavLink> */}
            </div>
            <div className="container-backbox-100">
                <h3 className="container-title">마이페이지</h3>
                <div>
                    {
                        subBoxVisible.payList === true ? <PayList userId={userId} /> : <AccommodationList userId={userId} />
                    }
                </div>
            </div>
        </div>

    )
}