import { React, Component } from "react";
import styled from "styled-components";
//< 1 2 3 4 > 와 같이 페이지 표시함

const PageContainer=styled.div`
    align-items:center;
    justify-content:center;
    text-align:center;
    width:100%;
`;
export default class Pagenation extends Component {
    constructor(props) {
        super(props);
        this.pages = [];

        this.state = {
            currentPage: 1,
            startPage: 1,
            endPage: this.props.pageCountPerPage
        }
        //console.log('pagenation props = ', this.props)

        this.maxPage = Math.ceil(this.props.itemCount / this.props.itemCountPerPage);

        for (let i = 0; i <= this.maxPage; i++)
            this.pages.push(i);

        //console.log('pages = ', this.pages);

    }

    componentDidMount() {
        if (this.maxPage < this.props.pageCountPerPage)
            this.setState({ endPage: this.maxPage });

    }

    leftPageClicked = () => {
        this.setState({ currentPage: this.state.startPage - 1 }, () => {
            this.setState({ startPage: this.getStartPage(), endPage: this.getStartPage() + this.props.pageCountPerPage - 1 });
            this.props.clickListener(this.state.currentPage);
        });
    }

    rightPageClicked = () => {
        this.setState({ currentPage: this.state.startPage + this.props.pageCountPerPage }, () => {
            this.setState({ startPage: this.state.currentPage, endPage: this.getEndPage() });
            this.props.clickListener(this.state.currentPage);
        });
    }

    pageNumberClicked = (currentPage) => {
        this.setState({ currentPage: currentPage }, () => {
            this.props.clickListener(currentPage);
        });
    }

    getStartPage() {
        if (this.state.startPage - this.props.pageCountPerPage > 1)
            return this.state.startPage - this.props.pageCountPerPage;
        else
            return 1;
    }

    getEndPage() {
        if (this.state.endPage + this.props.pageCountPerPage < this.maxPage)
            return this.state.endPage + this.props.pageCountPerPage;
        else
            return this.maxPage;
    }

    render() {
        return (
            <PageContainer>
                <button className="doButton" onClick={this.leftPageClicked} style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }} disabled={this.state.startPage === 1}>&lt;</button>
                {this.pages.slice(this.state.startPage, this.state.endPage + 1).map((item, i) => <Numbering key={i} page={item} currentPage={this.state.currentPage} clickListener={(page) => this.pageNumberClicked(page)} />)}
                <button className="doButton" onClick={this.rightPageClicked} style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} disabled={this.state.endPage === this.maxPage}>&gt;</button>
            </PageContainer>
        );
    }
}

class Numbering extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <button onClick={() => this.props.clickListener(this.props.page)} className={this.props.page == this.props.currentPage ? 'pagination pagination-selected' : 'pagination pagination-unselected'}>
                <span style={{ fontSize: '18px' }}>{this.props.page}</span>
            </button>
        );
    }
}
