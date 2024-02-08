import React, { useState, useEffect } from 'react';
import { Button, Box, TextField, Container } from '@mui/material';
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

    const submit = async (e) => {
        e.preventDefault();
        let errors = {
            emailError: email === '',
            passwordError: password === '',
        };
        if (!emailError && !passwordError) {
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
            email: email,
            password: password
        }
        const response = await axios.post(Constant.serviceURL + `/login`, formData, { withCredentials: true });
        return response;
    }

    return (
        <Container maxWidth="sm">
            <Box
                component="form"
                className="component-column"
                sx={{ '& .MuiTextField-root': { mb: 2 }, marginTop: '50%' }}
                noValidate
                autoComplete="off"
            >
                <TextField
                    id="outlined-required"
                    label="이메일"
                    size="small"
                    error={emailError}
                    helperText={emailError && '이메일을 제대로 입력해주세요.'}
                    onChange={(e) => { setEmail(e.target.value) }}
                />
                <TextField
                    id="outlined-required"
                    size="small"
                    label="비밀번호"
                    type="password"
                    error={passwordError}
                    helperText={passwordError && '비밀번호를 제대로 입력해주세요.'}
                    onChange={(e) => { setPassword(e.target.value) }}
                />
                {loginError && <p className="danger-color">로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.</p>}
                <Button variant="contained" sx={{ mt: 2 }} onClick={(e) => submit(e)}>로그인</Button>
            </Box>

            <p>
                <span>계정이 없으신가요? </span>
                <Button href="/Signup">회원가입</Button>
            </p>
        </Container>
    );
}