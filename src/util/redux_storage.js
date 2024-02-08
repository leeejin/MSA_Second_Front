import { createStore } from "redux";

const loadState = () => {
    try {
        const serializedState = sessionStorage.getItem("reduxState");
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        sessionStorage.setItem("reduxState", serializedState);
    } catch (err) {
        // Handle errors here
    }
};

const loginState = {
    userId: 0,
    nickname:"",
};

function reducer(state = loginState, action) {
    switch (action.type) {
        case "Login":
            return saveState({
                ...state,
                userId: action.data.userId,
                nickname:action.data.nickname
            });;
        case "Logout":
            return  saveState({
                userId: 0,
                nickname:"",
            });;
        default:
            return state;
    }
}

const persistedState = loadState();

export default createStore(reducer, persistedState);