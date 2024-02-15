import React, { useState, useRef, useEffect } from 'react';
import styled from "styled-components";
import ModalComponent from '../../util/modal';
import Constant from '../../util/constant_variables';
import axios from 'axios';

/**이메일 스타일 */
const Flex = styled.div`
  display: inline-flex;
  width: 100%;
`;
const SelectOptions = styled.ul`
  max-height: ${(props) => (props.show ? "none" : "0")};
`;

export default function Signup() {
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

    const [errorMessage, setErrorMessage] = useState({ email: false, name: false, nickname: false, password: false, confirmPassword: false, }); //에러 메시지
    const [DuplicateCheck, setDuplicateCheck] = useState(false);

    /** 셀렉트 전용 */
    const [isShowOptions, setShowOptions] = useState(false);
    const selectBoxRef = useRef(null);

    const handleOnChangeSelectValue = (e) => {
        setSelect(e.target.getAttribute("value"));
    };
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

        } else {
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
            username: info.email + '@' + select,
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
            setDuplicateCheck(true);
            setOpen(false);
            setTimeout(() => {
                setDuplicateCheck(false);
            }, 1000);
        }
    }
    return (
        <div>
            {
                open && <ModalComponent subOpen={subOpen} handleSubmit={handleSubmit} handleOpenClose={handleOpenClose} message={"회원가입 하시겠습니까?"} />
            }
            {
                errorMessage.name && <h3 className="white-wrap message">이름은 2~5자 이내여야합니다. </h3>
            }
            {
                errorMessage.nickname && <h3 className="white-wrap message">닉네임은 2~5자 이내여야합니다. </h3>
            }
            {
                errorMessage.email && <h3 className="white-wrap message">이메일은 영대소문자, 숫자 포함해야합니다.</h3>
            }
            {
                errorMessage.password && <h3 className="white-wrap message">비밀번호는 8~25자 이내의 영대소문자, 숫자, 특수문자 하나 이상 포함해야 합니다.</h3>
            }
            {
                errorMessage.confirmPassword && <h3 className="white-wrap message">비밀번호가 다릅니다.</h3>
            }
            {
                DuplicateCheck === true && <h3 className="white-wrap message">다른 사용자가 있습니다. 다른 이메일로 바꿔주세요</h3>
            }
            <div className='background' />
            <div className='backBox'>
                <div className='innerBox'>
                    <h3 className='componentTitle'>회원가입</h3>
                    <div className="subBox">
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
                                className={`${isShowOptions ? 'select-box email-style active' : 'select-box email-style'}`}
                                onClick={() => setShowOptions((prev) => !prev)}>
                                <label>{select}</label>
                                <SelectOptions
                                    className="select-option"
                                    show={isShowOptions}>
                                    {emailMenus.map((email, i) => (
                                        <li
                                            className="option"
                                            onClick={(e) => handleOnChangeSelectValue(e)}
                                            key={email.key}
                                            value={email.value}>
                                            {email.value}
                                        </li>
                                    ))}
                                </SelectOptions>
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

                        <button className="handle-button button-style" onClick={handleOpenClose}>회원가입</button>

                    </div>
                </div>
            </div>
        </div>
    )
}