import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router';
import Constant from '../../util/constant_variables';
import ModalComponent from '../../util/modal';
import AirPort from '../../util/json/airport-list';
import store from '../../util/redux_storage';
/** 예약확인 목록 페이지 */
export default function ModalBookCheck() {

    const navigate = useNavigate();
    const location = useLocation(); //main.js에서 보낸 경로와 state를 받기 위함

    const airport = AirPort.response.body.items.item; // 공항 목록

    const [contents,setContents] = useState(location.state.contents);
    const [seatLevel,setSeatLevel] = useState(location.state.seatLevel); // 다른 컴포넌트로부터 받아들인 데이터 정보
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 userId를 가져옴
    const [open, setOpen] = useState(false); // 모달창
    const [cost, setCost] = useState(0);
    const [selectedData, setSelectedData] = useState([]) //선택한 컴포넌트 객체

    /** 선택한 id가 바뀔 때마다 가격 변함 */
    useEffect(() => {
        console.log(selectedData);
    }, [selectedData])

    /** 예약확인 함수 */
    const handleOpenClose = useCallback((data) => {
        setOpen(prev => !prev); //예약확인 모달창 띄움
        setSelectedData(data); //선택한 데이터의 객체 저장
        if (seatLevel === "이코노미") setCost(data.economyCharge);
        else setCost(data.prestigeCharge);
    }, []);

    /** 예약 보내는 핸들러 함수 */
    const handleSubmit = () => {
        callPostBookInfoAPI(selectedData).then((response) => {
            if (response) {
                setOpen(false);
                navigate(`/CompleteReserve/${selectedData.id}`, {   //로그인 하면 가야함 근데 아직 서버 연결안되서 App.js 임시적으로 풀어놓음
                    state: {
                        contents: selectedData,
                        cost: cost,
                    }
                });
                console.log(response);
            } //서버로부터 예약확인을 받았다면 

        }).catch(() => {
            console.log("무슨이유로 예약정보가 서버로 안감");
        })
    }

    //출발지, 도착지 Nm -> Id로 변경
    const getAirportIdByName = (airportNm) => {
        const matchedAirport = airport.find((item) => item.airportNm === airportNm);
        return matchedAirport ? matchedAirport.airportId : null;
    };

    /**  book.js 예약보내는 API*/
    async function callPostBookInfoAPI(filteredData) {

        //백엔드로 보낼 예약데이터
        const formData = {
            id: filteredData.id, //id
            airLine: filteredData.airlineNm, //항공사
            arrAirport: getAirportIdByName(filteredData.arrAirportNm), // 도착지 공항 ID
            depAirport: getAirportIdByName(filteredData.depAirportNm), // 출발지 공항 ID
            arrTime: filteredData.arrPlandTime, //도착시간
            depTime: filteredData.depPlandTime, //출발시간
            charge: cost, //비용
            vihicleId: filteredData.vihicleId, //항공사 id
            userId: userId, //예약하는 userId
            passenger: nickname, //예약하는 nickname
        };
        try {
            const response = axios.post(Constant.serviceURL + `/flightReservation/${filteredData.id}`, formData, { withCredentials: true })
            return response;
        }
        catch (error) {
            console.error(error);
        }
    }
    return (
        <div>
            {
                open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"예약 하시겠습니까?"} />
            }
            <div>
                {
                    contents.map((info) => <InfoComponent key={info.id} info={info} handleOpenClose={handleOpenClose} seatLevel={seatLevel} />)
                }
            </div>
        </div>

    )
}

const InfoComponent = ({ info, handleOpenClose, seatLevel }) => {
    return (
        <div>
            <div>
                <span>{info.airlineNm} ({info.vihicleId})</span>
            </div>
            <div>
                <p>{info.arrPlandTime}</p>
                <p>{info.depAirportNm}</p>
            </div>
            <div>~</div>
            <div>
                <p>{info.depPlandTime}</p>
                <p>{info.arrAirportNm}</p>
            </div>
            <div>{
                seatLevel === "이코노미" ? <span>{info.economyCharge}</span> : <span>{info.prestigeCharge}</span>
            }</div>
            <div>
                <span>잔여 {info.seatCapacity}석</span>
                <button onClick={() => handleOpenClose(info)}>선택</button>
            </div>
        </div>
    )
}