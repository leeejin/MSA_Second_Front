import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Constant from '../../util/constant_variables';

export default function PayCheck() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false); // 취소모달창
    const [subBoxVisible, setSubBoxVisible] = useState({ accommodationList: false, payList: true });
    const [selectedData, setSelectedData] = useState([]) //선택한 컴포넌트 객체

    const contents = {
        id: 13,
        airlineNm: "티웨이항공",
        vihicleId: "TW902",
        arrAirportNm: "제주",
        arrPlandTime: 202403021210,
        depAirportNm: "광주",
        depPlandTime: 202403021100,
        seatCapacity: 80,
        cost: 93000
    };

    const [cost, setCost] = useState(contents.cost);

    const handleReservedList = () => {
        navigate(`/CompleteReserve/${contents.id}`);
    }

    const getAirlineLogo = (airlineName) => {
        const logos = Constant.getLogos();
        const matchingLogo = logos.find(logo => logo.value === airlineName);
        return matchingLogo ? matchingLogo.imageUrl : '';
    };


    /** 결제확인 함수 */
    const handleOpenClose = useCallback((data) => {
        setOpen(prev => !prev); //결재취소 확인 모달창 띄움
        setSelectedData(data); //선택한 데이터의 객체 저장

    }, []);

    return (
        <div className="container container-top" style={{ height: '300px', textAlign: 'center', position: 'relative' }}>
            <div style={{ paddingTop: '150px', color: 'white', }}>
                <h2>예약이 완료되었습니다!</h2>
            </div>

            <table className="table-list-card2" style={{ position: 'relative' }}>
                <thead>
                    <tr>
                        <th style={{ display: 'flex', marginRight: '20px', marginTop: '27px', alignItems: 'center', justifyContent: 'center', gap: '100px' }}>
                            <img src={getAirlineLogo(contents.airlineNm)} width="130px" alt={contents.airlineNm} />
                            <h3>{contents.airlineNm}</h3>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr style={{ marginRight: '38px', marginTop: '45px', display: 'flex', gap: '20px' }}>
                        <td style={{ flex: 1, padding: '40px', textAlign: 'center' }}>
                            <p>{contents.vihicleId}</p>
                        </td>
                        <td style={{ flex: 2, padding: '0px', textAlign: 'center' }}>
                            <h1>{Constant.handleTimeFormatChange(contents.depPlandTime)}</h1>
                            <p>{contents.depAirportNm}</p>
                        </td>
                        <td style={{ flex: 1, padding: '40px', textAlign: 'center' }}>
                            {Constant.handleDateCalculate(contents.arrPlandTime, contents.depPlandTime)}
                        </td>
                        <td style={{ flex: 2, padding: '0px', textAlign: 'center' }}>
                            <h1>{Constant.handleTimeFormatChange(contents.arrPlandTime)}</h1>
                            <p>{contents.arrAirportNm}</p>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="4" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                            <h2 style={{ marginBottom: '30px', marginTop: '32px', fontWeight: 'extrabold' }}>
                                총 {contents.cost.toLocaleString()}원
                            </h2>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="container-flex" style={{ fontSize: '16px', marginTop: '-118px', display: 'flex', flexDirection: 'column', }}>
                <p>예약이 완료되었습니다!</p>
                <p>예약 목록으로 가시겠습니까?</p>
            </div>
            <div className="container-flex" style={{ marginTop: '15px' }}>
                <button className="btn btn-style-confirm" onClick={handleReservedList}>예</button>
                <button className="btn btn-style-grey" onClick={() => { navigate(-1) }}>아니요</button>
            </div>
        </div>
    )
}