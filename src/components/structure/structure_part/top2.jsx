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
const areas = Constant.getRegionList();
/** top2 component */
const Top2Component = () => {
    const navigate = useNavigate();
    const [areaCode, setAreaCode] = useState(-1); //기본 지역코드를 -1로 설정
    const [sigunguCode, setSigunguCode] = useState(-1); //기본 시군구코드를 -1로 설정
    const [clicked, setClicked] = useState(-1);
    const [clicked2, setClicked2] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
    const handleSearch = () => {
        if (areaCode === -1) {
            handleError('accommodationAreaError', true);
        } else if(sigunguCode === -1){
            handleError('accommodationSigunguError', true);
        }
        else {
            setLoading(true);
            navigate(`/Reserve`, {
                state: {
                    code: areaCode,
                    sigunguCode: sigunguCode
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
        setAreaCode(value);
        setClicked(key);
    };
    const handleOnChangeSelect2Value = (e, key) => {
        setSigunguCode(e.target.value);
        setClicked2(key);
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
                                                <h2>국내</h2>
                                                <SelectComponent
                                                    clicked={clicked}
                                                    handleOnChangeSelectValue={handleOnChangeSelectValue} />

                                            </td>
                                        </tr>
                                    </tbody>

                                </table>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <SelectSiGunGuComponent
                                                    clicked2={clicked2}
                                                    handleOnChangeSelect2Value={handleOnChangeSelect2Value} />
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
/** 지역 선택 컴포넌트 */
const SelectComponent = ({ handleOnChangeSelectValue, clicked }) => {

    return (
        <>
            {areas.map(area => (
                <Button
                    className="btn"
                    clicked={clicked === area.key}
                    key={area.key}
                    value={area.value}
                    onClick={(e) => handleOnChangeSelectValue(e, area.key)}>
                    {area.value}
                </Button>
            ))}
        </>


    )
}
/** 시군구 선택 컴포넌트 */
const SelectSiGunGuComponent = ({ handleOnChangeSelect2Value, clicked2 }) => {

    return (
        <>
            {areas.map(area => (
                <Button
                    className="btn"
                    clicked={clicked2 === area.key}
                    key={area.key}
                    value={area.value}
                    onClick={(e) => handleOnChangeSelect2Value(e, area.key)}>
                    {area.value}
                </Button>
            ))}
        </>


    )
}
export default Top2Component;