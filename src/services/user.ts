// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取用户列表 GET /admin/users */
export async function getUserList(
  params: {
    /** 当前页码 */
    page?: number;
    /** 页面大小 */
    pageSize?: number;
    /** 用户名 */
    username?: string;
    /** 角色ID */
    roleId?: string;
    /** 状态 */
    status?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse<API.PageInfo<API.UserInfo>>>('/admin/users/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取用户详情 GET /admin/users/:id */
export async function getUserDetail(id: string, options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.UserInfo>>(`/admin/users/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 创建普通用户 POST /admin/users */
export async function createUser(body: API.UserParams, options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.UserInfo>>('/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新用户 PUT /admin/users/:id */
export async function updateUser(
  id: string,
  body: API.UserParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse<API.UserInfo>>(`/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除用户 DELETE /admin/users/:id */
export async function deleteUser(id: string, options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/admin/users/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 修改用户状态 PATCH /admin/users/:id/status */
export async function updateUserStatus(
  id: string,
  status: boolean,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse<API.UserInfo>>(`/admin/users/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { status },
    ...(options || {}),
  });
}

/** 修改用户密码 PATCH /admin/users/:id/password */
export async function updateUserPassword(
  id: string,
  body: API.UpdatePasswordParams,
  options?: { [key: string]: any },
) {
  return request<Record<string, any>>(`/admin/users/${id}/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
/** 踢出用户 PATCH /kick-out/:userId */
export async function kickOutUser(userId: number, options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/kick-out/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
