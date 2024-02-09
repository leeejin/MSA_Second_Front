import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import Constant from '../../util/constant_variables';
import MyStorage from '../../util/redux_storage';
import axios from 'axios';

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [loginError, setLoginError] = useState(false); // 로그인 실패 여부 추가
    console.log("변경")
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
                setLoginError(true);// 로그인 실패 시 loginError 상태를 true로 설정
            });
        } else {
            setEmailError(errors.emailError);
            setPasswordError(errors.passwordError);
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
        <div className="container">
            <div>
                <input
                    type="email"
                    onChange={(e) => { setEmail(e.target.value) }}
                />
                {
                    emailError && <p>이메일을 제대로 입력해주세요.</p>
                }
                <input
                    type="password"
                    onChange={(e) => { setPassword(e.target.value) }}
                />
                {
                    passwordError && <p>비밀번호를 제대로 입력해주세요.</p>
                }
                {loginError && <p className="danger-color">로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.</p>}
                <button variant="contained" sx={{ mt: 2 }} onClick={(e) => submit(e)}>로그인</button>
            </div>

            <p>
                <span>계정이 없으신가요? </span>
                <button href="/Signup">회원가입</button>
            </p>
        </div>
    );
}