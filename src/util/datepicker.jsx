import React from 'react';
import DatePicker from 'react-datepicker';
import ko from 'date-fns/locale/ko';
import dayjs from 'dayjs';
import "react-datepicker/dist/react-datepicker.css";
import { LuCalendar } from "react-icons/lu";
import { MdNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
const minDate = new Date();
const maxDate = new Date(dayjs().add(3, 'month'));
const YEARS = new Date().getFullYear();
const MONTHS = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
];
export default function Datepicker({ depTime, handleDateChange }) {

    return (
        <DatePicker
            className="datepicker" //input style class
            showIcon
            placeholderText='날짜를 선택해주세요'
            icon={<LuCalendar style={{ fontSize: "1.6rem", position: 'absolute', top: -12.5, left: -8.5, zIndex: 5, }} />}
            shouldCloseOnSelect //시간선택하면 닫아짐
            locale={ko} //한국어
            selectsRange={false} //Date 범위 설정 (편도니까 false)
            selected={depTime} //선택하는 날짜
            disabledKeyboardNavigation
            dateFormat="yyyy년MM월dd일" //데이터 타입 ex) 2024년02월09일
            minDate={minDate} //선택할 수 있는 최소 날짜
            maxDate={maxDate} //선택할 수 있는 최대 날짜
            onChange={(date) => handleDateChange(date)} //선택하는 날짜가 바뀌면
            dayClassName={(d) => (d.getDate() === depTime.getDate() ? 'selected' : 'unselected')} //선택한 날짜에 대한 style class 바꾸는 건데 해결 못함 => 해결함
            renderCustomHeader={({ //헤더 스타일 바꿈
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
            }) => (
                <div className="customHeaderContainer">
                    <button
                        className="btn btn-style-none"
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}>
                        <GrFormPrevious
                        />
                    </button>
                    <div className="year-month">
                        <h3>{YEARS}년 {MONTHS[date.getMonth()]}</h3>
                    </div>
                    <button
                        className="btn btn-style-none"
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}>
                        <MdNavigateNext
                        />
                    </button>

                </div>
            )}
        />


    );
}