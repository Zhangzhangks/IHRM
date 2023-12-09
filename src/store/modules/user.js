import { getToken, setToken, removeToken } from '@/utils/auth'
import { getUserInfo } from '@/api/user'
const state = {
  token: getToken(),
  userInfo: null,
  redirect: '/'
}
const mutations = {
  setToken(state, playload) {
    state.token = playload;
    setToken(playload)
  },
  delToken(state, playload) {
    state.token = playload;
    removeToken(playload)
  },
  setUserInfo(state, playload) {
    state.userInfo = playload;

  },
  setRedirect(state, playload) {
    state.redirect = playload;
  }
}
const actions = {
  login(ctx, playload) {
    ctx.commit('setToken', playload)
  },
  logout(ctx, playload) {
    ctx.commit('delToken', playload)
    ctx.commit('setUserInfo', null)
  },

  async getUserInfo(ctx) {
    const res = await getUserInfo();
    console.log(res);
    ctx.commit('setUserInfo', res)
  },
  getRedirect(ctx, playload) {
    ctx.commit('setRedirect', playload)
  },
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}