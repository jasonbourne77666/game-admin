// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取权限列表 GET /admin/permissions */
export async function getPermissionList(
  params: {
    /** 当前页码 */
    page?: number;
    /** 页面大小 */
    pageSize?: number;
    /** 权限名称 */
    name?: string;
    /** 权限编码 */
    code?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse<API.PermissionList>>('/admin/permissions/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取所有权限 GET /admin/permissions/getAll */
export async function getAllPermissions(options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.PermissionItem[]>>('/admin/permissions/getAll', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取权限详情 GET /admin/permissions/:id */
export async function getPermissionDetail(id: string, options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.PermissionItem>>(`/admin/permissions/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 创建权限 POST /admin/permissions */
export async function createPermission(
  body: API.PermissionParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse<API.PermissionItem>>('/admin/permissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新权限 PUT /admin/permissions/:id */
export async function updatePermission(
  id: string,
  body: API.PermissionParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse<API.PermissionItem>>(`/admin/permissions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除权限 DELETE /admin/permissions/:id */
export async function deletePermission(id: string, options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/admin/permissions/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
