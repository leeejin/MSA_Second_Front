import React, { useState, useRef, useEffect, useReducer, useMemo } from 'react';
import styled from "styled-components";
import ModalComponent from '../../util/modal';
import Constant from '../../util/constant_variables';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BsExclamationCircle } from "react-icons/bs";
import reducer from '../../util/reducers';
/**이메일 스타일 */
const Flex = styled.div`
  display: inline-flex;
  width: 100%;
`;
/** 에러메시지 (출발지-도착지, 날짜) */
const EMAIL_ERROR = 'emailError';
const NAME_ERROR = 'nameError';
const NICKNAME_ERROR = 'nicknameError';
const PASSWORD_ERROR = 'passwordError';
const CONFIRMPASSWORD_ERROR = 'confirmPasswordError';
const DUPLICATE_ERROR = 'duplicateError';

const ERROR_STATE = {
    [EMAIL_ERROR]: false,
    [NAME_ERROR]: false,
    [NICKNAME_ERROR]: false,
    [PASSWORD_ERROR]: false,
    [CONFIRMPASSWORD_ERROR]: false,
    [DUPLICATE_ERROR]: false
};

const errorMapping = {
    [NAME_ERROR]: '이름은 2~5자 이내여야합니다.',
    [NICKNAME_ERROR]: '닉네임은 2~5자 이내여야합니다.',
    [EMAIL_ERROR]: '이메일은 영대소문자, 숫자 포함해야합니다.',
    [PASSWORD_ERROR]: '비밀번호는 8~25자 이내의 영대소문자, 숫자, 특수문자 하나 이상 포함해야 합니다.',
    [CONFIRMPASSWORD_ERROR]: '비밀번호가 다릅니다.',
    [DUPLICATE_ERROR]: '다른 사용자가 있습니다. 다른 이메일로 바꿔주세요',
};


export default function Signup() {
    const navigate = useNavigate();
    const emailMenus = Constant.getEmailMenus();

    const [open, setOpen] = useState(false);
    const [subOpen, setSubOpen] = useState(false);

    const [info, setInfo] = useState({ //회원가입 정보 저장
        email: '',
        name: '',
        nickname: '',
        password: '',
        confirmPassword: '',
    });
    const [select, setSelect] = useState(emailMenus[0].value); // 선택된 이메일 드롭리스트
    const [errorMessage, dispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지


    /** 셀렉트 전용 */
    const [isShowOptions, setShowOptions] = useState(false);
    const selectBoxRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (selectBoxRef.current && !selectBoxRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const handleOnChangeSelectValue = (e) => {
        setSelect(e.target.getAttribute("value"));
    };
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
    }, [errorMessage, errorMapping]);
    /** 모달 창 뜨기전에 검사 */
    const handleOpenClose = () => {
        //에러 모음 + 유효성 검사
        const errors = {
            emailError: !info.email.match(/^[a-zA-Z0-9]{4,12}$/),
            nameError: info.name.length < 2 || info.name.length > 5,
            nicknameError: info.nickname.length < 2 || info.nickname.length > 5,
            passwordError: !info.password.match(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/),
            confirmPasswordError: info.password !== info.confirmPassword
        };

        if (!errors.emailError && !errors.nameError && !errors.nicknameError && !errors.passwordError && !errors.confirmPasswordError) {
            setOpen(!open); //모두 알맞는 형식을 지켰으면 회원가입 모달창 켜기
            setSubOpen(false);

        } else {
            //안되면 에러뜨게 함
            if (errors.nameError) {
                dispatch({ type: 'nameError', nameError: errors.nameError });
            } else if (errors.nicknameError) {
                dispatch({ type: 'nicknameError', nicknameError: errors.nicknameError });
            } else if (errors.emailError) {
                dispatch({ type: 'emailError', emailError: errors.emailError });
            } else if (errors.passwordError) {
                dispatch({ type: 'passwordError', passwordError: errors.passwordError });
            } else if (errors.confirmPasswordError) {
                dispatch({ type: 'confirmError', confirmError: errors.confirmError });
            }
            setTimeout(() => {
                dispatch({ type: 'error' });
            }, 1500);
        }

    }
    //API가기 전에 체크
    const handleSubmit = () => {
        setSubOpen(true);
    }
    const show = () => {
        setShowOptions((prev) => !prev);
    };
    // 회원가입가기전에 체크 
    const handleSignup = () => {
        callAddUserAPI().then((response) => { //백엔드로부터 무사히 response를 받았다면
            console.log('addUser', response);
            setSubOpen(!subOpen) //회원가입성공하면 로그인페이지로 가게함 modal.js에 
            navigate('/Login');

        }).catch((error) => {
            console.log(error)
            dispatch({ type: 'duplicateError', duplicateError: true });
            setOpen(false);

            setTimeout(() => {
                dispatch({ type: 'duplicateError', duplicateError: false });
            }, 1000);
        })
    }
    //회원가입 하는 API
    async function callAddUserAPI() {
        //회원가입할때 보낼 데이터
        const formData = {
            username: `${info.email}@${select}`,
            name: info.name,
            nickname: info.nickname,
            password: info.password
        };
        try {
            const response = await axios.post(Constant.serviceURL + '/users/register', formData, { withCredentials: true });
            console.log('서버 응답:', response.data);
            return response.data;
        } catch (error) {
            console.error('오류 발생:', error);
            dispatch({ type: 'duplicateError', duplicateError: true });
            setOpen(false);

            setTimeout(() => {
                dispatch({ type: 'duplicateError', duplicateError: false });
            }, 1000);
        }
    }
    return (
        <div className="container">
            {
                open && <ModalComponent subOpen={subOpen} handleSignup={handleSignup} handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"회원가입 하시겠습니까?"} />
            }
            <div>{errorElements}</div>
            <div className="fixed container-fixed background-color" />
            <div className="container-backbox-450 background-color-white">
                <div className="background-color-white">

                    <div className="container-innerBox">
                        <h3 className="container-title">회원가입</h3>
                        <p>이름</p>
                        <input
                            placeholder="이름"
                            onChange={(e) => handleChangeInfo('name', e)}
                            autoFocus
                        />
                        <p>닉네임</p>
                        <input
                            placeholder="닉네임"
                            onChange={(e) => handleChangeInfo('nickname', e)}
                        />

                        <p>이메일</p>
                        <Flex>
                            <input
                                placeholder='이메일'
                                onChange={(e) => handleChangeInfo('email', e)}
                            />
                            <p>@</p>
                            <div
                                ref={selectBoxRef}
                                className={`select select-email ${isShowOptions && 'active'}`}
                                onClick={show}
                            >
                                <label>{select}</label>
                                {isShowOptions && (
                                    <ul className="select-option select-option-email">
                                        {emailMenus.map((email, i) => (
                                            <li
                                                className="option"
                                                onClick={(e) => handleOnChangeSelectValue(e)}
                                                key={email.key}
                                                value={email.value}
                                            >
                                                {email.value}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Flex>

                        <p>비밀번호</p>
                        <input
                            placeholder="비밀번호"
                            type="password"
                            onChange={(e) => handleChangeInfo('password', e)}
                        />

                        <p>비밀번호 확인</p>
                        <input
                            placeholder="비밀번호 확인"
                            type="password"
                            onChange={(e) => handleChangeInfo('confirmPassword', e)}
                        />

                        <button className="btn btn-style-execute" onClick={handleOpenClose}>회원가입</button>

                    </div>
                </div>
            </div>
        </div>
    )
}