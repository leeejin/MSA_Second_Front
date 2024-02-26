import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router';
import Constant from '../../util/constant_variables';
import store from '../../util/redux_storage';
import AirPort from '../../util/json/airport-list.json';
const airport = AirPort.response.body.items.item; // 공항 목록
export default function PayCheck() {
    const navigate = useNavigate();
    const location = useLocation();
    const { contents } = location.state;
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴

    const handleReservedList = () => {
        navigate(`/MyPage/${userId}`); //수정해야함
    }
    /** 출발지, 도착지 Nm -> Id로 변경 */
    const getAirportIdByName = (airportId) => {
        const matchedAirport = airport.find((item) => item.airportId === airportId);
        return matchedAirport ? matchedAirport.airportNm : null;
    };
    return (
        <div>
            <h3>예약완료</h3>
            <div>
                <div key={contents.id}>
                    <p>{contents.airlineNm} ({contents.vihicleId})</p>
                    <p>도착 : {getAirportIdByName(contents.arrAirport)}</p>
                    <p>도착시간 : {Constant.handleDateFormatChange(contents.arrTime)}</p>
                    <p>출발 : {getAirportIdByName(contents.depAirport)}</p>
                    <p>출발시간 :  {Constant.handleDateFormatChange(contents.depTime)}</p>
                    <p>결제 : 카카오페이</p>
                    <p>총 : {contents.charge.toLocaleString()}원</p>
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