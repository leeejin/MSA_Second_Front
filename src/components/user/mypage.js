import React, { useState } from 'react';
import { useNavigate, NavLink } from "react-router-dom";
import store from '../../util/redux_storage';
import PayList from './paidlist';
import AccommodationList from './accommodationlist';
export default function MyPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(store.getState().userId); //리덕스에 있는 userId를 가져옴
    const [nickname, setNickname] = useState(store.getState().nickname); //리덕스에 있는 nickname를 가져옴
    const [subBoxVisible, setSubBoxVisible] = useState({ accommodationList: false, payList: true });


    const handleLocation = (selectedMenu) => {
        if (selectedMenu === 'payList') {
            setSubBoxVisible({ accommodationList: false, payList: true });
        } else if (selectedMenu === 'accommodationList') {
            setSubBoxVisible({ accommodationList: true, payList: false });
        }
    }

    return (
        <div>
            <div className="menubar-sub">
                <NavLink
                    className={`container-column menubar-sub-content font-family-semibold ${subBoxVisible.payList && "menubar-sub-selected" }`}
                    onClick={() => handleLocation('payList')}
                >
                    결제목록
                </NavLink>

                <NavLink
                    className={`container-column menubar-sub-content font-family-semibold ${subBoxVisible.accommodationList && "menubar-sub-selected" }`}
                    onClick={() => handleLocation('accommodationList')}
                >
                    숙박목록
                </NavLink>
            </div>
            <div className="container-backbox-100">
                <h3 className="container-title">마이페이지</h3>
                <div>
                    {
                        subBoxVisible.payList === true ? <PayList userId={userId}/> : <AccommodationList userId={userId}/>
                    }
                </div>
            </div>
        </div>

    )
}