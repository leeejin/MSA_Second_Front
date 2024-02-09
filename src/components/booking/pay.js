

const PayCheck = ({ depAirPort, arrAirPort }) => {

    return (
        <div className="container">
            <h3>결제창 아직 데이터가 뭐 없어서 디자인만해야할것같습니다</h3>
            <p>{depAirPort}</p>
            <p>{arrAirPort}</p>
            <div>
                <button >결제</button>
                <button>취소</button>
            </div>
        </div>
    )
}