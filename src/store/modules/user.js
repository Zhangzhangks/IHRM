import { getToken, setToken, removeToken } from '@/utils/auth'
const state = {
  token: getToken(),
  avatar: 'https://n.sinaimg.cn/sinacn10/533/w800h533/20180629/9bcc-heqpwqy6850523.jpg'
}
const mutations = {
  setToken(state, playload) {
    state.token = playload;
    setToken(playload)
  },
  logout() {
    state.token = null
    removeToken()
  }
}
const actions = {
  login(ctx, playload) {
    ctx.commit('setToken', '')
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}