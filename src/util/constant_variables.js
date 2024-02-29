import React from "react";

/*지역 이미지*/
import Jeju from '../styles/image/jeju.jpg'; //제주 이미지
import Busan from '../styles/image/busan.jpg'; //부산 이미지
import Daejeon from '../styles/image/daejeon.jpg'; //대전 이미지
import Gwangju from '../styles/image/gwangju.jpg'; //광주 이미지

/*항공사 로고 이미지*/
import Jin from '../styles/image_logo/jinair.png'; // 진에어
import Tway from '../styles/image_logo/tway.png'; // 대한항공
import A_jeju from '../styles/image_logo/jejuair.png'; // 제주항공
import Estar from '../styles/image_logo/estarjet.png'; // 이스타
import Korean from '../styles/image_logo/koreanair.png'; // 대한항공
import Aerok from '../styles/image_logo/aerok.png'; // 에어로케이
import Asiana from '../styles/image_logo/asiana.png'; // 아시아나
import A_busan from '../styles/image_logo/airbusan.png'; // 에어부산
import A_seoul from '../styles/image_logo/airseoul.png'; // 에어서울
export default class Constant {
    static serviceURL = "http://localhost:8088"; //서비스 주소

    static getEmailMenus() { //회원가입에 사용할 이메일
        return [
            { key: 0, value: "naver.com" },
            { key: 1, value: "gmail.com" },
            { key: 2, value: "nate.com" },
            { key: 3, value: "hanmail.com" },
            { key: 4, value: "aol.com" },
            { key: 5, value: "yahoo.com" },
        ];
    }
    static getSeatLevel() { //좌석등급
        return [
            { key: 0, value: "일반석", name: "일반석" },
            { key: 1, value: "프리스티지석", name: "프리스티지석" },

        ];
    }

    static getSliderMenus() {
        return [
            { key: 0, value: "제주", title: "이번 겨울", subTitle: "제주 여행을 감행하다 ", content: "사방으로 펼쳐진 바다, 산과 들, 하늘까지 푸르름으로 가득찬 성 '제주'", imageUrl: Jeju },
            { key: 1, value: "광주", title: "이번 겨울", subTitle: "광주 여행을 감행하다 ", content: "내일이 빛나는 기회의 도시 빛고을 '광주'", imageUrl: Gwangju },
            { key: 2, value: "부산", title: "이번 겨울", subTitle: "부산 여행을 감행하다 ", content: "다시 태어나도 살고 싶은 그린 스마트 도시 '부산'", imageUrl: Busan },
            { key: 3, value: "대전", title: "이번 겨울", subTitle: "대전 여행을 감행하다 ", content: "대한민국의 중심축 성심당의 도시 '대전'", imageUrl: Daejeon },
        ];
    }
    static getLogos() {
        return [
            { key: 0, value: "진에어", imageUrl: Jin },
            { key: 1, value: "티웨이항공", imageUrl: Tway },
            { key: 2, value: "에어로케이", imageUrl: Aerok },
            { key: 3, value: "이스타항공", imageUrl: Estar },
            { key: 4, value: "대한항공", imageUrl: Korean },
            { key: 5, value: "제주항공", imageUrl: A_jeju },
            { key: 6, value: "아시아나항공", imageUrl: Asiana },
            { key: 7, value: "에어부산", imageUrl: A_busan },
            { key: 8, value: "에어서울", imageUrl: A_seoul },
        ];
    }
    static getCostMenus() { //좌석등급
        return [
            { key: 0, value: 0, name: "높은순" },
            { key: 1, value: 1, name: "낮은순" },

        ];
    }
    static parseDate(date) {
        const arrAirportTime = date.toString();
        const year = arrAirportTime.substr(0, 4);
        const month = arrAirportTime.substr(4, 2);
        const day = arrAirportTime.substr(6, 2);
        const hour = arrAirportTime.substr(8, 2);
        const minute = arrAirportTime.substr(10, 2);
        return { year, month, day, hour, minute };
    }
    
    static handleDateFormatChange(date) {
        const { year, month, day, hour, minute } = this.parseDate(date);
        return `${year}년 ${month}월 ${day}일 ${hour}:${minute}`;
    }
    
    static handleDayFormatChange(date) {
        const { year, month, day } = this.parseDate(date);
        return `${year}년 ${month}월 ${day}일`;
    }
    
    static handleTimeFormatChange(date) {
        const { hour, minute } = this.parseDate(date);
        return `${hour}:${minute}`;
    }
    static getDateTypeChange = (date) => {
        const { year, month, day, hour, minute } = this.parseDate(date);
        const formattedTime = `${year}${month}${day}${hour}${minute}`;
        return Number(formattedTime);

    };
    static handleDateCalculate (arrPlandTime, depPlandTime) {
        // 숫자를 문자열로 변환하고 연, 월, 일, 시, 분을 추출
        const depStr = String(depPlandTime);
        const arrStr = String(arrPlandTime);

        const depDate = new Date(depStr.slice(0, 4), depStr.slice(4, 6) - 1, depStr.slice(6, 8), depStr.slice(8, 10), depStr.slice(10, 12));
        const arrDate = new Date(arrStr.slice(0, 4), arrStr.slice(4, 6) - 1, arrStr.slice(6, 8), arrStr.slice(8, 10), arrStr.slice(10, 12));

        // 두 시간의 차이를 분으로 계산
        const diffMinutes = (arrDate - depDate) / 60000;
        // 분을 일, 시, 분으로 변환
        const days = Math.floor(diffMinutes / (60 * 24)); //일
        const hours = Math.floor((diffMinutes % (60 * 24)) / 60); //시간
        const minutes = Math.floor(diffMinutes % 60); //분

        let result = "";
        if (days > 0) result += days + "일 ";
        if (hours > 0) result += hours + "시간 ";
        if (minutes > 0) result += minutes + "분";

        return result.trim();

    };
}