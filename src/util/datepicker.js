import React from 'react';
import DatePicker from 'react-datepicker';
import ko from 'date-fns/locale/ko';
import dayjs from 'dayjs';
import "react-datepicker/dist/react-datepicker.css";
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
        <div style={{ display: 'flex' }}>
            <DatePicker
                className="datepicker" //input style class
                showIcon
                placeholderText='날짜를 선택하세요'
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 48 48"
                    >
                        <mask id="ipSApplication0">
                            <g fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth="4">
                                <path strokeLinecap="round" d="M40.04 22v20h-32V22"></path>
                                <path
                                    fill="#fff"
                                    d="M5.842 13.777C4.312 17.737 7.263 22 11.51 22c3.314 0 6.019-2.686 6.019-6a6 6 0 0 0 6 6h1.018a6 6 0 0 0 6-6c0 3.314 2.706 6 6.02 6c4.248 0 7.201-4.265 5.67-8.228L39.234 6H8.845l-3.003 7.777Z"
                                ></path>
                            </g>
                        </mask>
                        <path
                            fill="currentColor"
                            d="M0 0h48v48H0z"
                            mask="url(#ipSApplication0)"
                        ></path>
                    </svg>
                }
                shouldCloseOnSelect //시간선택하면 닫아짐
                // showTimeSelect //시간도 선택할 수 있게 함
                // timeCaption="시간" //시간 Caption
                locale={ko} //한국어
                selectsRange={false} //Date 범위 설정 (편도니까 false)
                selected={depTime} //선택하는 날짜
                dateFormat="yyyy년MM월dd일" //데이터 타입 ex) 2024년02월09일
                minDate={minDate} //선택할 수 있는 최소 날짜
                maxDate={maxDate} //선택할 수 있는 최대 날짜
                onChange={(date) => handleDateChange(date)} //선택하는 날짜가 바뀌면
                timeIntervals={60 * 4} //나타나는 시간 여기서는 4시간마다 하나씩 나타남
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
        </div>

    );
}