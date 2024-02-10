import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router';
//결제 페이지
export default function PayCheck() {
    const navigate = useNavigate();
    const location = useLocation();
    const { contents, cost, selectedId } = location.state;
    console.log(contents);
    const handlePay = () => {
        console.log("결제완료");
    }
    return (
        <div className="container">
            <h3>결제창</h3>
            <div>
                {
                    contents.map((info) =>
                        <div key={info.id}>
                            <p>{info.airlineNm} ({info.vihicleId})</p>

                            <p>도착 : {info.arrAirportNm}</p>
                            <p>도착시간 : {info.arrPlandTime}</p>
                            <p>출발 : {info.depAirportNm}</p>
                            <p>출발시간 :  {info.depPlandTime}</p>
                            <p>잔여석 : {info.seatCapacity}</p>
                            <p>총 요금: {cost}</p>
                        </div>
                    )
                }
            </div>
            <div>
                <button onClick={handlePay}>결제</button>
                <button onClick={() => { navigate(-1) }}>취소</button>
            </div>
        </div>
    )
}