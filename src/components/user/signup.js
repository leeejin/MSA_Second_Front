import React, { useState, useRef } from 'react';
import ModalComponent from '../../util/modal';
import Constant from '../../util/constant_variables';
import axios from 'axios';

export default function Signup() {
    const emailMenus = Constant.getEmailMenus();

    const [open, setOpen] = useState(false);
    const [subOpen, setSubOpen] = useState(false);

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [select, setSelect] = useState(emailMenus[0].value); // 선택된 이메일 드롭리스트

    const [emailError, setEmailError] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [nicknameError, setNicknameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);
    const [DuplicateCheck, setDuplicateCheck] = useState(false);
    console.log("변경")
    const handleOpenClose = () => {
        //에러 모음 + 유효성 검사
        const errors = {
            emailError: email === '' || !email.match(/^[a-zA-Z0-9]{4,12}$/),
            nameError: name === '' || name.length < 2 || name.length > 5,
            nicknameError: nickname === '' || nickname.length < 2 || nickname.length > 5,
            passwordError: password === '' || !password.match(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/),
            confirmPasswordError: confirmPassword === '' || password !== confirmPassword
        };

        if (!errors.emailError && !errors.nameError && !errors.nicknameError && !errors.passwordError && !errors.confirmPasswordError) {
            setOpen(!open); //모두 알맞는 형식을 지켰으면 회원가입 모달창 켜기
        } else {
            //안되면 에러뜨게 함
            setConfirmPasswordError(errors.confirmPasswordError);
            setEmailError(errors.emailError);
            setNameError(errors.nameError);
            setNicknameError(errors.nicknameError);
            setPasswordError(errors.passwordError);
        }

    }
    //API가기 전에 체크
    const handleSubmit = () => {
        callAddUserAPI().then((response) => { //백엔드로부터 무사히 response를 받았다면
            console.log('addUser', response);
            setSubOpen(!subOpen) //회원가입성공하면 로그인페이지로 가게함 modal.js에 있음

        }).catch(() => {
            setDuplicateCheck(true);
            setOpen(false);
        })
    }
    //회원가입 하는 API
    async function callAddUserAPI() {
        //회원가입할때 보낼 데이터
        const formData = {
            email: email + '@' + select,
            name: name,
            nickname: nickname,
            password: password
        };
        try {
            const response = await axios.post(Constant.serviceURL + '/users/register', formData, { withCredentials: true });
            console.log('서버 응답:', response.data);
            return response.data;
        } catch (error) {
            console.error('오류 발생:', error);
            setDuplicateCheck(true);
            setOpen(false);
        }
    }
    return (
        <div>
           
        </div>
    )
}