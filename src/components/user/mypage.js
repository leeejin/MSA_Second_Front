import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import store from '../../util/redux_storage';
export default function MyPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 nickname를 가져옴

    const [subBoxVisible, setSubBoxVisible] = useState({ reserveList: false, payList: false });

    const handleBox = (boxNumber) => {
        setSubBoxVisible({
            ...subBoxVisible,
            [boxNumber]: !subBoxVisible[boxNumber]
        });
    }
    const BoxListContainer = ({ onClick, listname, selectedBox }) => {
        return (
            <div className="box-container">
                <div className="btn" onClick={onClick}>
                    <h3>{listname}</h3>
                    <span>-</span>
                </div>
                {
                    subBoxVisible[selectedBox] && <div>
                        까궁
                        <span className="btn" onClick={()=>{}}>더보기</span>
                    </div>
                }
            </div>
        )
    }
    return (
        <div className="background">
            <div className="backBox">
                <div className="innerBox">
                    <h3>{nickname}님의 마이페이지</h3>

                    <BoxListContainer listname="예약목록" selectedBox='box1' onClick={() => handleBox('box1')} />
                    <BoxListContainer listname="결제목록" selectedBox='box2' onClick={() => handleBox('box2')} />
                   

                </div>

            </div>
        </div>
    )
}