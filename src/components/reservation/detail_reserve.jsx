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
    const { contentid } = location.state; //페이지 로드될때 백으로 보낼 데이터
    const loginInfo = {
        userId: useSelector((state) => state.userId),
        name: useSelector((state) => state.name),
        email: useSelector((state) => state.username)
    };
    const [contents, setContents] = useState({});
    const [open, setOpen] = useState({
        reserveopen: false,
        payopen: false,
    }); // 예약,결제 모달창
    const [subBoxVisible, setSubBoxVisible] = useState({ publicinfo: true, introduceinfo: false, roominfo: false, etcimageinfo: false }); //공통정보, 소개정보, 객실정보, 추가이미지
    const [selectedData, setSelectedData] = useState({}); //선택한 데이터
    const [serverData, setServerData] = useState({}); //서버로부터 받은 데이터
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 

    useEffect(() => {
        getAccommodationReserveAPI().then((response) => {
            setContents(response);
        });
    }, [])
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
        const merchant_uid = serverData.id + "_" + "L" + new Date().getTime(); // 이부분 예약에서 받아야함 이때 1 부분만 reservationId로 변경하면됨   
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
            //이것도무슨 데이터 보낼지
            /**
             * reservationdate:, <<<<<<<<<<<<<<<<<<선정님 디자인 부탁드립니다>>>>>>>>>>>>>>>>>>>>>
             * email:,
             * charge:,
             * contentId: ,  그러면 이거 네개만 일단 ㅗㅂ내면 되는거죠 ?????,
             * 
             */
        };
        try {
            const reservationResponse = await axios.post(Constant.serviceURL + `/lodgingReservation/create`, formData);
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
            lodgingreservationId: serverData.id, 
        };
        try {// 결제 취소 알림 요청
            const response = await axios.post(Constant.serviceURL + `/lodgingReservation/cancel`, formData);
            console.log("취소완료");
            handleError('reservecancelSuccess', true);
            return response;

        } catch (error) {
            console.error(error);
            handleError('reservecancelError', true);
        }
    }
    /** 숙소디테일 데이터 불러오는 함수 페이지 로드 될 때 실행 */
    async function getAccommodationReserveAPI() {
        const params = {
            contentid: contentid
        }
        try {
            // const response = await axios.get(Constant.serviceURL+`/lodgings`,{params:params});
           
            return {
                addr1: "서울특별시 용산구 이태원동 131-11",
                addr2: "",
                areaCode: "3",
                contentid: 2594874,
                contenttypeid: 32,
                firstimage: "http://tong.visitkorea.or.kr/cms/resource/33/2947233_image2_1.jpg",
                firstimage2: "http://tong.visitkorea.or.kr/cms/resource/33/2947233_image3_1.jpg",
                id: 63,
                modifiedtime: 20190404023919,
                sigungucode: "1",
                tel: "042-932-0005",
                title: "IBC호텔",
                checkintime: "14:00",
                checkouttime: "11:30",
                parkinglodging: "가능",
                chkcooking: "가능",
                refundregulation: "숙박 2일 전까지 취소 시 100%, 당일 70% 환불",
                mapx: "127.4314778135",
                mapy: "36.4504883321",
                mlevel: "3",
                overview: "호텔더에이치는 대전 신탄지역에 근접한 비즈니스 호텔로, 합리적인 가격과 품격있는 서라운드? 활용하기 좋다. 장애인 화장실을 갖춘 객실도 있다. 1층 카페에서 무료 조식을 제공하고 난토카~~",
                zipcode: "36760",
                telname: "오광석",
                reserveationurl: "http://www.hoteltheh.co.kr",
                charge: 20000, //성수기 주중  = 가격
                charge1: 10000, //비수기주중최소
                charge2: 10000, //비수기주말최소
            };
        } catch (error) {
            console.error(error);
        }

    }
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
                >객실정보
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
};


export default DetailReserve;