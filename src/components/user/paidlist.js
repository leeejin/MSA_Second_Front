import React, { useState, useEffect, useCallback, useReducer, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import axios from '../../axiosInstance';
import store from '../../util/redux_storage';
import Constant from '../../util/constant_variables';
import ModalComponent from '../../util/modal';
import Plane from '../../styles/image/plane.png'
import styled from "styled-components";
import Spinner from '../../styles/image/loading.gif';
import NoData from '../../styles/image/noData.png';
import AirPort from '../../util/json/airport-list';
import reducer from '../../util/reducers';
import { BsExclamationCircle } from "react-icons/bs";
//페이지네이션 ** 상태를 바꾸지 않으면 아예 외부로 내보낸다. 
const itemCountPerPage = 2; //한페이지당 보여줄 아이템 갯수
const pageCountPerPage = 5; //보여줄 페이지 갯수
const logos = Constant.getLogos(); //보여줄 항공사 로고이미지
const airport = AirPort.response.body.items.item; // 공항 목록
/** 에러메시지 (출발지-도착지, 날짜) */
const CANCEL_ERROR = 'cancelError';
const CANCEL_SUCCESS = 'cancelSuccess';
const LIST_ERROR = 'listError';
const ERROR_STATE = {
    [CANCEL_ERROR]: false,
    [CANCEL_SUCCESS]: false,
    [LIST_ERROR]: false,
}
const errorMapping = {
    [CANCEL_ERROR]: '환불실패하였습니다',
    [CANCEL_SUCCESS]: '환불완료되었습니다',
    [LIST_ERROR]: '목록을 불러오는데 실패하였습니다',
};
/** 결제한 목록을 보여주는 함수 */
export default function PaidList({ userId }) {
    const [open, setOpen] = useState(false); // 취소모달창
    const [contents, setContents] = useState([]); //백엔드로부터 받은 예약목록 리스트를 여기다가 저장
    const [payContents, setPayContents] = useState([]); //결제데이터 여기다가 저장
    const [selectedData, setSelectedData] = useState([]) //선택한 컴포넌트 객체
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        callGetBookedListAPI().then((response) => {
            setContents(response);
        }).catch((error) => {
            errorDispatch({ type: 'listError', listError: true });
            setTimeout(() => {
                errorDispatch({ type: 'error' });
            }, [1000])
        })
    }, [])
    const errorElements = useMemo(() => {
        return Object.keys(errorMapping).map((key) => {
            if (errorMessage[key]) {
                return (
                    <h3 className="modal white-wrap message" key={key}>
                        <BsExclamationCircle className="exclamation-mark" /> {errorMapping[key]}
                    </h3>
                );
            }
            return null;
        });
    }, [errorMessage]);
    /** 결제확인 함수 */
    const handleOpenClose = useCallback((data) => {
        setOpen(prev => !prev); //결재취소 확인 모달창 띄움
        setSelectedData(data); //선택한 데이터의 객체 저장
    }, []);

    /** 결제취소 함수 */
    const handleSubmit = async () => {
        console.log("선택한 데이터 : ", selectedData);
        try {
            await cancelPayment(selectedData.reservationId);
            // 결제 취소 후 새로운 결제 목록을 불러옵니다.
            setLoading(true);
            const updatedContents = await callGetBookedListAPI();
            setContents(updatedContents);
            setOpen(!open);
            setLoading(false);
            errorDispatch({ type: 'cancelSuccess', cancelSuccess: true });
            setTimeout(() => {
                errorDispatch({ type: 'error' });
            }, [1000])
            window.location.reload();
        } catch (error) {
            errorDispatch({ type: 'cancelError', cancelError: true });
            setTimeout(() => {
                errorDispatch({ type: 'error' });
            }, [1000])
            setOpen(!open);
        }
    }

    /** 예약 목록 불러오는 API */
    async function callGetBookedListAPI() {
        try {
            const response = await axios.post(Constant.serviceURL + `/flightInfos`, { userId });
            return response.data;
        } catch (error) {
            console.error(error);
        }

    }
    /**결제 취소 요청 함수  */
    async function cancelPayment(merchant_uid) {
        try {
            await axios.post(Constant.serviceURL + `/payments/cancel`, { // 결제 취소 요청
                merchant_uid
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Failed to notify payment cancellation', error);
        }
    };

    if (loading) return (<div className="fixed d-flex container-fixed">
        <img src={Spinner} alt="로딩" width="100px" />
        <h3>목록을 불러오는 중입니다</h3>
    </div>)
    return (
        <div className="container">
            <div>{errorElements}</div>
            {
                open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"결제취소 하시겠습니까?"} />
            }


            <div className="w-50">
                {contents.length > 0 ? (
                    contents.map((paidlist, i) => (
                        <PaidListItem key={paidlist.reservationId} paidlist={paidlist} handleOpenClose={handleOpenClose} />
                    ))
                ) : (
                    <div className="container-content">
                        <div className=" d-flex d-column" style={{ height: '100%' }}>
                            <img src={NoData} />
                            <h3>최근 결제된 내역이 없어요!</h3>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

/** 결제 목록 리스트 아이템 */
const PaidListItem = ({ paidlist, handleOpenClose }) => {
    /** 출발지, 도착지 Id -> Nm로 변경 */
    const getAirportIdByName = (airportId) => {
        const matchedAirport = airport.find((item) => item.airportId === airportId);
        return matchedAirport ? matchedAirport.airportNm : null;
    };
    const getAirlineLogo = (airLine) => {
        const matchingLogo = logos.find(logo => logo.value === airLine);
        return matchingLogo ? matchingLogo.imageUrl : '';
    };
    return (
        <table className="table-list-card">
            <thead>
                <tr>
                    <th>편명 <span className="font-color-darkgrey">Flight</span></th>
                    <th >출발 <span className="font-color-darkgrey">From</span></th>
                    <th />
                    <th>도착 <span className="font-color-darkgrey">To</span></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <img src={getAirlineLogo(paidlist.airLine)} width={"130px"} alt={paidlist.airlineNm} />
                        <h3>{paidlist.airLine}</h3>
                        <p>{paidlist.vihicleId}</p>
                    </td>
                    <td>
                        <h1 className="font-color-special">{getAirportIdByName(paidlist.depAirport)}</h1>
                        <p>{Constant.handleDateFormatChange(paidlist.depTime)}</p>

                    </td>
                    <td>
                        <img src={Plane} width={'40px'} />
                    </td>
                    <td>
                        <h1 className="font-color-special">{getAirportIdByName(paidlist.arrAirport)}</h1>
                        <p>{Constant.handleDateFormatChange(paidlist.arrTime)}</p>
                    </td>
                </tr>
                <tr>
                    <td >
                        <h2 className="font-family-extrabold">₩ {paidlist.charge.toLocaleString()}</h2>
                    </td>
                    <td>
                        <p>{paidlist.status}</p>
                    </td>
                    <td colSpan={2}>
                        {
                            paidlist.status === "예약취소" ? null : <button className="btn btn-style-grey" onClick={() => handleOpenClose(paidlist)}>취소</button>
                        }

                    </td>
                </tr>
            </tbody>

        </table>

    )
}