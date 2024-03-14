import React, { useState, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import Constant from '../../../util/constant_variables';
import Spinner from '../../../styles/image/loading.gif';
import { reducer, ERROR_STATE, Alert } from '../../../util/custom/alert';
import Area from '../../../util/json/지역코드.json';
import { useSelector } from 'react-redux';
const Button = styled.button`
    color: ${props => props.clicked ? 'var(--hovering-color)' : 'initial'};
    border:1px solid var(--grey-color);
    border-radius:15px;
    padding:0px 10px 0px 10px;
    margin:5px;
    font-size:1.0rem;
    &:hover,
    &:active {
        color:var(--hovering-color);
    }

    @media screen and (max-width: 768px) { // 조절할 화면 크기에 맞춰 수정
        font-size: 0.8rem; // 화면이 작아질 때 버튼의 글꼴 크기를 줄입니다.
        padding: 0px 8px 0px 8px; // 화면이 작아질 때 버튼의 padding을 줄입니다.
    }
`;
const Button2 = styled.button`
    color: ${props => props.clicked ? 'var(--hovering-color)' : 'initial'};
    border:1px solid var(--grey-color);
    border-radius:15px;
    padding:0px 10px 0px 10px;
    margin:5px;
    font-size:1.0rem;
    &:hover,
    &:active {
        color:var(--hovering-color);
    }

    @media screen and (max-width: 768px) { // 조절할 화면 크기에 맞춰 수정
        font-size: 0.8rem; // 화면이 작아질 때 버튼의 글꼴 크기를 줄입니다.
        padding: 0px 1px 0px 2px; // 화면이 작아질 때 버튼의 padding을 줄입니다.
    }
`;

const areas = Area.response.body.items.item;
/** top2 component */
const Top2Component = () => {
    const navigate = useNavigate();
    const [areaCode, setAreaCode] = useState("선택"); //기본 지역코드를 -1로 설정
    const [sigunguCode, setSigunguCode] = useState("선택"); //기본 시군구코드를 -1로 설정
    const [cities, setCities] = useState([]);
    const [clicked, setClicked] = useState({ area: "선택", city: "선택" });
    const [loading, setLoading] = useState(false);
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
    const userId = useSelector((state) => state.userId);
    const handleSearch = () => {
        setLoading(true);
        if (userId <= 0) {
            handleError('loginError', true);
        } else {
            if (clicked.area === "선택") {
                handleError('accommodationAreaError', true);
            } else if (clicked.city === "선택") {
                handleError('accommodationSigunguError', true);
            }
            else {

                navigate(`/Reserve`, {
                    state: {
                        code: areaCode,
                        sigunguCode: sigunguCode,
                        cities: cities,
                    }
                });

            }
        }
        setLoading(false);

    };
    const handleError = (errorType, hasError) => {
        errorDispatch({ type: errorType, [errorType]: hasError });

        setTimeout(() => {
            errorDispatch({ type: 'error' });
        }, 2000);
    }
    const handleOnChangeSelectValue = (e, key) => {
        const cityCode = Constant.getCityCode(e.target.value);
        setAreaCode(e.target.value);
        setCities(cityCode);
        setClicked((prev) => ({
            ...prev,
            area: key
        }));

    };
    const handleOnChangeSelect2Value = (e, key) => {
        setSigunguCode(e.target.value);
        setClicked((prev) => ({
            ...prev,
            city: key
        }));
    };
    return (
        <div className="container container-top" >
            <Alert errorMessage={errorMessage} />
            <div className="panel panel-top background-color-white">
                <div style={{ marginTop: '100px' }}>
                    <div className='parent-container'>
                        {
                            loading ? <div className="fixed d-flex container-fixed">
                                <img src={Spinner} alt="로딩" width="100px" />
                            </div> : <>
                                <table>
                                    <thead>
                                        <tr>
                                            <td>
                                                <h3>대분류</h3>
                                            </td></tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                {areas.map((area) => (
                                                    <Button
                                                        className="btn"
                                                        clicked={clicked.area === area.code}
                                                        key={area.code}
                                                        value={area.code}
                                                        onClick={(e) => handleOnChangeSelectValue(e, area.code)}>
                                                        {area.name}
                                                    </Button>
                                                ))}

                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <table>
                                    <thead>
                                        <tr>
                                            <td>
                                                <h3>소분류</h3>
                                            </td></tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                {cities.map((cities) => (
                                                    <Button2
                                                        className="btn"
                                                        clicked={clicked.city === cities.code}
                                                        key={cities.code}
                                                        value={cities.code}
                                                        onClick={(e) => handleOnChangeSelect2Value(e, cities.code)}>
                                                        {cities.name}
                                                    </Button2>
                                                ))}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </>
                        }
                    </div>
                </div>
                <div className="second-container" style={{ clear: 'both' }}>
                    <button className="btn btn-style-border" onClick={handleSearch} >검색하기</button>
                </div>

            </div>
        </div >
    );
}


export default Top2Component;