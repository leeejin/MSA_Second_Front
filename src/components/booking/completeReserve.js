import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router';

import store from '../../util/redux_storage';

export default function PayCheck() {
    const navigate = useNavigate();
    const location = useLocation();
    const { contents, cost } = location.state;
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴

    const handleReservedList = () => {
        navigate(`/ReservedList/${userId}`); //수정해야함
    }
    return (
        <div>
            <h3>예약완료</h3>
            <div>
                <div key={contents.id}>
                    <p>{contents.airlineNm} ({contents.vihicleId})</p>
                    <p>도착 : {contents.arrAirportNm}</p>
                    <p>도착시간 : {contents.arrPlandTime}</p>
                    <p>출발 : {contents.depAirportNm}</p>
                    <p>출발시간 :  {contents.depPlandTime}</p>
                    <p>잔여석 : {contents.seatCapacity}</p>
                    <p>총 : {cost && cost.toLocaleString()}원</p>
                </div>

            </div>
            <div>
                <h3>예약이 완료되었습니다 ! 예약목록으로 가시겠습니까 ?</h3>
                <div>
                    <button onClick={handleReservedList}>예약목록페이지로 가기</button>
                    <button onClick={() => { navigate(-1) }}>뒤로가기</button>
                </div>
            </div>
        </div>
    )
}