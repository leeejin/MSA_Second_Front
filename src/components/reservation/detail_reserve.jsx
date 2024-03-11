import React, { useState, useReducer, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import PublicInfo from './detail_part/detail_publicinfo';
import IntroduceInfo from './detail_part/detail_introduceinfo';
import RoomInfo from './detail_part/detail_roominfo';
import ModalComponent from '../../util/custom/modal';
import { IoCall } from "react-icons/io5";
import { reducer, ERROR_STATE, Alert } from '../../util/custom/alert';
import axios from '../../axiosInstance';
import Constant from '../../util/constant_variables';
import { useSelector } from 'react-redux';
const Menubar = styled.div`
    display:flex;
    flex-direction:row;
    width:300px;
    text-align:center;
    margin:auto;
    margin-top:25px;
    border-radius:25px;
    box-shadow:0px 3px 6px rgba(0, 0, 0, 0.25);
`;

const { IMP } = window;
/** 예약확인 목록 페이지 */
const DetailReserve = () => {
    const location = useLocation();
    const loginInfo = {
        userId: useSelector((state) => state.userId),
        name: useSelector((state) => state.name),
        email: useSelector((state) => state.username)
    };
    const { contents } = location.state ?? {};
    const [open, setOpen] = useState({
        reserveopen: false,
        payopen: false,
    }); // 예약,결제 모달창
    const [subBoxVisible, setSubBoxVisible] = useState({ publicinfo: true, introduceinfo: false, roominfo: false, etcimageinfo: false }); //공통정보, 소개정보, 객실정보, 추가이미지
    const [selectedData, setSelectedData] = useState({}); //선택한 데이터
    const [serverData, setServerData] = useState({}); //서버로부터 받은 데이터
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 

    /**포트원 카카오페이를 api를 이용하기 위한 전역 변수를 초기화하는 과정 이게 렌더링 될때 초기화 (requestPay가 실행되기전에 이게 초기화되어야함) */
    useEffect(() => {
        IMP.init('imp01307537');
    }, []);

    const handleError = (errorType, hasError) => {
        errorDispatch({ type: errorType, [errorType]: hasError });

        setTimeout(() => {
            errorDispatch({ type: 'error' });
        }, 2000);
    };
    /** 예약확인 함수 */
    const handleOpenCloseData = (data) => {
        setSelectedData(prevData => ({
            ...prevData,
            ...data,
        }));
        setOpen(prev => ({ ...prev, reserveopen: !prev.reserveopen }));

    };
    /** 모달창 on/off */
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
    /** 결제 함수 */
    const handlePay = async () => {
        const merchant_uid = serverData.id + "_"+"L" + new Date().getTime(); // 이부분 예약에서 받아야함 이때 1 부분만 reservationId로 변경하면됨   
        const amount = serverData.charge;

        // 결제 체크 및 결제 사전검증 도중 둘 중 하나라도 실패하면 결제 함수 자체를 종료
        try {
            await checkPaymentAPI(merchant_uid);
            await preparePaymentAPI(merchant_uid, amount);
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
            name: "숙소 예약",
            amount,
        }, async (rsp) => {
            if (rsp.success) { // 결제가 성공되면
                console.log('Payment succeeded');
                await validatePaymentAPI(rsp);
            } else {
                console.error(`Payment failed.Error: ${rsp.error_msg} `);
                await cancelPaymentAPI(rsp.merchant_uid); // 결제 실패되었음을 알리는 요청
            }
        });
    }
    /** 예약 보내는 핸들러 함수 */
    const handleSubmit = async () => {
        await reserveInfoAPI();
       
    };
    /** 메뉴 선택 */
    const handleLocation = (selectedMenu) => {
        setSubBoxVisible({
            publicinfo: selectedMenu === 'publicinfo',
            introduceinfo: selectedMenu === 'introduceinfo',
            roominfo: selectedMenu === 'roominfo',
            etcimageinfo: selectedMenu === 'etcimageinfo',
        });
    }

    /**  결제가 진행되기전 예약 요청을 토대로 결제 정보가 제대로 저장되었는지 확인하는 메서드 */
    async function checkPaymentAPI(merchant_uid) {
        try {
            await axios.post(Constant.serviceURL + `/payments/check`, { // 결제 정보 존재 확인을 요청
                merchant_uid
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
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('결제가 되고 난 후 진행되는 사후 검증에 성공했습니다.' + response);
            setOpen(prev => ({ ...prev, reserveopen: !prev.reserveopen, payopen: !prev.payopen }));
            // navigate(`/CompleteBook/${serverData.id} `, {
            //     state: {
            //         contents: serverData,
            //     }
            // });
        } catch (error) {
            await refundPaymentAPI(rsp.merchant_uid, rsp.imp_uid); // 결제 사후 검증 실패 시 해당 결제에 대해 환불 요청
        }
    }
    /* 실제 결제가 진행되기 전, 포트원 서버에 예약 요청을 토대로 결제될 정보를 미리 등록하는 메서드 -> 결제 사전 검증 */
    async function preparePaymentAPI(merchant_uid, amount) {
        try {
            await axios.post(Constant.serviceURL + `/payments/prepare`, { // 결제 사전 검증 요청
                merchant_uid,
                amount
            });
            console.log('결제가 실제로 진행되기전 사전 검증에 성공했습니다');
        } catch (error) {
            console.error('가격과 예약번호의 불일치로 결제 사전 검증에 실패했습니다.\n오류 내용 : ', error.response.data);
            throw new Error("결제되어야할 정보가 일치하지 않습니다");
        }
    }
    /**  해당 예약번호를 가진 결제건수에 대해 환불요청 하는 메서드 */
    async function refundPaymentAPI(merchant_uid, imp_uid) {
        console.log(merchant_uid);
        try {
            await axios.post(Constant.serviceURL + `/payments/refund`, { // 환불 요청
                merchant_uid,
                imp_uid
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
    async function cancelPaymentAPI(merchant_uid) {
        try {
            await axios.post(Constant.serviceURL + `/payments/cancel`, { // 결제취소 요청
                merchant_uid
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
            status: "결제전",
            category: "L",
            userId: loginInfo.userId, //예약하는 userId
            email: loginInfo.email,
            name: loginInfo.name
        };
        try {
            const reservationResponse = await axios.post(Constant.serviceURL + `숙소예약URL`, formData);
            console.log("서버로부터 받은 데이터 : ", reservationResponse.data);
            setServerData(reservationResponse.data);
            handleError('accommodationReserveSuccess', true);
            setOpen(prev => ({
                ...prev,
                reserveopen: false,
                payopen: !prev.payopen
            }));
        } catch (error) {
            //안되면 에러뜨게 함
            setOpen(prev => ({
                ...prev,
                reserveopen: !prev.reserveopen
            }));
            handleError('reserveError', true);
        }
    }
    /**예약 취소 함수 */
    async function reserveCancelAPI() {
        // 취소보낼 데이터
        const formData = {
            flightReservationDTO: serverData.id, // flightReservationDTO : flightReservationId
        };
        try {// 결제 취소 알림 요청
            const response = await axios.post(Constant.serviceURL + `숙소예약취소URL`, formData);
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
    }
    else {
        return (
            <div className="container">
                <Alert errorMessage={errorMessage} />
                {
                    open.reserveopen && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"숙소예약하시겠습니까?"} />
                }
                {
                    open.payopen && <ModalComponent handleSubmit={handlePay} handleOpenClose={handleOpenCloseReserve} message={"예약이 완료되었습니다. 카카오페이로 결제하시겠습니까?"} />
                }
                <div className="container-top" style={{ height: '220px', marginTop: '60px' }}>
                    <div className="panel panel-top font-color-white" >
                        <h2 className="font-family-bold">{contents.title}</h2>
                        <p>{contents.addr1}</p>
                        <p>{contents.overview}</p>
                        <p><IoCall /> {contents.tel}</p>
                        <div className="d-flex d-row" style={{ justifyContent: 'space-around' }} >
                            <div className="d-flex" style={{ gap: '10px' }}>
                                <p>성수기 주중</p>
                                <h3 style={{ margin: '0 0 0 10px' }}>{contents.charge} 원</h3>
                            </div>
                            <div>
                                <button className="btn btn-style-reserve" onClick={() => handleOpenCloseData(contents)}>
                                    예약하러 가기
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
                <Menubar>
                    <div
                        className={`btn font-family-semibold ${subBoxVisible.publicinfo && "selected"}`}
                        style={{ width: '33.3%', padding: '10px' }}
                        onClick={() => handleLocation('publicinfo')}
                    >
                        공통정보
                    </div>
                    <div
                        className={`btn font-family-semibold ${subBoxVisible.introduceinfo && "selected"}`}
                        style={{ width: '33.3%', padding: '10px' }}
                        onClick={() => handleLocation('introduceinfo')}
                    >
                        소개정보
                    </div>
                    <div
                        className={`btn font-family-semibold ${subBoxVisible.roominfo && "selected"}`}
                        style={{ width: '33.3%', padding: '10px' }}
                        onClick={() => handleLocation('roominfo')}
                    >숙소이미지
                    </div>

                </Menubar>

                {
                    subBoxVisible.publicinfo && <PublicInfo contents={contents} />
                }
                {
                    subBoxVisible.introduceinfo && <IntroduceInfo contents={contents} />
                }
                {
                    subBoxVisible.roominfo && <RoomInfo contents={contents} />
                }

            </div>
        )
    }

};


export default DetailReserve;