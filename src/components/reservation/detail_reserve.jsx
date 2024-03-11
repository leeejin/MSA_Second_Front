import React, { useState, useReducer } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import PublicInfo from './detail_part/detail_publicinfo';
import IntroduceInfo from './detail_part/detail_introduceinfo';
import RoomInfo from './detail_part/detail_roominfo';
import ModalComponent from '../../util/custom/modal';
import { IoCall } from "react-icons/io5";
import { reducer, ERROR_STATE, Alert } from '../../util/custom/alert';

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
/** 예약확인 목록 페이지 */
const DetailReserve = () => {
    const location = useLocation();
    const { contents } = location.state ?? {};
    const [open, setOpen] = useState(false); //예약 모달창
    const [subBoxVisible, setSubBoxVisible] = useState({ publicinfo: true, introduceinfo: false, roominfo: false, etcimageinfo: false }); //공통정보, 소개정보, 객실정보, 추가이미지
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 
    const handleError = (errorType, hasError) => {
        errorDispatch({ type: errorType, [errorType]: hasError });

        setTimeout(() => {
            errorDispatch({ type: 'error' });
        }, 2000);
    };
    const handleOpenCloseData = ((data) => {
        console.log(data);
        setOpen(prev => !prev);
    });
    /** 모달창 on/off */
    const handleOpenClose = (() => {
        setOpen(prev => !prev);
    });

    /** 예약 확인함수 */
    const handleSubmit = (() => {
        handleError('accommodationReserveSuccess', true);
        setOpen(prev => !prev);
    });
    /** 메뉴 선택 */
    const handleLocation = (selectedMenu) => {
        setSubBoxVisible({
            publicinfo: selectedMenu === 'publicinfo',
            introduceinfo: selectedMenu === 'introduceinfo',
            roominfo: selectedMenu === 'roominfo',
            etcimageinfo: selectedMenu === 'etcimageinfo',
        });
    }

    if (!location.state) {
        return (<Navigate to="*" />)
    }
    else {
        return (
            <div className="container">
                <Alert errorMessage={errorMessage} />
                {
                    open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"숙소예약하시겠습니까?"} />
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
                                <button className="btn btn-style-kakao" onClick={() => handleOpenCloseData(contents)}>
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