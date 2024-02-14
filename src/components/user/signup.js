import React, { useState, useRef } from 'react';
import styled from "styled-components";
import ModalComponent from '../../util/modal';
import Constant from '../../util/constant_variables';
import axios from 'axios';
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
/**이메일 스타일 */
const Flex = styled.div`
    display:inline-flex;
    width:100%;

`;
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

    const [errorMessage, setErrorMessage] = useState({ email: false, name: false, nickname: false, password: false, confirmPassword: false, });
    const [disabled, setDisabled] = useState(true); // 버튼의 초기 상태는 비활성화(disabled)로 설정합니다.
    const [DuplicateCheck, setDuplicateCheck] = useState(false);

    const handleOpenClose = () => {
        //에러 모음 + 유효성 검사
        const errors = {
            emailError: !email.match(/^[a-zA-Z0-9]{4,12}$/),
            nameError: name.length < 2 || name.length > 5,
            nicknameError: nickname.length < 2 || nickname.length > 5,
            passwordError: !password.match(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/),
            confirmPasswordError: password !== confirmPassword
        };

        if (!errors.emailError && !errors.nameError && !errors.nicknameError && !errors.passwordError && !errors.confirmPasswordError) {
            setDisabled(false); // 버튼을 활성화(disabled 해제)합니다.
            setOpen(!open); //모두 알맞는 형식을 지켰으면 회원가입 모달창 켜기

        } else {
            setDisabled(true); // 버튼을 비활성화(disabled)합니다.
            //안되면 에러뜨게 함
            if (errors.nameError) {
                setErrorMessage({ name: errors.nameError });
            } else if (errors.nicknameError) {
                setErrorMessage({ nickname: errors.nicknameError });
            } else if (errors.emailError) {
                setErrorMessage({ email: errors.emailError });
            } else if (errors.passwordError) {
                setErrorMessage({ password: errors.passwordError });
            } else if (errors.confirmPasswordError) {
                setErrorMessage({ confirmPassword: errors.confirmPasswordError });
            }
            setTimeout(() => {
                setErrorMessage({ email: false, name: false, nickname: false, password: false, confirmPassword: false, });
            }, 1500);
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

            setTimeout(() => {
                setDuplicateCheck(false);
            }, 1000);
        })
    }
    //회원가입 하는 API
    async function callAddUserAPI() {
        //회원가입할때 보낼 데이터
        const formData = {
            username: email + '@' + select,
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
            setTimeout(() => {
                setDuplicateCheck(false);
            }, 1000);
        }
    }
    return (
        <div className="container">
            {
                open && <ModalComponent subOpen={subOpen} handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"회원가입 하시겠습니까?"} />
            }
            <div className='background' />
                <div className='backBox'>
                    <div className='innerBox'>
                        <h3 className='componentTitle'>회원가입</h3>
                        <div className="subBox">
                            <p>이름</p>
                            <input
                                placeholder="이름"
                                onChange={(e) => { setName(e.target.value) }}
                                autoFocus
                            />
                            {
                                errorMessage.name && <h3 className="white-wrap">이름은 2~5자 이내여야합니다. </h3>
                            }


                            <p>닉네임</p>
                            <input
                                placeholder="닉네임"
                                onChange={(e) => { setNickname(e.target.value) }}
                            />
                            {
                                errorMessage.nickname && <h3 className="white-wrap">닉네임은 2~5자 이내여야합니다. </h3>
                            }
                            <p>이메일</p>
                            <Flex>
                                <input
                                    placeholder='이메일'
                                    onChange={(e) => { setEmail(e.target.value) }}
                                />
                                <p>@</p>
                                <select
                                    value={select}
                                    onChange={(e) => { setSelect(e.target.value) }}
                                >
                                    {emailMenus.map((email, i) => (
                                        <option key={i} value={email.value}>
                                            {email.value}
                                        </option>
                                    ))}
                                </select>
                            </Flex>

                            {
                                errorMessage.email && <h3 className="white-wrap">이메일은 영대소문자, 숫자 포함해야합니다.</h3>
                            }
                            <p>비밀번호</p>
                            <input
                                placeholder="비밀번호"
                                type="password"
                                onChange={(e) => { setPassword(e.target.value) }}
                            />
                            {
                                errorMessage.password && <h3 className="white-wrap">비밀번호는 8~25자 이내의 영대소문자, 숫자, 특수문자 하나 이상 포함해야 합니다.</h3>
                            }
                            <p>비밀번호 확인</p>
                            <input
                                placeholder="비밀번호 확인"
                                type="password"
                                onChange={(e) => { setConfirmPassword(e.target.value) }}
                            />
                            {
                                errorMessage.confirmPassword && <p className="white-wrap">비밀번호 확인해주세요.</p>
                            }
                            {
                                DuplicateCheck === true && <h3 className="white-wrap">다른 사용자가 있습니다. 다른 이메일로 바꿔주세요</h3>
                            }
                            <HandleButton onClick={handleOpenClose}>회원가입</HandleButton>

                        </div>
                    </div>
                </div>
        </div>
    )
}