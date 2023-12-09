import request from '@/utils/request'


export const login = (form) => {
  return request({
    url: '/sys/login',
    method: 'post',
    data: form
  })
}
export function getUserInfo() {
  return request({
    url: '/sys/profile'
  })
}

/**
 * 更新密码
 * **/
export function updatePassword(data) {
  return request({
    url: '/sys/user/updatePass',
    method: 'put',
    data
  })
}
