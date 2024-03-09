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
const Top2Component=()=> {
    const navigate = useNavigate();
    const [areaCode, setAreaCode] = useState(-1); //기본 지역코드를 -1로 설정
    const [clicked, setClicked] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
    const handleSearch = () => {
        if (areaCode === -1) {
            handleError('accommodationError', true);
        } else {
            setLoading(true);
            navigate(`/Reserve`, {
                state: {
                    code: areaCode
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
    return (
        <div className="container container-top" >
            <Alert errorMessage={errorMessage} />
            <div className="panel panel-top background-color-white">
                <div style={{ marginTop: '100px' }}>
                    {
                        loading ? <div className="fixed d-flex container-fixed">
                            <img src={Spinner} alt="로딩" width="100px" />
                        </div> : <>
                            <h2>국내</h2>
                            <SelectComponent
                                clicked={clicked}
                                handleOnChangeSelectValue={handleOnChangeSelectValue} />
                        </>
                    }

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
export default Top2Component;