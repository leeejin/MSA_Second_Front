import React, { useState, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import Constant from '../../../util/constant_variables';
import Spinner from '../../../styles/image/loading.gif';
import { reducer, ERROR_STATE, Alert } from '../../../util/custom/alert';
const Button = styled.button`
    color: ${props => props.clicked ? 'var(--hovering-color)' : 'initial'};
    &:hover,
    &:active {
        color:var(--hovering-color);
    }
`;
const Button2 = styled.button`
    color: ${props => props.clicked ? 'var(--hovering-color)' : 'initial'};
    &:hover,
    &:active {
        color:var(--hovering-color);
    }
`;
const areas = Constant.getRegionList();
/** top2 component */
const Top2Component = () => {
    const navigate = useNavigate();
    const [areaCode, setAreaCode] = useState(-1); //기본 지역코드를 -1로 설정
    const [sigunguCode, setSigunguCode] = useState(-1); //기본 시군구코드를 -1로 설정
    const [cities, setCities] = useState([]);
    const [clicked, setClicked] = useState({ area: -1, city: "-1" });
    const [loading, setLoading] = useState(false);
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
    const handleSearch = () => {
        if (clicked.area === -1) {
            handleError('accommodationAreaError', true);
        } else if (clicked.city === "-1") {
            handleError('accommodationSigunguError', true);
        }
        else {
            setLoading(true);
            navigate(`/Reserve`, {
                state: {
                    code: areaCode,
                    sigunguCode: sigunguCode,
                    cities:cities,
                }
            });
            setLoading(false);
        }

    };
    const handleError = (errorType, hasError) => {
        errorDispatch({ type: errorType, [errorType]: hasError });

        setTimeout(() => {
            errorDispatch({ type: 'error' });
        }, 2000);
    }
    const handleOnChangeSelectValue = (e, key) => {
        const value = Constant.getAccommodationCodeByValue(areas, e.target.value);
        const cityCode = Constant.getCityCode(value);
        setAreaCode(value);
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
                                    <tbody>
                                        <tr>
                                            <td>
                                                {areas.map((area) => (
                                                    <Button
                                                        className="btn"
                                                        clicked={clicked.area === area.key}
                                                        key={area.key}
                                                        value={area.value}
                                                        onClick={(e) => handleOnChangeSelectValue(e, area.key)}>
                                                        {area.value}
                                                    </Button>
                                                ))}

                                            </td>
                                        </tr>
                                    </tbody>

                                </table>
                                <table>
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