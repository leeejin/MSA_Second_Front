import React from 'react';
import DatePicker from 'react-datepicker';
import ko from 'date-fns/locale/ko';
import dayjs from 'dayjs';
import "react-datepicker/dist/react-datepicker.css";
import { LuCalendar } from "react-icons/lu";
import { IoArrowRedoSharp } from "react-icons/io5";
import { IoArrowUndoSharp } from "react-icons/io5";
export default function Datepicker({ depTime, handleDateChange }) {
    const minDate = new Date(dayjs().add(1, 'day'));
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

    return (
      
            <DatePicker
                className="datepicker" //input style class
                showIcon
                placeholderText='날짜'
                icon={<LuCalendar style={{fontSize:"1.6rem",padding:0}}/>}
                shouldCloseOnSelect //시간선택하면 닫아짐
                locale={ko} //한국어
                selectsRange={false} //Date 범위 설정 (편도니까 false)
                selected={depTime} //선택하는 날짜
                dateFormat="yyyy년MM월dd일" //데이터 타입 ex) 2024년02월09일
                minDate={minDate} //선택할 수 있는 최소 날짜
                maxDate={maxDate} //선택할 수 있는 최대 날짜
                onChange={(date) => handleDateChange(date)} //선택하는 날짜가 바뀌면
                //dayClassName={(d) => (d.getDate() === startDate.getDate() ? 'selectedDay' : 'unselectedDay')} //선택한 날짜에 대한 style class 바꾸는 건데 해결 못함
                renderCustomHeader={({ //헤더 스타일 바꿈
                    date,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                }) => (
                    <div className="customHeaderContainer">
                        <button
                          className="doButton"
                           
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}>
                            <IoArrowUndoSharp
                                className="doButton"
                            />
                        </button>
                        <div className="year-month">
                            <h3>{YEARS}년 {MONTHS[date.getMonth()]}</h3>
                        </div>
                        <button
                           className="doButton"
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}>
                            <IoArrowRedoSharp
                             
                            />
                        </button>

                    </div>
                )}
            />
      

    );
}