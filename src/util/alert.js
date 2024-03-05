import React, { useMemo } from 'react';
import { BsExclamationCircle } from "react-icons/bs";
export const ERROR_STATE = {
    'loginemailError': { active: false, message: '이메일을 입력해주세요' },
    'loginpasswordError': { active: false, message: '비밀번호를 입력해주세요' },
    'successError': { active: false, message: '아이디가 존재하지 않거나 비밀번호가 일치하지 않습니다.' },
    'emailError': { active: false, message: '이메일은 영대소문자, 숫자 포함해야합니다.' },
    'nameError': { active: false, message: '이름은 2~5자 이내여야합니다.' },
    'nicknameError': { active: false, message: '닉네임은 2~5자 이내여야합니다.' },
    'passwordError': { active: false, message: '비밀번호는 8~25자 이내의 영대소문자, 숫자, 특수문자 하나 이상 포함해야 합니다.' },
    'confirmPasswordError': { active: false, message: '비밀번호가 다릅니다.' },
    'duplicateError': { active: false, message: '다른 사용자가 있습니다. 다른 이메일로 바꿔주세요' },
    'cancelError': { active: false, message: '환불실패하였습니다' },
    'cancelSuccess': { active: false, message: '환불완료되었습니다' },
    'listError': { active: false, message: '목록을 불러오는데 실패하였습니다' },
    'depError': { active: false, message: '출발지를 입력해주세요' },
    'arrError': { active: false, message: '도착지를 입력해주세요' },
    'locationError': { active: false, message: '좌석을 선택해주세요' },
    'levelError': { active: false, message: '출발지와 도착지가 같습니다' },
    'dateError': { active: false, message: '날짜를 선택해주세요' },
    'searchError': { active: false, message: '조회 실패하였습니다' },
    'loginError': { active: false, message: '로그인이 필요한 서비스입니다' },
    'seatError': { active: false, message: '해당 항공편이 존재하지 않습니다' },
    'paySuccess': { active: false, message: '결제가 완료되었습니다! 결제목록 카테고리로 가면 확인할 수 있습니다' },
    'payError': { active: false, message: '결제실패하였습니다' },
    'reservecancelSuccess': { active: false, message: '예약취소 성공하였습니다' },
    'reservecancelError': { active: false, message: '예약취소 실패하였습니다' },
    'reserveError': { active: false, message: '이미 예약하신 항공편입니다' },
    'accommodationError': { active: false, message: '지역을 선택해주세요' }
};

export function reducer(state, action) {
    if (Object.keys(ERROR_STATE).includes(action.type)) {
        return { ...state, [action.type]: { ...state[action.type], active: true } };
    }
    return ERROR_STATE;
}

export function Alert({ errorMessage }) {
    const errorElements = useMemo(() => {
        return Object.keys(errorMessage)
            .filter(key => errorMessage[key].active)
            .map(key => (
                <h3 className="modal white-wrap message" key={key}>
                    <BsExclamationCircle className="exclamation-mark" /> 
                    {errorMessage[key].message}
                </h3>
            ));
    }, [errorMessage]);

    return <div>{errorElements}</div>;
}