import React, { Component } from "react";
import JeJu from '../styles/image/main_pic.jpg'; //감귤 이미지
import Busan from '../styles/image/busan.jpg'; //부산 이미지
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
            { key: 0, value: "제주", title: "이번 겨울", subTitle: "감성 여행을 감행하다 ", content: "사방으로 펼쳐진 바다, 산과 들, 하늘까지 푸르름으로 가득찬 성 '제주'", imageUrl: JeJu },
            { key: 0, value: "부산", title: "이번 겨울", subTitle: "개쌉 애Zㅣ는 여행 ", content: "바다 많은 '부산'", imageUrl: Busan },
        ];
    }

}