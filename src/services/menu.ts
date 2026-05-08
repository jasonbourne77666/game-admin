// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取菜单列表 GET /admin/menus */
export async function getMenuList(
  params: {
    page: number;
    pageSize: number;
    name?: string;
    path?: string;
    parentId?: string | number;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse<API.MenuList>>('/admin/menus/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取菜单树形数据 GET /admin/menus/tree */
export async function getMenuTree(options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.MenuTree>>('/admin/menus/tree', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取菜单详情 GET /admin/menus/:id */
export async function getMenuDetail(id: string, options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.MenuItem>>(`/admin/menus/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 创建菜单 POST /admin/menus */
export async function createMenu(body: API.MenuParams, options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.MenuItem>>('/admin/menus', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新菜单 PUT /admin/menus/:id */
export async function updateMenu(
  id: string,
  body: API.MenuParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse<API.MenuItem>>(`/admin/menus/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除菜单 DELETE /admin/menus/:id */
export async function deleteMenu(id: string, options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/admin/menus/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 获取菜单权限 GET /admin/menus/:id/permissions */
export async function getMenuPermissions(id: string, options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.PermissionList>>(`/admin/menus/${id}/permissions`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 更新菜单权限 POST /admin/menus/:id/permissions */
export async function updateMenuPermissions(
  id: string,
  permissionIds: string[],
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse<API.MenuItem>>(`/admin/menus/${id}/permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { permissionIds },
    ...(options || {}),
  });
}
