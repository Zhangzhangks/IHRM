import request from '@/utils/request'


export const login = (form) => {
  return request({
    url: '/sys/login',
    method: 'post',
    data: form
  })
}