import React, { useState } from 'react';
import PayList from './mypage_part/paidlist';
import AccommodationList from './mypage_part/accommodationlist';
const MyPage=()=> {
  
    const [subBoxVisible, setSubBoxVisible] = useState({ accommodationList: false, payList: true });


    const handleLocation = (selectedMenu) => {
        if (selectedMenu === 'payList') {
            setSubBoxVisible({ accommodationList: false, payList: true});
        } else if (selectedMenu === 'accommodationList') {
            setSubBoxVisible({ accommodationList: true, payList: false});
        }
    }

    return (
        <div>
            <div className="fixed menubar-sub">
                <div
                    className={`d-flex menubar-sub-content font-family-semibold ${subBoxVisible.payList && "menubar-sub-selected"}`}
                    onClick={() => handleLocation('payList')}
                >
                    결제목록
                </div>
                <div
                    className={`d-flex menubar-sub-content font-family-semibold ${subBoxVisible.accommodationList && "menubar-sub-selected"}`}
                    onClick={() => handleLocation('accommodationList')}
                >
                    숙박목록
                </div>
            </div>
            <div className="container-backbox-100">
                <h3 className="container-title">마이페이지</h3>
                <div>
                    {
                        subBoxVisible.payList === true ? <PayList  /> : <AccommodationList  />
                    }
                </div>
            </div>
        </div>

    )
}
export default MyPage;