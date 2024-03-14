import React, { useState, useReducer, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import PublicInfo from './detail_part/detail_publicinfo';
import IntroduceInfo from './detail_part/detail_introduceinfo';
import RoomInfo from './detail_part/detail_roominfo';
import { ModalComponent } from '../../util/custom/modal';
import { IoCall } from "react-icons/io5";
import { reducer, ERROR_STATE, Alert } from '../../util/custom/alert';
import axios from '../../axiosInstance';
import Constant from '../../util/constant_variables';
import { useSelector } from 'react-redux';
import Datepicker from '../../util/custom/datepicker';
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
    const { contents } = location.state ?? {}; //페이지 로드될때 백으로 보낼 데이터
    const [subBoxVisible, setSubBoxVisible] = useState({ publicinfo: true, introduceinfo: false, roominfo: false, etcimageinfo: false }); //공통정보, 소개정보, 객실정보, 추가이미지

    /** 메뉴 선택 */
    const handleLocation = (selectedMenu) => {
        setSubBoxVisible({
            publicinfo: selectedMenu === 'publicinfo',
            introduceinfo: selectedMenu === 'introduceinfo',
            roominfo: selectedMenu === 'roominfo',
        });
    }
    if (!location.state) {
        return (<Navigate to="*" />)
    } else {
        return (
            <div className="container">
               
                <div className="container-top" style={{ height: '220px', marginTop: '60px' }}>
                    <div className="panel panel-top font-color-white" >
                        <h2 className="font-family-bold">{contents.title}</h2>
                        <p>{contents.addr1}</p>
                        <p><IoCall /> {contents.tel}</p>
                        

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
                    subBoxVisible.publicinfo && <PublicInfo contentid={contents.contentid} />
                }
                {
                    subBoxVisible.introduceinfo && <IntroduceInfo contentid={contents.contentid} />
                }
                {
                    subBoxVisible.roominfo && <RoomInfo contentid={contents.contentid} />
                }

            </div>
        )
    }
};


export default DetailReserve;