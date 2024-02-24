import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from "react-router-dom";
import axios from 'axios';
import styled from "styled-components";
import store from '../../util/redux_storage';
import PayList from './paidlist';
import AccommodationList from './accommodationlist';
import Constant from '../../util/constant_variables';
export default function MyPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 nickname를 가져옴
    const [subBoxVisible, setSubBoxVisible] = useState({ accommodationList: false, payList: true });


    const handleLocation = (selectedMenu) => {
        if (selectedMenu === 'payList') {
            setSubBoxVisible({ accommodationList: false, payList: true });
        } else if (selectedMenu === 'accommodationList') {
            setSubBoxVisible({ accommodationList: true, payList: false });
        }
    }

    return (
        <div>
            <div className="mypage-menubar">
                <NavLink className={subBoxVisible.payList ? "p sub-menu-selected" : "p"} onClick={() => handleLocation('payList')}>결제목록</NavLink>
                <NavLink className={subBoxVisible.accommodationList ? "p sub-menu-selected" : "p"} onClick={() => handleLocation('accommodationList')}>숙박목록</NavLink>
            </div>
            <div className="backBox-100">
                <h3 className="componentTitle">마이페이지</h3>
                <div>
                    {
                        subBoxVisible.payList === true ? <PayList /> : <AccommodationList />
                    }
                </div>
            </div>
        </div>

    )
}