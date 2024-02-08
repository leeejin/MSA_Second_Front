import React, { Component } from 'react';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #1976d2',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
};
export default class ModalComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messageConfirm: false,
        }
    }
    handleConfirm = () => {
        this.setState({ messageConfirm: true }, () => {
            if (this.state.messageConfirm) {
                this.props.handleSubmit();
            }
        });
    }
    render() {
        return (
            <div>
                <div
                    open={this.props.open}
                    onClose={this.props.handleOpenClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <div>
                        <div>
                            {this.props.message}
                        </div>
                        <div id="modal-modal-description" sx={{ mt: 2, textAlign: 'center' }}>
                            <button onClick={this.handleConfirm}>예</button>
                            <button sx={{ color: 'gray' }} onClick={this.props.handleOpenClose}>아니오</button>
                        </div>
                        {
                            this.props.subOpen === true && <div>
                                <p>
                                    회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 가시겠습니까?
                                </p>
                                <p>
                                    <button onClick={() => { window.location.href = "/" }}>예</button>
                                </p>

                            </div>
                        }

                    </div>
                </div>
            </div>



        )
    }

}