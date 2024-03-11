/*지역 이미지*/
import Jeju from '../styles/image/jeju.jpg'; //제주 이미지
import Busan from '../styles/image/busan.jpg'; //부산 이미지
import Daejeon from '../styles/image/daejeon.jpg'; //대전 이미지
import Gwangju from '../styles/image/gwangju.jpg'; //광주 이미지

/*항공사 로고 이미지*/
import Jin from '../styles/airline_logo/jinair.png'; // 진에어
import Tway from '../styles/airline_logo/tway.png'; // 대한항공
import A_jeju from '../styles/airline_logo/jejuair.png'; // 제주항공
import Estar from '../styles/airline_logo/estarjet.png'; // 이스타
import Korean from '../styles/airline_logo/koreanair.png'; // 대한항공
import Aerok from '../styles/airline_logo/aerok.png'; // 에어로케이
import Asiana from '../styles/airline_logo/asiana.png'; // 아시아나
import A_busan from '../styles/airline_logo/airbusan.png'; // 에어부산
import A_seoul from '../styles/airline_logo/airseoul.png'; // 에어서울

import AirPort from './json/airport-list.json';

/** 전국 8도 지역코드 */
import SeoulJSON from './json/서울 시군구.json';
import InCheonJSON from './json/인천 시군구.json';
import DaeJeonJSON from './json/대전 시군구.json';
import DaeGuJSON from './json/대구 시군구.json';
import GwangJuJSON from './json/광주 시군구.json';
import BusanJSON from './json/부산 시군구.json';
import UlSanJSON from './json/울산 시군구.json';
import SeJongJSON from './json/세종특별자치시 시군구.json';
import GyeongGiJSON from './json/경기도 시군구.json';
import GangWonJSON from './json/강원특별자치도 시군구.json';
import ChungCheongBukJSON from './json/충청북도 시군구.json';
import ChungCheongNamJSON from './json/충청남도 시군구.json';
import GyeongSangBukJSON from './json/경상북도 시군구.json';
import GyeongSangNamJSON from './json/경상남도 시군구.json';
import JeolLaBukJSON from './json/전북특별자치도 시군구.json';
import JeolLaNamJSON from './json/전라남도 시군구.json';
import JeJuJSON from './json/제주도 시군구.json';
const airport = AirPort.response.body.items.item; // 공항 목록

const seoulCityCode = SeoulJSON.response.body.items.item;
const incheonCityCode = InCheonJSON.response.body.items.item;
const deojeonCityCode = DaeJeonJSON.response.body.items.item;
const daeguCityCode = DaeGuJSON.response.body.items.item;
const gwangjuCityCode = GwangJuJSON.response.body.items.item;
const busanCityCode = BusanJSON.response.body.items.item;
const ulsanCityCode = UlSanJSON.response.body.items.item;
const sejongCityCode = SeJongJSON.response.body.items.item;
const gyeonggiCityCode = GyeongGiJSON.response.body.items.item;
const gangwonCityCode = GangWonJSON.response.body.items.item;
const chungcheongbukCityCode = ChungCheongBukJSON.response.body.items.item;
const chungcheongnamCityCode = ChungCheongNamJSON.response.body.items.item;
const gyeongsangbukCityCode = GyeongSangBukJSON.response.body.items.item;
const gyeongsangnamCityCode = GyeongSangNamJSON.response.body.items.item;
const jeollabukCityCode = JeolLaBukJSON.response.body.items.item;
const jeollanamCityCode = JeolLaNamJSON.response.body.items.item;
const jejuCityCode = JeJuJSON.response.body.items.item;
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
    static getSwiperMenus() {
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
    static getRegionList() {
        return [
            { key: 1, value: '서울'},
            { key: 2, value: '인천'},
            { key: 3, value: '대전'},
            { key: 4, value: '대구' },
            { key: 5, value: '광주' },
            { key: 6, value: '부산' },
            { key: 7, value: '울산' },
            { key: 8, value: '세종' },
            { key: 31, value: '경기도'},
            { key: 32, value: '강원도' },
            { key: 33, value: '충청북도' },
            { key: 34, value: '충청남도'},
            { key: 35, value: '경상북도'},
            { key: 36, value: '경상남도' },
            { key: 37, value: '전라북도'},
            { key: 38, value: '전라남도' },
            { key: 39, value: '제주도' },
        ];
    }
    static getCostMenus() { //좌석등급
        return [
            { key: 0, value: 0, name: "높은순" },
            { key: 1, value: 1, name: "낮은순" },

        ];
    }
    static getCityCode(areaCode){
        switch(areaCode){
            case 1:
                return seoulCityCode;
            case 2:
                return incheonCityCode;
            case 3:
                return deojeonCityCode;
            case 4:
                return daeguCityCode;
            case 5:
                return gwangjuCityCode;
            case 6:
                return busanCityCode;
            case 7:
                return ulsanCityCode;
            case 8:
                return sejongCityCode;
            case 31:
                return gyeonggiCityCode;
            case 32:
                return gangwonCityCode;
            case 33:
                return chungcheongbukCityCode;
            case 34:
                return chungcheongnamCityCode;
            case 35:
                return gyeongsangbukCityCode;
            case 36:
                return gyeongsangnamCityCode;
            case 37:
                return jeollabukCityCode;
            case 38:
                return jeollanamCityCode;
            case 39:
                return jejuCityCode;
        }
    }
    static getCityValuebyCode(area,city){
        const matchedAirport = area.find((item) => item.code === city);
        return matchedAirport ? matchedAirport.name : null;
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
    static handleDateFormatISOChange = (date) => {
        date.setHours(date.getHours() + 9); // KST는 UTC보다 9시간 빠르므로
        const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, '');
    
        return formattedDate;
    };
    static handleDateCalculate(arrPlandTime, depPlandTime) {
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
    /** 해당 Nm를 가진 공항 객체를 찾아 id로 변환 */
    static getSelectedAirport = (selectedAirportNm) => {
        const selectedAirport = airport.find(
            (airport) => airport.airportNm === selectedAirportNm
        );
        if (selectedAirport) {
            return selectedAirport.airportId;
        }
    }
    /** 출발지, 도착지 Nm -> Id로 변경 */
    static getAirportIdByName = (airportNm) => {
        const matchedAirport = airport.find((item) => item.airportNm === airportNm);
        return matchedAirport ? matchedAirport.airportId : null;
    };
     /** 출발지, 도착지 Id -> Nm로 변경 */
    static getAirportNmById = (airportId) => {
        const matchedAirport = airport.find((item) => item.airportId === airportId);
        return matchedAirport ? matchedAirport.airportNm : null;
    };
    /**로고 이미지 찾기 */
    static getAirlineLogo = (logos,airLine) => {
        const matchingLogo = logos.find((logo) => logo.value === airLine);
        return matchingLogo ? matchingLogo.imageUrl : '';
    };
    static getAccommodationCodeByValue = (areas,value) => {
        const matchingareas = areas.find((areas) => areas.value === value);
        return matchingareas ? matchingareas.key : "";
    };
    static getAccommodationValueByCode = (areas,key) => {
        const matchingareas = areas.find((areas) => areas.key === key);
        return matchingareas ? matchingareas.value : "";
    };
}