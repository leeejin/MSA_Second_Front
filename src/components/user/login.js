import React, { useState, useReducer, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import Constant from '../../util/constant_variables';
import styled from "styled-components";
import axios from 'axios';
const Hr = styled.hr`
    margin-top:50px;
    border:1px solid var(--grey-color);
`;

/* 회색 버튼 스타일*/
const SubButton = styled.span`
    float:right;
    color: darkgrey;
    &:hover {
        cursor: pointer;
    }
`;
/** 에러메시지 (이메일,비밀번호, 로그인성공여부) */
const ERROR_STATE = {
    emailError: false,
    passwordError: false,
    successError: false
}
const reducer = (state, action) => {
    switch (action.type) {
        case 'emailError':
            return { ...state, emailError: true }
        case 'passwordError':
            return { ...state, passwordError: true }
        case 'successError':
            return { ...state, successError: true }
        default:
            return ERROR_STATE

    }
}
export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지
    const [info, setInfo] = useState({ //회원가입 정보 저장
        email: '',
        password: '',
    });
    // /** 쿠키 관련 선언 */
    // const [cookies, setCookie, removeCookie] = useCookies(['remmemberUserId']);  //쿠키 이름
    // const [isRemember, setIsRemember] = useState(false);
    // useEffect(() => {
    //     if (cookies.remmemberUserId !== undefined) {
    //         setInfo((prev) => ({
    //             ...prev,
    //             email: cookies.remmemberUserId
    //         }));
    //         setIsRemember(true);
    //     }
    // }, [])
    // const handleOnChange = (e) => {
    //     setIsRemember(e.target.checked);
    //     if (!e.target.checked) removeCookie("remmemberUserId");
    // }
    /** Info 변화 */
    const handleChangeInfo = (infoType, e) => {
        setInfo((prev) => ({
            ...prev,
            [infoType]: e.target.value
        }));
    }
    const submit = async (e) => {
        e.preventDefault();
        let errors = {
            emailError: info.email === '',
            passwordError: info.password === '',
        };
        if (!errors.emailError && !errors.passwordError) {
            callLoginAPI().then((response) => {
                console.log("로그인 성공 Id=", response);
                dispatch({ type: "Login", data: { userId: parseInt(response.data.userId), name: response.data.name } }); //리덕스에 로그인 정보 업데이트
                const token = response.headers['authorization'];
                window.localStorage.setItem('authToken', token);
                axios.defaults.headers.common['Authorization'] = token;
                // 아이디 저장이 체크되어 있으면 쿠키에 아이디 저장
                // if (isRemember) {
                //     setCookie('remmemberUserId', info.email);
                // }
                window.location.href = '/';
            }).catch(() => {
                errorDispatch({ type: 'successError', successError: errors.successError }); // 로그인 실패 시 loginError 상태를 true로 설정
                setTimeout(() => {
                    // 로그인 실패 시 loginError 상태를 true로 설정
                    errorDispatch({ type: 'error' });
                }, 1000);
            });
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
        }
        const response = await axios.post(Constant.serviceURL + `/users/login`, formData, { withCredentials: true });
        return response;
    }
    return (
        <>
            {
                errorMessage.emailError && <h3 className="white-wrap message">아이디를 입력해주세요.</h3>
            }
            {
                errorMessage.passwordError && <h3 className="white-wrap message">비밀번호를 입력해주세요.</h3>
            }
            {
                errorMessage.successError && <h3 className="white-wrap message">로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.</h3>
            }
            <div className="background background-color" />


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
                            {/* <input
                                type="checkbox"
                                id="saveId"
                                name="saveId"
                                onChange={(e) => { handleOnChange(e) }}
                                checked={isRemember}
                            /><label htmlFor="saveId">아이디 저장</label> */}

                            <SubButton onClick={() => { navigate('/Signup') }}>
                                회원가입 하기
                            </SubButton>

                            <button className="btn btn-style-execute" type="submit">로그인</button> {/* 버튼 타입을 submit으로 변경 */}
                            <Hr />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}