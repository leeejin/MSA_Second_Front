import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router';

export default function PayCheck() {
    const navigate = useNavigate();
    const location = useLocation();
    const { contents, cost, selectedId } = location.state;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdn.iamport.kr/v1/iamport.js";
        script.async = true;
        document.head.appendChild(script);
        return () => {
            document.head.removeChild(script);
        }
    }, []);

    const handlePay = async () => {
        window.IMP.init("imp85467664");
        window.IMP.request_pay({
            pg: "kakaopay",
            pay_method: "card",
            amount: cost,
            name: contents.airlineNm,
            merchant_uid: "ORD11"
        }, async (response) => {
            if (response.success) {
                alert('결제 성공');
            } else {
                console.log('결제 에러', response.error_msg);
            }
        });
    };
    return (
        <div>
            <h3>예약확인</h3>
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
                        </div>
                    )
                }
            </div>
            <div>
                <h3>결제</h3>
                <div>
                    <p>총 : {cost && cost.toLocaleString()}원</p>
                    <button onClick={handlePay}>결제</button>
                    <button onClick={() => { navigate(-1) }}>취소</button>
                </div>
            </div>
        </div>
    )
}
