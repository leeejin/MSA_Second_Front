import { legacy_createStore as createStore } from "redux";

const loginState = {
  userId: parseInt(localStorage.getItem("userId")) || 0,
  name: localStorage.getItem("name") || "",
  username:localStorage.getItem("username")|| "",
};

function reducer(state = loginState, action) {
  console.log("리덕스에서의 값들 = ", loginState);
  switch (action.type) {
    case "Login":
      localStorage.setItem("userId", action.data.userId);
      localStorage.setItem("name", action.data.name);
      localStorage.setItem("username", action.data.username);
      return { ...state, userId: action.data.userId, name: action.data.name,username:action.data.username };
    case "Logout":
      localStorage.setItem("userId", 0);
      localStorage.setItem("name", "");
      localStorage.setItem("username", "");
      return { ...state, userId: 0, name: "",username:"" };
    default:
      return { ...state };
  }
}

const persistedState = loginState;
const store = createStore(reducer, persistedState);

export default store;