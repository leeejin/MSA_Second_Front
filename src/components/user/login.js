import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import Constant from '../../util/constant_variables';
import styled from "styled-components";
import MyStorage from '../../util/redux_storage';
import axios from 'axios';

/* 회색 버튼 스타일*/
const SubButton = styled.span`
    float:right;
    color: darkgrey;
    &:hover {
        cursor: pointer;
    }
`;
/** 동작하는 버튼 스타일 */
const HandleButton = styled.button`
    border-radius: 15px;
    border: none;
    margin-top: 10%;
    padding: 15px;
    color: var(--button-color);
    background-color: var(--grey-color);
    &:hover {
        cursor: pointer;
        background-color: #c4c4c4;
    }
}
`;
export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [errorMessage, setErrorMessage] = useState({ email: false, password: false });
    const [loginError, setLoginError] = useState(false); // 로그인 실패 여부 추가
    const submit = async (e) => {
        e.preventDefault();
        let errors = {
            emailError: email === '',
            passwordError: password === '',
        };
        if (!errors.emailError && !errors.passwordError) {
            callLoginAPI().then((response) => {
                console.log("로그인 성공 Id=", response);
                dispatch({ type: "Login", data: { userId: parseInt(response.data.userId), nickname: response.data.nickname } }); //리덕스에 로그인 정보 업데이트
                navigate("/"); //마지막에 '/'경로로 이동

            }).catch((error) => {
                console.log(error);
                setErrorMessage({ email: errors.emailError, password: errors.passwordError });
                setLoginError(true);// 로그인 실패 시 loginError 상태를 true로 설정

                setTimeout(() => {
                    setLoginError(false);// 로그인 실패 시 loginError 상태를 true로 설정
                    setErrorMessage({ email: false, password: false });
                }, 1000);

            });
        } else {
            if (errors.emailError) {
                setErrorMessage({ email: errors.emailError });
            } else if (errors.passwordError) {
                setErrorMessage({ password: errors.passwordError });
            }
            setTimeout(() => {
                setErrorMessage({ email: false, password: false });
            }, 1000);
        }
    }

    async function callLoginAPI() {
        //백엔드로 보낼 로그인 데이터
        const formData = {
            username: email,
            password: password
        }
        const response = await axios.post(Constant.serviceURL + `/login`, formData, { withCredentials: true });
        return response;
    }

    return (
        <>
            <div className="background" />
            <div className='backBox'>

                <div className='innerBox'>
                    <h3 className='componentTitle'>로그인</h3>
                    <div className="subBox">
                        <p>아이디</p>
                        <input
                            type="email"
                            onChange={(e) => { setEmail(e.target.value) }}
                            autoFocus
                        />
                        {
                            errorMessage.email && <h3 className="white-wrap">아이디를 제대로 입력해주세요.</h3>
                        }
                        <p>비밀번호</p>
                        <input
                            type="password"
                            onChange={(e) => { setPassword(e.target.value) }}
                        />
                        {
                            errorMessage.password && <h3 className="white-wrap">비밀번호를 제대로 입력해주세요.</h3>
                        }

                        {
                            loginError && <h3 className="white-wrap">로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.</h3>
                        }

                        <SubButton onClick={() => { navigate('/Signup') }}>
                            회원가입 하기
                        </SubButton>

                        <HandleButton onClick={(e) => submit(e)}>로그인</HandleButton>
                    </div>
                </div>
            </div>
            
        </>

    );
}