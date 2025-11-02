import router from "./router.js";

const store = new Vuex.Store({
  state: {
    // like data
    auth_token: null,
    role: null,
    loggedIn: false,
    user_id: null,
    role_hash: null,
  },
  mutations: {
    // functions that change state
    setUser(state) {
      try {
        if (JSON.parse(localStorage.getItem("user"))) {
          const user = JSON.parse(localStorage.getItem("user"));
          state.auth_token = user.token;
          state.role = user.role;
          state.loggedIn = true;
          state.user_id = user.id;
          state.role_hash = user.role_hash;
        }
      } catch {
        alert("Not logged in");
      }
    },
    logout(state) {
      state.auth_token = null;
      state.role = null;
      state.loggedIn = false;
      state.user_id = null;
      state.role_hash = null;

      localStorage.removeItem("user");
      router.push("/login");
    },
  },
  actions: {
    // actions commit mutations but can be async
  },
});

store.commit("setUser");

export default store;
