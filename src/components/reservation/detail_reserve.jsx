import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PublicInfo from './detail_part/detail_publicinfo';
import IntroduceInfo from './detail_part/detail_introduceinfo';
import RoomInfo from './detail_part/detail_roominfo';
import ETCImageInfo from './detail_part/detail_etcimage';
/** 예약확인 목록 페이지 */
const DetailReserve=()=> {
    const location = useLocation();
    const { contents } = location.state ?? {};
    const [subBoxVisible, setSubBoxVisible] = useState({ publicinfo: true, introduceinfo: false, roominfo: false, etcimageinfo: false }); //공통정보, 소개정보, 객실정보, 추가이미지

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
            <div className="container" style={{ textAlign: 'center' }}>
                <div className="container-top" style={{ height: '200px', marginTop: '60px' }}>
                    <div className="panel panel-top font-color-white" >
                        <div>
                            <h1 className="font-family-bold">숙소 검색</h1>
                        </div>
                    </div>
                </div>
                <div>
                    <div
                        className={`d-flex font-family-semibold ${subBoxVisible.publicinfo && "menubar-sub-selected"}`}
                        onClick={() => handleLocation('publicinfo')}
                    >
                        공통정보
                    </div>
                    <div
                        className={`d-flex  font-family-semibold ${subBoxVisible.introduceinfo && "menubar-sub-selected"}`}
                        onClick={() => handleLocation('introduceinfo')}
                    >
                        소개정보
                    </div>
                    <div
                        className={`d-flex font-family-semibold ${subBoxVisible.roominfo && "menubar-sub-selected"}`}
                        onClick={() => handleLocation('roominfo')}
                    >객실정보
                    </div>
                    <div
                        className={`d-flex  font-family-semibold ${subBoxVisible.etcimageinfo && "menubar-sub-selected"}`}
                        onClick={() => handleLocation('etcimageinfo')}
                    >추가이미지
                    </div>
                </div>

                {
                    subBoxVisible.publicinfo && <PublicInfo contents={contents} />
                }
                {
                    subBoxVisible.introduceinfo && <IntroduceInfo contents={contents} />
                }
                {
                    subBoxVisible.roominfo && <RoomInfo />
                }
                {
                    subBoxVisible.etcimageinfo && <ETCImageInfo />
                }
            </div>
        )
    }

};


export default DetailReserve;