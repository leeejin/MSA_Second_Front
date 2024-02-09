import { useNavigate } from 'react-router-dom';

//결제 페이지
const PayCheck = ({ depAirPort, arrAirPort }) => {
    const navigate = useNavigate();
    
    const handlePay=()=>{
        console.log("결제를 해요");
    }
    return (
        <div className="container">
            <h3>결제창은 나중에 해야할듯 결제되면 마이페이지에 결제내역 보여주는 창으로 갈까요 ? 이런거도 넣고 그쪽으로 이동시키는게 좋을듯</h3>
            <div>
                <button onClick={handlePay}>결제</button>
                <button onClick={() => { navigate(-1) }}>취소</button>
            </div>
        </div>
    )
}

export default PayCheck;