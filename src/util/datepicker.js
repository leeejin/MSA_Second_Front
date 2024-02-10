import React from 'react';
import DatePicker from 'react-datepicker';
import ko from 'date-fns/locale/ko';
import dayjs from 'dayjs';
import "react-datepicker/dist/react-datepicker.css";

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

    const decreaseMonth = () => {
        // 이전 달로 이동하는 로직 작성
    };

    const increaseMonth = () => {
        // 다음 달로 이동하는 로직 작성
    };

    return (
        <div style={{ display: 'flex' }}>
            <DatePicker
                className="datepicker" //input style class
               // withPortal //모바일 버전으로 바꿔줌
                shouldCloseOnSelect //시간선택하면 닫아짐
                // showTimeSelect //시간도 선택할 수 있게 함
                // timeCaption="시간" //시간 Caption
                locale={ko} //한국어
                selectsRange={false} //Date 범위 설정 (편도니까 false)
                selected={depTime} //선택하는 날짜
                dateFormat="yyyy-MM-dd aa h:mm" //데이터 타입 ex) 2024-02-09 오전 8:00
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
                            type='button'
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                        >
                            prev
                            {/* 여기 prev지우고 Icon 삽입 */}
                        </button>
                        <div className="year-month">
                            <h3>{YEARS}년 {MONTHS[date.getMonth()]}</h3>
                        </div>
                        <button
                            type='button'
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                        >
                            next
                            {/* 여기 next지우고 Icon 삽입 */}
                        </button>
                    </div>
                )}
            />
        </div>

    );
}