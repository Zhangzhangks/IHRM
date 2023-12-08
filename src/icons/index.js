import Vue from 'vue'
import SvgIcon from '@/components/SvgIcon'// svg component

// register globally
Vue.component('svg-icon', SvgIcon)

const req = require.context('./svg', false, /\.svg$/)
// 返回一个函数
const requireAll = (requireContext) => {
    // console.dir(requireContext);
    // console.log(requireContext.keys().map(requireContext));
    return requireContext.keys().map(requireContext)
}
requireAll(req)
