import React, { useState, useReducer, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import Constant from '../../util/constant_variables';
import styled from "styled-components";
import axios from '../../axiosInstance';
import reducer from '../../util/reducers';
import { BsExclamationCircle } from "react-icons/bs";
const Hr = styled.hr`
    margin-top:50px;
    border:1px solid var(--grey-color);
`;

/** 에러메시지 (출발지-도착지, 날짜) */
const EMAIL_ERROR = 'emailError';
const PASSWORD_ERROR = 'passwordError';
const SUCCESS_ERROR = 'successError';
/** 에러메시지 (이메일,비밀번호, 로그인성공여부) */
const ERROR_STATE = {
    [EMAIL_ERROR]: false,
    [PASSWORD_ERROR]: false,
    [SUCCESS_ERROR]: false,
}

const errorMapping = {
    [EMAIL_ERROR]: '이메일을 입력해주세요',
    [PASSWORD_ERROR]: '비밀번호를 입력해주세요',
    [SUCCESS_ERROR]: '로그인 실패했습니다 다시한번 시도해주세요',
};

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
    const [info, setInfo] = useState({ //회원가입 정보 저장
        email: localStorage.getItem("username"),
        password: '',
    });

    const [isRemember, setIsRemember] = useState(false); //기억할지 안할지
    useEffect(() => {
        // 컴포넌트가 마운트될 때 로컬 스토리지에서 값을 가져와서 상태를 설정합니다.
        const savedIsRemember = localStorage.getItem("isRemember");
        if (savedIsRemember !== null) {
            setIsRemember(JSON.parse(savedIsRemember));
        }
    }, [])
    const handleOnChange = (e) => {
        setIsRemember(e.target.checked);

    }
    /** Info 변화 */
    const handleChangeInfo = (infoType, e) => {
        setInfo((prev) => ({
            ...prev,
            [infoType]: e.target.value
        }));
    }
    const errorElements = useMemo(() => {
        return Object.keys(errorMapping).map((key) => {
            if (errorMessage[key]) {
                return (
                    <h3 className="modal white-wrap message" key={key}>
                        <BsExclamationCircle className="exclamation-mark" /> {errorMapping[key]}
                    </h3>
                );
            }
            return null;
        });
    }, [errorMessage]);
    const submit = async (e) => {
        e.preventDefault();
        let errors = {
            emailError: info.email === '',
            passwordError: info.password === '',
        };
        if (!errors.emailError && !errors.passwordError) {
            callLoginAPI().then((response) => {
                console.log("로그인 성공 Id=", response);
                dispatch({ type: "Login", data: { userId: parseInt(response.data.userId), name: response.data.name, username: response.data.username, isRemember: isRemember } }); //리덕스에 로그인 정보 업데이트
                const token = response.headers['authorization'];
                window.sessionStorage.setItem('authToken', token);
                axios.defaults.headers.common['Authorization'] = token;

                navigate('/');
            }).catch(() => {
                errorDispatch({ type: 'successError', successError: true }); // 로그인 실패 시 loginError 상태를 true로 설정
                setTimeout(() => {
                    // 로그인 실패 시 loginError 상태를 true로 설정
                    errorDispatch({ type: 'error' });
                }, 1000);
            })
        } else {
            if (errors.emailError) {
                errorDispatch({ type: 'emailError', emailError: errors.emailError });
            } else if (errors.passwordError) {
                errorDispatch({ type: 'passwordError', passwordError: errors.passwordError });
            }
            setTimeout(() => {
                errorDispatch({ type: 'error' });
            }, 1000);
        }
    }
    async function callLoginAPI() {
        //백엔드로 보낼 로그인 데이터
        const formData = {
            username: info.email,
            password: info.password
        };

        const response = await axios.post(Constant.serviceURL + `/users/login`, formData, { withCredentials: true });
        return response;

    }

    return (
        <>
            <div>{errorElements}</div>
            <div className="fixed container-fixed background-color" />
            <div className="container container-backbox-450 background-color-white">
                <div className="background-color-white">
                    <form onSubmit={(e) => submit(e)}> {/* form 태그로 감싸주고, onSubmit 이벤트 핸들러에 submit 함수 연결 */}
                        <div className="container-innerBox">
                            <h3 className="container-title">로그인</h3>

                            <p>아이디</p>
                            <input
                                type="email"
                                defaultValue={info.email}
                                onChange={(e) => handleChangeInfo('email', e)}
                                autoFocus
                            />

                            <p>비밀번호</p>
                            <input
                                type="password"
                                onChange={(e) => handleChangeInfo('password', e)}
                            />
                        </div>
                        <div style={{ width: '70%', margin: 'auto' }}>
                            <input
                                type="checkbox"
                                id="saveId"
                                name="saveId"
                                onChange={(e) => { handleOnChange(e) }}
                                checked={isRemember}
                            /><label htmlFor="saveId">아이디 저장</label>

                            <span className="btn-span-style-grey" onClick={() => { navigate('/Signup') }}>
                                회원가입 하기
                            </span>

                            <button className="btn btn-style-execute" type="submit">로그인</button> {/* 버튼 타입을 submit으로 변경 */}
                            <Hr />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}