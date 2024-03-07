import React, { useState, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import Constant from '../../util/constant_variables';
import Spinner from '../../styles/image/loading.gif';
import { reducer, ERROR_STATE, Alert } from '../../util/alert';
const Button = styled.button`
    color: ${props => props.clicked === 'true' ? 'var(--hovering-color)' : 'initial'};
    &:hover,
    &:active {
        color:var(--hovering-color);
    }
`;
const areas = Constant.getRegionList();
/** top2 component */
export default function Top2Component() {
    const navigate = useNavigate();
    const [areaCode, setAreaCode] = useState(null); //기본 지역은 서울
    const [clicked, setClicked] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
    const handleSearch = () => {
        if (areaCode === null) {
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
                    clicked={clicked === area.key ? 'true' : 'false'}
                    key={area.key}
                    value={area.value}
                    onClick={(e) => handleOnChangeSelectValue(e, area.key)}>
                    {area.value}
                </Button>
            ))}
        </>


    )
}