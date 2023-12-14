import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter, constantRoutes } from '@/router'
import { getUserInfo } from '@/api/user'
const state = {
  token: getToken(),
  userInfo: null,
  redirect: '/',
  routes: constantRoutes
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
  },
  setRouter(state, playload) {
    state.routes = [...constantRoutes, ...playload]
  }
}
const actions = {
  login(ctx, playload) {
    ctx.commit('setToken', playload)
  },
  logout(ctx, playload) {
    ctx.commit('delToken', playload)
    ctx.commit('setUserInfo', null)
    resetRouter()
  },

  async getUserInfo(ctx) {
    const res = await getUserInfo();
    // console.log(res);
    ctx.commit('setUserInfo', res)
    return res
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