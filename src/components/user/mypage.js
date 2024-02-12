import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import store from '../../util/redux_storage';

export default function MyPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 nickname를 가져옴

    const [subBoxVisible, setSubBoxVisible] = useState({ reserveList: false, payList: false });



    const handleLocation = (selectedBox) => {
        if (selectedBox === 'reserveList') navigate(`/ReservedList/${userId}`);
        else if (selectedBox === 'payList') navigate(`/PaidList/${userId}`);
    }

    const BoxListContainer = ({ onClick, listname, selectedBox }) => {
        return (
            <li className="btn" onClick={onClick}>
                <h3>{listname}</h3>
            </li>

        )
    }

    return (
        <div className="background">
            <div className="backBox">
                <div className="innerBox">
                    <h3>{nickname}님의 마이페이지</h3>
                    <ul className="box-container">
                        <BoxListContainer listname="예약목록" selectedBox='reserveList' onClick={() => handleLocation('reserveList')} />
                        <hr />
                        <BoxListContainer listname="결제목록" selectedBox='payList' onClick={() => handleLocation('payList')} />
                    </ul>
                </div>

            </div>
        </div>
    )
}