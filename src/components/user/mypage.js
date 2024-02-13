import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from "react-router-dom";
import axios from 'axios';
import styled from "styled-components";
import store from '../../util/redux_storage';
import PayList from './paidlist';
import ReservedList from './reservedlist';
import Constant from '../../util/constant_variables';
export default function MyPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 nickname를 가져옴
    const [open, setOpen] = useState({
        payCancel: false,
        reserveCancle: false
    })
    const [subBoxVisible, setSubBoxVisible] = useState({ reserveList: true, payList: false });


    const handleLocation = (selectedMenu) => {
        if (selectedMenu === 'reserveList') {
            setSubBoxVisible({ reserveList: true, payList: false });
        } else if (selectedMenu === 'payList') {
            setSubBoxVisible({ reserveList: false, payList: true });
        }
    }

    return (
        <div>

            <div className="mypage-menubar">

                <NavLink className={subBoxVisible.reserveList ? "p sub-menu-selected" : "p"} onClick={() => handleLocation('reserveList')}>예약목록</NavLink>
                <NavLink className={subBoxVisible.payList ? "p sub-menu-selected" : "p"} onClick={() => handleLocation('payList')}>결제목록</NavLink>
            </div>
            <div className="backBox-100">
                <h3 className="componentTitle">마이페이지</h3>
                <div className="componentContent">
                    {
                        subBoxVisible.reserveList === true ? <ReservedList /> : <PayList />
                    }
                </div>
                <div>
                            <p>* 스케줄 및 기종은 부득이한 사유로 사전 예고없이 변경될 수 있습니다.</p>
                            <p>* 예약등급에 따라 마일리지 적립률이 상이하거나 마일리지가 제공되지 않습니다.</p>
                        </div>

            </div>
        </div>

    )
}