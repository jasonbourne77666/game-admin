// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前的用户 GET /admin/auth/profile */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/admin/auth/profile', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 用户注册接口 POST /admin/auth/register */
export async function register(body: API.UserParams, options?: { [key: string]: any }) {
  return request<API.UserInfo>('/admin/auth/register', {
    method: 'POST',

    data: body,
    ...(options || {}),
  });
}

/** 登录接口 POST /admin/auth/login */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/admin/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 登出接口 POST /admin/auth/logout */
export async function logout(options?: { [key: string]: any }) {
  return request<API.LogoutResult>('/admin/auth/logout', {
    method: 'POST',
    ...(options || {}),
  });
}
