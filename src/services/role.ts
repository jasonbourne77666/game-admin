// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取角色列表 GET /admin/roles/list */
export async function getRoleList(
  params: {
    /** 当前页码 */
    page?: number;
    /** 页面大小 */
    pageSize?: number;
    /** 角色名称 */
    name?: string;
    /** 角色状态 */
    status?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse<API.RoleList>>('/admin/roles/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取所有角色 GET /admin/roles/getAll */
export async function getAllRoles(options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.RoleInfo[]>>('/admin/roles/getAll', {
    method: 'GET',
    ...(options || {}),
  });
}
/** 获取角色详情 GET /admin/roles/:id */
export async function getRoleDetail(id: string, options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.RoleInfo>>(`/admin/roles/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 创建角色 POST /admin/roles/create */
export async function createRole(body: API.RoleParams, options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.RoleInfo>>('/admin/roles/create', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 创建超级管理员角色 POST /admin/roles/create/admin */
export async function createAdminRole(body: API.RoleParams, options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.RoleInfo>>('/admin/roles/create/admin', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 更新角色 PUT /admin/roles/update */
export async function updateRole(
  id: string,
  body: API.RoleParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse<API.RoleInfo>>('/admin/roles/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { id, ...body },
    ...(options || {}),
  });
}

/** 更新超级管理员角色 PUT /admin/roles/update/admin */
export async function updateAdminRole(
  id: string,
  body: API.RoleParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse<API.RoleInfo>>('/admin/roles/update/admin', {
    method: 'PUT',
    data: { id, ...body },
    ...(options || {}),
  });
}

/** 删除角色 DELETE /admin/roles/delete */
export async function deleteRole(id: string, options?: { [key: string]: any }) {
  return request<Record<string, any>>('/admin/roles/delete', {
    method: 'DELETE',
    params: { id },
    ...(options || {}),
  });
}

/** 修改角色状态 PATCH /admin/roles/update/status */
export async function updateRoleStatus(
  id: string,
  status: number,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse<API.RoleInfo>>('/admin/roles/update/status', {
    method: 'PATCH',
    data: { id, status },
    ...(options || {}),
  });
}

/** 获取角色权限 GET /admin/roles/permissions */
export async function getRolePermissions(id: string, options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.PermissionItem[]>>('/admin/roles/permissions', {
    method: 'GET',
    params: { id },
    ...(options || {}),
  });
}

/** 分配角色权限 POST /admin/roles/update/permissions */
export async function assignRolePermissions(
  id: string,
  permissionIds: string[],
  options?: { [key: string]: any },
) {
  return request<Record<string, any>>('/admin/roles/update/permissions', {
    method: 'POST',
    data: { id, permissionIds },
    ...(options || {}),
  });
}

/** 获取角色菜单 GET /admin/roles/menus */
export async function getRoleMenus(id: string, options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.MenuItem[]>>('/admin/roles/menus', {
    method: 'GET',
    params: { id },
    ...(options || {}),
  });
}

/** 分配角色菜单 POST /admin/roles/update/menus */
export async function assignRoleMenus(
  id: string,
  menuIds: string[],
  options?: { [key: string]: any },
) {
  return request<Record<string, any>>('/admin/roles/update/menus', {
    method: 'POST',
    data: { id, menuIds },
    ...(options || {}),
  });
}
