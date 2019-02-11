import request from '@/utils/request'

export function login(username, password, code, randomStr) {
  var grant_type = 'password'
  var scope = 'server'

  return request({
    url: '/auth/oauth/token',
    headers: {
      'Authorization': 'Basic c25haWw6cGFzc3dvcmQ='
    },
    method: 'post',
    params: { username, password, randomStr, code, grant_type, scope }
  })
}

export function getUserInfo() {
  return request({
    url: '/admin/user/info',
    method: 'get'
  })
}

export function logout(accesstoken, refreshToken) {
  return request({
    url: '/auth/authentication/removeToken',
    method: 'post',
    params: { accesstoken, refreshToken }
  })
}
