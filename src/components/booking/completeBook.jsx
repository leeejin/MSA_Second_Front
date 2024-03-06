import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Constant from '../../util/constant_variables';
import store from '../../util/redux_storage';
import AirPort from '../../util/json/airport-list.json';

const airport = AirPort.response.body.items.item; // 공항 목록

export default function PayCheck() {
    const navigate = useNavigate();
    const location = useLocation();
    const { contents } = location.state;
    const loginInfo = {
        userId: store.getState().userId,
        name: store.getState().name,
        email: store.getState().username,
    };

    const handleReservedList = () => {
        navigate(`/MyPage/${loginInfo.userId}`); //수정해야함
    }
    const handleLocation = () => {
        navigate(-1);
    }
    return (
        <div className="container">
            <div className="container-top" style={{ height: '200px', marginTop: '60px' }}>
                <div className="panel panel-top font-color-white" >
                    <div className="d-flex d-row">
                        <h1 className="font-family-semibold">예약완료되었습니다!</h1>
                    </div>
                </div>
            </div>
            <div className="w-50" style={{ marginTop: '140px' }}>
                <table className="table-list-card" key={contents.id}>
                    <tbody>
                        <tr>
                            <td colSpan={4}>
                                <img src={Constant.getAirlineLogo(contents.airLine)} width={"130px"} alt={contents.airlineNm} />
                                <p>{contents.airLine}</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p>{contents.vihicleId}</p>
                            </td>
                            <td>
                                <h1>{Constant.handleTimeFormatChange(contents.depTime)}</h1>
                                <p>{Constant.getAirportNmById(airport, contents.depAirport)}</p>
                            </td>
                            <td>
                                {Constant.handleDateCalculate(contents.arrTime, contents.depTime)}
                            </td>
                            <td>
                                <h1>{Constant.handleTimeFormatChange(contents.arrTime)}</h1>
                                <p>{Constant.getAirportNmById(airport, contents.arrAirport)}</p>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <h2>인원   1명</h2>
                            </td>

                            <td colSpan={2}>
                                <h2>
                                    총  {contents.charge.toLocaleString()}원
                                </h2>
                            </td>

                        </tr>
                    </tbody>
                </table>

            </div>
            <div className="d-flex d-column">
                <h3>예약이 완료되었습니다 ! 예약목록으로 가시겠습니까 ?</h3>
                <div className="d-flex d-row" >
                    <button className="btn btn-style-confirm" onClick={handleReservedList}>예</button>
                    <button className="btn btn-style-grey" onClick={handleLocation}>아니오</button>
                </div>
            </div>
        </div>
    )
}