import React, { useState, useRef, useEffect, useReducer } from 'react';
import styled from "styled-components";
import { ModalComponent, ConfirmComponent } from '../../util/custom/modal';
import Constant from '../../util/constant_variables';
import axios from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { reducer, ERROR_STATE, Alert } from '../../util/custom/alert';
import { useMutation } from 'react-query';
/**이메일 스타일 */
const Flex = styled.div`
  display: inline-flex;
  width: 100%;
`;
const Signup = () => {
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
    const [errorMessage, errorDispatch] = useReducer(reducer, ERROR_STATE); //모든 에러메시지


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
    const handleError = (errorType, hasError) => {
        errorDispatch({ type: errorType, [errorType]: hasError });

        setTimeout(() => {
            errorDispatch({ type: 'error' });
        }, 2000);
    }
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
                handleError('nameError', errors.nameError);
            } else if (errors.nicknameError) {
                handleError('nicknameError', errors.nicknameError);
            } else if (errors.emailError) {
                handleError('emailError', errors.emailError);
            } else if (errors.passwordError) {
                handleError('passwordError', errors.passwordError);
            } else if (errors.confirmPasswordError) {
                handleError('confirmPasswordError', errors.confirmPasswordError);
            }
        }

    }
    //API가기 전에 체크
    const handleSubmit = () => {
        mutation.mutate({ info, select });
        setOpen(false);
    }
    const show = () => {
        setShowOptions((prev) => !prev);
    };
    // 회원가입가기전에 체크 
    const handleLocation = () => {
        navigate('/Login');
    };
    const mutation = useMutation(callAddUserAPI, {
        onSuccess: (data) => {
            console.log('addUser', data);
           
            setSubOpen(true);
        },
        onError: (error) => {
            console.log(error);
            handleError('duplicateError', true);
           
        }
    });
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
            const response = await axios.post(Constant.serviceURL + '/users/register', formData);
            console.log('서버 응답:', response.data);
            return response.data;
        } catch (error) {
            console.error('오류 발생:', error);
            handleError('duplicateError', true);
            setOpen(false);
        }
    }
    return (
        <div className="container">
            {
                open && <ModalComponent handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"회원가입 하시겠습니까?"} />
            }
            {
                subOpen && <ConfirmComponent handleSubmit={handleLocation} handleOpenClose={handleOpenClose} message={"회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 가시겠습니까?"} />
            }
            <Alert errorMessage={errorMessage} />
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
                                        {emailMenus.map((email) => (
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

export default Signup;