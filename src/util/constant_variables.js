import React, { Component } from "react";

export default class Constant{
    static serviceURL="http://localhost:8088"; //서비스 주소

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
}