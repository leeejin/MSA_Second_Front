import React, { useState, useEffect, useReducer } from 'react';
import axios from '../../axiosInstance';
import styled from "styled-components";
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import Constant from '../../util/constant_variables';
import {ModalComponent} from '../../util/custom/modal';

import book_arrow from '../../styles/image/book_arrow.png';
import Pagination from '../../util/custom/pagenation';
import { reducer, ERROR_STATE, Alert } from '../../util/custom/alert';
import { useSelector } from 'react-redux';
const SubButton = styled.p`
    float:right;
    color:var(--darkgrey-color);
    &:nth-child(1),
    &:nth-child(3){
        cursor:pointer;
    }
`;
const H2 = styled.h2`
    @media (max-width: 980px) {
        font-size: 1.0rem;
    }
`;
const Button = styled.button`
    @media (max-width: 980px) {
        width:50px;
    }
`;

//페이지네이션 ** 상태를 바꾸지 않으면 아예 외부로 내보낸다. 
const itemCountPerPage = 4; //한페이지당 보여줄 아이템 갯수
const pageCountPerPage = 10; //보여줄 페이지 갯수

const { IMP } = window;
/** 예약확인 목록 페이지 */
const logos = Constant.getLogos();
const ModalBookCheck = () => {
    const navigate = useNavigate();
    const location = useLocation(); //main.js에서 보낸 경로와 state를 받기 위함
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지

    const { seatLevel, dep, arr, depTime, contents } = location.state ?? {}; // 다른 컴포넌트로부터 받아들인 데이터 정보
    const loginInfo = {
        userId: useSelector((state) => state.userId),
        name: useSelector((state) => state.name),
        email: useSelector((state) => state.username)
    };
    const [listContents, setListContents] = useState(contents);
    const [open, setOpen] = useState({
        reserveopen: false,
        payopen: false,
    }); // 예약,결제 모달창
    const [selectedData, setSelectedData] = useState({}); //선택한 컴포넌트 객체
    const [serverData, setServerData] = useState({}); //서버에서 받은 데이터

    //페이지네이션
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (setCurrentPage()에서 변경됨)
    const [offset, setOffset] = useState(0); //현재페이지에서 시작할 item index

    /**포트원 카카오페이를 api를 이용하기 위한 전역 변수를 초기화하는 과정 이게 렌더링 될때 초기화 (requestPay가 실행되기전에 이게 초기화되어야함) */
    useEffect(() => {
        IMP.init('imp01307537');
    }, []);

    const handleError = (errorType, hasError) => {
        errorDispatch({ type: errorType, [errorType]: hasError });

        setTimeout(() => {
            errorDispatch({ type: 'error' });
        }, 2000);
    }
    /** 예약확인 함수 */
    const handleOpenCloseData = (data) => {
        setSelectedData(prevData => ({
            ...prevData,
            ...data,
            charge: seatLevel === "일반석" ? data.economyCharge : data.prestigeCharge
        }));
        setOpen(prev => ({ ...prev, reserveopen: !prev.reserveopen }));

    };
    /** 예약확인 함수 */
    const handleOpenClose = () => {
        setOpen(prev => ({ ...prev, reserveopen: !prev.reserveopen }));
    };

    const handleOpenCloseReserve = async () => {
        await reserveCancelAPI(serverData);
        setOpen(prev => ({
            ...prev,
            reserveopen: false,
            payopen: !prev.payopen
        }));

    };
    /** 페이지네이션 함수 */
    const setCurrentPageFunc = (page) => {
        let lastOffset = (page - 1) * itemCountPerPage;
        setCurrentPage(page);
        setOffset(lastOffset);
    };
    /** 예약 보내는 핸들러 함수 */
    const handleSubmit = async () => {
        await reserveInfoAPI();
    };

    /** 데이터 필터링 */
    const handleSort = (value) => {
        let filteredContents = [...contents];

        if (value === "price") {
            if (seatLevel === "일반석") filteredContents = filteredContents.sort((a, b) => a.economyCharge - b.economyCharge);
            else if (seatLevel === "프리스티지석") filteredContents = filteredContents.sort((a, b) => a.prestigeCharge - b.prestigeCharge);
        } else if (value === "depTime") {
            filteredContents = filteredContents.sort((a, b) => a.depPlandTime - b.depPlandTime);
        }

        setListContents(filteredContents);
    };
    /** 결제 함수 */
    const handlePay = async () => {
        const merchant_uid = serverData.id + "_"+"F" + new Date().getTime(); // 이부분 예약에서 받아야함 이때 1 부분만 reservationId로 변경하면됨   
        const amount = serverData.charge;
        const category = serverData.category; // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)

        // 결제 체크 및 결제 사전검증 도중 둘 중 하나라도 실패하면 결제 함수 자체를 종료
        try {
            await checkPaymentAPI(merchant_uid, category); // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)
            await preparePaymentAPI(merchant_uid, amount, category); // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)
            console.log('Payment has been prepared successfully.');
        } catch (error) {
            handleError('payError', true);
            return;
        }

        // 카카오페이 결제 요청
        IMP.request_pay({
            pg: "kakaopay",
            pay_method: "card",
            merchant_uid,
            name: "항공편 예약",
            amount,
        }, async rsp => {
            if (rsp.success) { // 결제가 성공되면
                console.log('Payment succeeded');
                await validatePaymentAPI(rsp);
            } else {
                console.error(`Payment failed.Error: ${rsp.error_msg} `);
                await cancelPaymentAPI(rsp.merchant_uid, category); // 결제 실패되었음을 알리는 요청 // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)
                setOpen(prev => ({ 
                    ...prev,
                    reserveopen:false,
                    payopen: false
                }));
            }
        });
    }


    /**  결제가 진행되기전 예약 요청을 토대로 결제 정보가 제대로 저장되었는지 확인하는 메서드 */
    async function checkPaymentAPI(merchant_uid, category) { // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)
        try {
            await axios.post(Constant.serviceURL + `/payments/check`, { // 결제 정보 존재 확인을 요청
                merchant_uid,
                category // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)
            });
            console.log('성공적으로 예약 요청을 수신했습니다');
        } catch (error) {
            console.error('해당 예약 번호로 결제 요청된 정보가 존재하지 않습니다\n오류내용 : ', error.reponse.data);

            throw new Error("결제되어야할 정보가 존재하지 않습니다");
        }
    };
    /** 실제로 결제가 되고 난 후, 결제된 금액이 실제 예약 정보에 있는 금액과 같은지 확인하는 메서드 */
    async function validatePaymentAPI(rsp) {
        try {
            const response = await axios.post(Constant.serviceURL + `/payments/validate`, { // 결제 사후 검증을 요청
                imp_uid: rsp.imp_uid,
                merchant_uid: rsp.merchant_uid,
                category : "F", // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('결제가 되고 난 후 진행되는 사후 검증에 성공했습니다.' + response);
            setOpen(prev => ({ ...prev, reserveopen: !prev.reserveopen, payopen: !prev.payopen }));
            navigate(`/CompleteBook/${serverData.id} `, {
                state: {
                    contents: serverData,
                }
            });
        } catch (error) {
            await refundPaymentAPI(rsp.merchant_uid, rsp.imp_uid, "F"); // 결제 사후 검증 실패 시 해당 결제에 대해 환불 요청 // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)
        }
    }
    /* 실제 결제가 진행되기 전, 포트원 서버에 예약 요청을 토대로 결제될 정보를 미리 등록하는 메서드 -> 결제 사전 검증 */
    async function preparePaymentAPI(merchant_uid, amount, category) { // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)
        try {
            await axios.post(Constant.serviceURL + `/payments/prepare`, { // 결제 사전 검증 요청
                merchant_uid,
                amount,
                category // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)
            });
            console.log('결제가 실제로 진행되기전 사전 검증에 성공했습니다');
        } catch (error) {
            console.error('가격과 예약번호의 불일치로 결제 사전 검증에 실패했습니다.\n오류 내용 : ', error.response.data);
            throw new Error("결제되어야할 정보가 일치하지 않습니다");
        }
    }
    /**  해당 예약번호를 가진 결제건수에 대해 환불요청 하는 메서드 */
    async function refundPaymentAPI(merchant_uid, imp_uid, category) { // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)
        console.log(merchant_uid);
        try {
            await axios.post(Constant.serviceURL + `/payments/refund`, { // 환불 요청
                merchant_uid,
                imp_uid,
                category // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('환불처리 하는데 성공했습니다.');
        } catch (error) {
            console.error('환불처리하는데 실패했습니다.\n오류내용 : ', error.response.data);
        }
    };
    /* 사용자가 단순 변심으로 도중에 결제를 취소하거나 결제 URL이 만료 되었을 때를 처리하는 메서드 */
    async function cancelPaymentAPI(merchant_uid, category) { // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)
        try {
            await axios.post(Constant.serviceURL + `/payments/cancel`, { // 결제취소 요청
                merchant_uid,
                category // TODO 카테고리 추가 (결제 서비스에서 항공편인지 숙소 결제인지 구분하기 위함)
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('결제취소 처리가 성공적으로 되었습니다');
            setOpen(prev => ({
                ...prev,
                payopen: !prev.payopen,
                reserveopen: !prev.reserveopen
            }));
        } catch (error) {

            console.error('결제취소 처리가 실패했습니다.\n오류내용 : ', error.reponse.data);
        }
    };
    /** 예약 함수  */
    async function reserveInfoAPI() {
        //백엔드에 보낼 예약정보
        const formData = {
            flightId: selectedData.id,
            airLine: selectedData.airlineNm, //항공사
            arrAirport: Constant.getAirportIdByName(selectedData.arrAirportNm), // 도착지 공항 ID
            depAirport: Constant.getAirportIdByName(selectedData.depAirportNm), // 출발지 공항 ID
            arrTime: selectedData.arrPlandTime, //도착시간
            depTime: selectedData.depPlandTime, //출발시간
            charge: selectedData.charge, //비용
            vihicleId: selectedData.vihicleId, //항공사 id
            userId: loginInfo.userId, //예약하는 userId 
            email: loginInfo.email,
            name: loginInfo.name
        };
        try {
            const reservationResponse = await axios.post(Constant.serviceURL + `/flightReservations/create`, formData);
            console.log("서버로부터 받은 데이터 : ", reservationResponse.data);
            setServerData(reservationResponse.data);
            setOpen(prev => ({ 
                ...prev,
                payopen: true
            }));
        } catch (error) {
            //안되면 에러뜨게 함
            setOpen(prev => ({
                ...prev,
                reserveopen: false
            }));
            handleError('reserveError', true);
        }
    }
    /**예약 취소 함수 */
    async function reserveCancelAPI() {
        // 취소보낼 데이터
        const formData = {
            flightReservationId: serverData.id, // 취소id
        };
        try {// 결제 취소 알림 요청
            const response = await axios.post(Constant.serviceURL + `/flightReservations/cancel`, formData);
            console.log("취소완료");
            handleError('reservecancelSuccess', true);
            return response;

        } catch (error) {
            console.error(error);
            handleError('reservecancelError', true);
        }
    }

    if (!location.state) {
        return (<Navigate to="*" />)
    } else {
        return (
            <div className="container">
                <Alert errorMessage={errorMessage} />
                {
                    open.reserveopen && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={`예약하시겠습니까?`} data={selectedData} />
                }
                {
                    open.payopen && <ModalComponent handleSubmit={handlePay} handleOpenClose={handleOpenCloseReserve} message={"예약이 완료되었습니다. 카카오페이로 결제하시겠습니까?"} />
                }
                <div className="container-top" style={{ height: '200px', marginTop: '60px' }}>
                    <div className="panel panel-top font-color-white" >
                        <div className="d-flex d-row">
                            <h1 className="font-family-bold">{dep} </h1>
                            <img alt="옆" src={book_arrow} width={'30px'} style={{ margin: '15px' }} />
                            <h1 className="font-family-bold"> {arr}</h1>
                        </div>
                        <p>{Constant.handleDayFormatChange(depTime)}</p>
                    </div>
                </div>
                <div className="middlepanel" style={{ height: '500px' }}>
                    <div style={{ paddingTop: '15px' }}>
                        <SubButton onClick={() => handleSort("depTime")}>출발시간 빠른순</SubButton>
                        <SubButton> | </SubButton>
                        <SubButton onClick={() => handleSort("price")}>낮은 가격순</SubButton>
                        <div style={{ clear: 'both' }} />
                        <hr className="hr" />
                    </div>

                    {
                        listContents.slice(offset, offset + itemCountPerPage).map((info) =>
                            <InfoComponent key={info.id} info={info} handleOpenCloseData={() => handleOpenCloseData(info)} seatLevel={seatLevel} />)
                    }
                </div>
                {listContents.length > itemCountPerPage && (
                    <Pagination
                        itemCount={listContents.length}
                        pageCountPerPage={pageCountPerPage}
                        itemCountPerPage={itemCountPerPage}
                        currentPage={currentPage}
                        clickListener={setCurrentPageFunc}
                    />
                )}
            </div>

        )
    }


};

const InfoComponent = ({ info, handleOpenCloseData, seatLevel }) => {

    // economyCharge 또는 prestigeCharge가 0인 경우, 컴포넌트 렌더링 안함
    if ((seatLevel === "일반석" && info.economyCharge === 0) || (seatLevel === "프리스티지석" && info.prestigeCharge === 0)) {
        return null;
    } else {
        return (
            <table className="table-list-card">
                <tbody>
                    <tr>
                        <td className="td-vihicleId">
                            <img src={Constant.getAirlineLogo(logos, info.airlineNm)} width={"100%"} alt={info.airlineNm} />
                            <p>{info.airlineNm}</p>
                            <p>{info.vihicleId}</p>
                        </td>
                        <td className="td-vihicleId">
                            <p>{info.vihicleId}</p>
                        </td>
                        <td>
                            <H2>{Constant.handleTimeFormatChange(info.depPlandTime)}</H2>
                            <h4 className="font-family-light">{info.depAirportNm}</h4>
                        </td>
                        <td className="td-vihicleId">
                            <p>
                                {Constant.handleDateCalculate(info.arrPlandTime, info.depPlandTime)}
                            </p>

                        </td>

                        <td>
                            <H2>{Constant.handleTimeFormatChange(info.arrPlandTime)}</H2>
                            <h4 className="font-family-light">{info.arrAirportNm}</h4>
                        </td>
                        <td className="td-vihicleId">
                            <p>잔여 {info.seatCapacity}석</p>
                        </td>
                        <td className="td-vihicleId">
                            <p>잔여 {info.seatCapacity}석</p>
                            <H2 className="font-family-bold">
                                {
                                    seatLevel === "일반석" ? <>
                                        {info.economyCharge.toLocaleString()}
                                    </>
                                        : <>
                                            {info.prestigeCharge.toLocaleString()}
                                        </>

                                }</H2>
                        </td>
                        <td>
                            <Button className="btn btn-style-grey" onClick={() => handleOpenCloseData(info)}>선택</Button>
                        </td>
                    </tr>
                </tbody>
            </table>

        )
    }

}
export default ModalBookCheck;