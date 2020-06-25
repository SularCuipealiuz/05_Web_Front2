import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
export default new Vuex.Store({
    state: {
        member: null,
        activeNav: '',
        lang: '',
        exchangeSkin:'night',
        loginTimes: null,
        webSocket: null,
        kLineHistory: []
    },
    mutations: {
        NAVIGATE(state, nav) {
            state.activeNav = nav;
        },
        SET_MEMBER(state, member) {
            state.member = member;
            localStorage.setItem('MEMBER', JSON.stringify(member));
        },
        RECOVERY_MEMBER(state) {
            state.member = JSON.parse(localStorage.getItem('MEMBER'));
        },
        SET_LANG(state, lang) {
            state.lang = lang;
            localStorage.setItem('LANGUAGE', JSON.stringify(lang));
        },
        INIT_LANG(state) {
            if (localStorage.getItem('LANGUAGE') == null) {
                state.lang = "简体中文";
            } else {
                state.lang = JSON.parse(localStorage.getItem('LANGUAGE'));
            }
        },
        INIT_LOGIN_TIMES(state){
            if(localStorage.getItem("LOGINTIMES") == null){
                state.loginTimes = 0;
            }else{
                state.loginTimes = JSON.parse(localStorage.getItem('LOGINTIMES'));
            }
        },
        SET_LOGIN_TIMES(state, times){
            state.loginTimes = times;
            localStorage.setItem('LOGINTIMES', JSON.stringify(times));
        },
        SET_SKIN(state,skin){
            state.exchangeSkin=skin;
        },
        SET_WEBSOCKET(state, ws) {
            state.webSocket = ws;
        },
        SET_KLINE_HISTORY(state, array) {
            state.kLineHistory = array
        }
    },
    actions: {
      setKlineHistory({commit}, payload) {
          commit("SET_KLINE_HISTORY", payload)
      }

    },
    getters: {
        member(state) {
            return state.member;
        },
        isLogin(state) {
            return state.member != null;
        },
        lang(state) {
            return state.lang;
        },
        loginTimes(state) {
            return state.loginTimes;
        },
        getWebSocket(state) {
            return state.webSocket
        },
        getKlineHistory(state) {
            return state.kLineHistory
        }
    }
});
