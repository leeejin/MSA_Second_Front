import React, { useState, useEffect, useCallback, useReducer, useMemo } from 'react';
import axios from '../../axiosInstance';
import { useNavigate, Navigate,Link } from 'react-router-dom';
import { useLocation } from 'react-router';
import Constant from '../../util/constant_variables';
import ModalComponent from '../../util/modal';
import AirPort from '../../util/json/airport-list';
import store from '../../util/redux_storage';
import Pagination from '../../util/pagenation';
import { BsExclamationCircle } from "react-icons/bs";
/** 에러메시지 (출발지-도착지, 날짜) */
const ERROR_STATE = {
    paySuccess: false, //결제 성공
    payError: false, //결제 에러
    cancelSuccess: false, //취소 성공
    cancelErorr: false, //취소 에러
    reserveError: false, // 예약 에러
}
const reducer = (state, action) => {
    switch (action.type) {
        case 'paySuccess':
            return { ...state, payError: true }
        case 'payError':
            return { ...state, payError: true }
        case 'cancelError':
            return { ...state, cancelError: true }
        case 'cancelSuccess':
            return { ...state, cancelSuccess: true }
        case 'reserveError':
            return { ...state, reserveError: true }
        default:
            return ERROR_STATE

    }
}
const areas = [
    { name: '전체', code: "" },
    { name: '서울', code: 1 },
    { name: '인천', code: 2 },
    { name: '대전', code: 3 },
    { name: '대구', code: 4 },
    { name: '광주', code: 5 },
    { name: '부산', code: 6 },
    { name: '울산', code: 7 },
    { name: '세종', code: 8 },
    { name: '경기도', code: 31 },
    { name: '강원도', code: 32 },
    { name: '충청북도', code: 33 },
    { name: '충청남도', code: 34 },
    { name: '경상북도', code: 35 },
    { name: '경상남도', code: 36 },
    { name: '전라북도', code: 37 },
    { name: '전라남도', code: 38 },
    { name: '제주도', code: 39 },
];
// 테스트 데이터, 백엔드에서 보내줄 데이터는 아래의 contentid, title, addr1, tel, firstimage로 현재는 이렇게 있습니다.
const testRooms = [
    { contentid: 1, title: '방1', addr1: '서울시 강남구', tel: '02-1234-5678', firstimage: 'image1.jpg' },
    { contentid: 2, title: '방2', addr1: '서울시 강북구', tel: '02-8765-4321', firstimage: 'image2.jpg' },
    { contentid: 3, title: '방3', addr1: '서울시 강북구', tel: '02-8765-4321', firstimage: 'image3.jpg' },
    { contentid: 4, title: '방4', addr1: '서울시 강북구', tel: '02-8765-4321', firstimage: 'image4.jpg' },
    { contentid: 5, title: '방5', addr1: '서울시 강북구', tel: '02-8765-4321', firstimage: 'image5.jpg' },

    // 필요한 만큼 방 정보를 직접 추가하세요.
];
//페이지네이션 ** 상태를 바꾸지 않으면 아예 외부로 내보낸다. 
const itemCountPerPage = 5; //한페이지당 보여줄 아이템 갯수
const pageCountPerPage = 5; //보여줄 페이지 갯수
const numOfRows = 5;
/** 예약확인 목록 페이지 */
const airport = AirPort.response.body.items.item; // 공항 목록
export default function ModalReserveCheck() {
    const navigate = useNavigate();
    const location = useLocation(); //main.js에서 보낸 경로와 state를 받기 위함
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
    const errorMapping = {
        reserveError: '이미 예약하였습니다',
        paySuccess: '결제가 완료되었습니다! 결제목록 카테고리로 가면 확인할 수 있습니다',
        payError: '결제실패하였습니다',
        cancelError: '예약취소 실패하였습니다',
        cancelSuccess: '예약취소 성공하였습니다',
    };

    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴 
    const [name, setName] = useState(store.getState().name); //리덕스에 있는 name를 가져옴 
    const [open, setOpen] = useState(false); // 예약모달창
    const [payopen, setPayOpen] = useState(false); //결제모달창

    const [rooms, setRooms] = useState([]); //백엔드로부터 오는 데이터를 담을 변수
    const [loading, setLoading] = useState(false); //백엔드로 요청할 시에는 true로 변경하기
    const [areaCode, setAreaCode] = useState(areas[0].code); //기본 지역은 전체 검색

    const [selectedData, setSelectedData] = useState([]) //선택한 컴포넌트 객체
    const [serverData, setServerData] = useState([]); //서버에서 받은 데이터
    //페이지네이션
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (setCurrentPage()에서 변경됨)
    const [offset, setOffset] = useState(0); //현재페이지에서 시작할 item index

    /**포트원 카카오페이를 api를 이용하기 위한 전역 변수를 초기화하는 과정 이게 렌더링 될때 초기화 (requestPay가 실행되기전에 이게 초기화되어야함) */
    useEffect(() => {
        const { IMP } = window;
        IMP.init('imp01307537');
    }, []);
    useEffect(() => {
        // const fetchData = async () => {
        //   setLoading(true);
        //   try {
        //     const result = await axios.get(
        //       `http://localhost:8088/rooms/search`
        //     );
        //     setRooms(result.data);
        //     setError(null);
        //   } catch (error) {
        //     setError(error);
        //   }
        //   setLoading(false);
        // };

        // fetchData();
        setRooms(testRooms);
    }, [areaCode]);
    /** 예약확인 함수 */
    const handleOpenClose = useCallback((data) => {
        setSelectedData(data);
        setOpen(prev => !prev);
        setSelectedData(prevData => ({
            ...prevData,
        }));
    }, []);

    const handleOpenCloseReserve = async (e) => {
        e.preventDefault();
        setOpen(false);
        const newPayOpen = !payopen;
        setPayOpen(newPayOpen);

        if (!newPayOpen) {
            await reserveCancelAPI(serverData.id);
        }
    };
    /** 페이지네이션 함수 */
    const setCurrentPageFunc = (page) => {
        let lastOffset = (page - 1) * itemCountPerPage;
        setCurrentPage(page);
        setOffset(lastOffset);
    };
    /** 예약 보내는 핸들러 함수 */
    const handleSubmit = async () => {
        //백엔드에 보낼 예약정보
        const formData = {
           
            vihicleId: selectedData.vihicleId, //항공사 id
            status: "결제전",
            userId: userId, //예약하는 userId
            name: name
        };

        console.log("선택한 컴포넌트 객체 : " + selectedData);
        console.log("폼데이터 : ", formData);
        // 예약 요청하는 부분 -> 이부분은 예약 요청할때의 옵션들을 하드코딩으로 채워넣음 사용자가 선택한 옵션으로 수정해야함 

        await reserveInfoAPI(formData);

    };

    const errorElements = useMemo(() => {
        return Object.keys(errorMapping).map((key) => {
            if (errorMessage[key]) {
                return (
                    <h3 className="white-wrap message" key={key}>
                        <BsExclamationCircle className="exclamation-mark" /> {errorMapping[key]}
                    </h3>
                );
            }
            return null;
        });
    }, [errorMessage, errorMapping]);
    const handlePay = async () => {
        const { IMP } = window;
        const merchant_uid = serverData.id + "_" + new Date().getTime(); // 이부분 예약에서 받아야함 이때 1 부분만 reservationId로 변경하면됨   
        const amount = serverData.charge;

        // 결제 체크 및 결제 사전검증 도중 둘 중 하나라도 실패하면 결제 함수 자체를 종료
        try {
            await checkPaymentAPI(merchant_uid);
            await preparePaymentAPI(merchant_uid, amount);
            console.log('Payment has been prepared successfully.');
        } catch (error) {
            alert(error.message);
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
                try {
                    const response = await axios.post(Constant.serviceURL + `/payments/validate`, { // 결제 사후 검증
                        imp_uid: rsp.imp_uid,
                        merchant_uid: rsp.merchant_uid,
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log('Payment information saved successfully' + response);
                    console.log(merchant_uid);
                    setOpen(false);
                    navigate(`/CompleteBook/${serverData.id}`, {
                        state: {
                            contents: serverData,
                        }
                    });
                } catch (error) {
                    errorDispatch({ type: 'payError', payError: true });
                    setTimeout(() => {
                        errorDispatch({ type: 'error' });
                    }, [1000])
                    await cancelPaymentAPI(rsp.merchant_uid, rsp.imp_uid); // 결제 사후 검증 실패 시 결제 취소 요청
                }
            } else {
                console.error(`Payment failed. Error: ${rsp.error_msg}`);
                await cancelPaymentNotifyAPI(rsp.merchant_uid); // 결제 실패되었음을 알리는 요청
            }
        });
    }
    /** 출발지, 도착지 Nm -> Id로 변경 */
    const getAirportIdByName = (airportNm) => {
        const matchedAirport = airport.find((item) => item.airportNm === airportNm);
        return matchedAirport ? matchedAirport.airportId : null;
    };

    /**  결제 사전 확인 함수 */
    async function checkPaymentAPI(merchant_uid) {
        try {
            await axios.post(Constant.serviceURL + `/payments/check`, { // 결제 사전 검증 요청
                merchant_uid
            });
            console.log('Payment Check successfully');
        } catch (error) {
            console.error('Failed to check payment', error);
            errorDispatch({ type: 'payError', payError: true });
            setTimeout(() => {
                errorDispatch({ type: 'error' });
            }, [1000]);
            throw new Error("결제되어야할 정보가 존재하지 않습니다");
        }
    };

    /**  결제 사전 검증 함수 */
    async function preparePaymentAPI(merchant_uid, amount) {
        try {
            await axios.post(Constant.serviceURL + `/payments/prepare`, { // 결제 사전 검증 요청
                merchant_uid,
                amount
            });
            console.log('Payment Prepare successfully');
        } catch (error) {
            console.error('Failed to prepare payment', error);
            errorDispatch({ type: 'payError', payError: true });
            setTimeout(() => {
                errorDispatch({ type: 'error' });
            }, [1000]);
            throw new Error("결제되어야할 정보가 일치하지 않습니다");
        }
    }
    /**  결제 취소 요청 함수 */
    async function cancelPaymentAPI(merchant_uid, imp_uid) {
        console.log(merchant_uid);
        try {
            await axios.post(Constant.serviceURL + `/payments/cancel`, { // 결제 취소 요청(사용자 단순 변심으로 결제취소및 결제 시간 만료를 위한 메서드)
                merchant_uid,
                imp_uid
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Payment cancellation successfully');
        } catch (error) {
            console.error('Failed to payment cancellation', error);
        }
    };
    /** 결제 취소 알림 함수 */
    async function cancelPaymentNotifyAPI(merchant_uid) {
        try {
            await axios.post(Constant.serviceURL + `/payments/fail`, { // 결제 취소 알림 요청
                merchant_uid
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Payment cancellation notified successfully');
            setPayOpen(false);
            setOpen(false);
        } catch (error) {

            console.error('Failed to notify payment cancellation', error);
        }
    };
    /** 예약 함수  */
    async function reserveInfoAPI(formData) {
        try {
            const reservationResponse = await axios.post(Constant.serviceURL + `/flightReservations`, formData);
            console.log("서버로부터 받은 데이터 : ", reservationResponse.data);
            setServerData(reservationResponse.data);
            setPayOpen(!payopen);
        } catch (error) {
            //안되면 에러뜨게 함
            setOpen(!open);
            errorDispatch({ type: 'reserveError', reserveError: true });
            setTimeout(() => {
                errorDispatch({ type: 'error' });
            }, [1000])
        }
    }
    /**예약 취소 함수 */
    async function reserveCancelAPI(reservedId) {
        try {
            await axios.post(Constant.serviceURL + `/flightReservations/cancel`, { // 결제 취소 알림 요청
                reservedId
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("취소완료");
            errorDispatch({ type: 'cancelSuccess', cancelSuccess: true });
            setTimeout(() => {
                errorDispatch({ type: 'error' });
            }, [1000]);
        } catch (error) {
            console.error(error);
            errorDispatch({ type: 'cancelError', cancelError: true });
            setTimeout(() => {
                errorDispatch({ type: 'error' });
            }, [1000]);
        }
    }

    if (!location.state) {
        return (<Navigate to="*" />)
    } else {
        return (
            <div>

                <div>
                    {errorElements}
                </div>
                {
                    open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"예약하시겠습니까?"} />
                }
                {
                    payopen && <ModalComponent handleSubmit={handlePay} handleOpenClose={handleOpenCloseReserve} message={"예약이 완료되었습니다. 카카오페이로 결제하시겠습니까?"} />
                }
                <div className="container container-top" style={{ height: '200px', marginTop: '60px' }}>
                    <div className="panel panel-top font-color-white" >
                        <div className="container-flex">
                            <h1 className="font-family-bold">숙소 검색</h1>
                        </div>
                      
                    </div>
                </div>
                <div className="container container-content background-color-white">
                    <label htmlFor="area-select">지역:</label>

                    <select onChange={e => setAreaCode(e.target.value)}>
                        {areas.map(area => (
                            <option key={area.code} value={area.code}>
                                {area.name}
                            </option>
                        ))}
                    </select>
                    {testRooms.map(room => (//testRooms는 테스터용
                      <InfoComponent room={room} loading={loading}/>
                    ))}

                </div>
                {testRooms.length > 0 && (
                    <Pagination
                        itemCount={testRooms.length}
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

const InfoComponent = ({ room, loading,handleOpenClose }) => {

    if (loading) {
        return <div>숙소 정보를 불러오는 중 입니다. 잠시만 기다려주세요...</div>;
    }
    return (
        <table className="table-list-card">
            <tbody>
                <tr key={room.contentid}>
                    <td>
                        <Link to={`/rooms/searchDetail/${room.contentid}`}>
                            <h3>{room.title}</h3>
                        </Link>
                    </td>
                    <td>주소: {room.addr1}</td>
                    <td>전화번호: {room.tel}</td>
                    <td>
                        <Link to={`/rooms/searchDetail/${room.contentid}`}>
                            <img src={room.firstimage} alt={room.title} />
                        </Link>
                    </td>

                </tr>
            </tbody>
        </table>


    )

}
