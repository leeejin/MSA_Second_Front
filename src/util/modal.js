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
    
<></>

        )
    }

}