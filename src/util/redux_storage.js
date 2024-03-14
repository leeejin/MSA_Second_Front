import { legacy_createStore as createStore } from "redux";

const loginState = {
    userId: parseInt(sessionStorage.getItem("userId")) || 0,
    name: sessionStorage.getItem("name") || "",
    username: localStorage.getItem("username") || "",
    isRemember: localStorage.getItem("isRemember")||false,
};

function reducer(state = loginState, action) {
    console.log("리덕스에서의 값들 = ", loginState);
    switch (action.type) {
        case "Login":
            sessionStorage.setItem("userId", action.data.userId);
            sessionStorage.setItem("name", action.data.name);
            localStorage.setItem("username", action.data.username);
            localStorage.setItem("isRemember", action.data.isRemember);
            return { ...state, userId: action.data.userId, name: action.data.name, username: action.data.username, isRemember: action.data.isRemember };
        case "Logout":
            sessionStorage.setItem("userId", 0);
            sessionStorage.setItem("name", "");
            if (state.isRemember===false) {
                localStorage.setItem("username", "");
                return { ...state, userId: 0, name: "", username: "" };
            } else {
                return { ...state, userId: 0, name: "" };
            }
        default:
            return { ...state };
    }
}

const persistedState = loginState;
const store = createStore(reducer, persistedState);

export default store;