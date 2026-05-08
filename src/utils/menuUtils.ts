/**
 * 菜单工具函数
 * 用于处理前端路由与后端菜单权限的匹配
 */

import type { MenuDataItem } from '@ant-design/pro-components';

/**
 * 将路由配置格式化为统一的路径格式，方便后续比较
 * @param path 菜单路径
 * @param parentPath 父级路径
 * @returns 标准化后的路径
 */
export const formatMenuPath = (path: string, parentPath = ''): string => {
  if (!path) return parentPath;

  // 如果是绝对路径，直接返回
  if (path.startsWith('/')) return path;

  // 如果是相对路径，拼接父路径
  return parentPath ? `${parentPath}/${path}` : path;
};

/**
 * 收集菜单路径集合，用于权限判断
 * @param menus 菜单数据
 * @param parentPath 父级路径
 * @returns 收集到的路径集合
 */
export const collectMenuPaths = (
  menus: API.MenuItem[],
  parentPath = '',
): { paths: Set<string>; pathMap: Map<string, API.MenuItem> } => {
  const paths = new Set<string>();
  const pathMap = new Map<string, API.MenuItem>();

  const processMenus = (items: API.MenuItem[], currentParentPath = '') => {
    items.forEach((menu) => {
      if (menu.path) {
        const fullPath = formatMenuPath(menu.path, currentParentPath);
        paths.add(fullPath);
        pathMap.set(fullPath, menu);
      }

      if (menu.children && menu.children.length > 0) {
        const nextParentPath = menu.path
          ? formatMenuPath(menu.path, currentParentPath)
          : currentParentPath;
        processMenus(menu.children, nextParentPath);
      }
    });
  };

  processMenus(menus, parentPath);
  return { paths, pathMap };
};

/**
 * 过滤菜单项，只保留用户有权限的菜单
 * @param menus 前端路由配置
 * @param allowedPaths 允许访问的路径集合，/welcome、/ 不需要权限
 * @returns 过滤后的菜单
 */
export const filterMenusByPermission = (
  menus: MenuDataItem[],
  allowedPaths: Set<string>,
): MenuDataItem[] => {
  // 如果没有权限数据，显示不需要权限的菜单
  if (allowedPaths.size === 2) {
    return menus.filter((menu) => {
      return allowedPaths.has(menu.path || '');
    });
  }

  return menus
    .map((menu) => {
      // 始终保留隐藏菜单、404等特殊页面
      if (
        menu.path === '*' ||
        menu.path === '/403' ||
        menu.path === '/404' ||
        menu.path === '/welcome' ||
        menu.path === '/'
      ) {
        return menu;
      }

      const path = menu.path || '';

      // 权限判断逻辑
      // 1. 精确匹配路径
      // 2. 重定向路由保留
      // 3. 如果子路径有权限，父路径也应当保留
      const isAllowed =
        allowedPaths.has(path) ||
        menu.redirect ||
        Array.from(allowedPaths).some((allowedPath) => allowedPath.startsWith(`${path}/`));

      if (!isAllowed) {
        return null;
      }

      if (menu.children) {
        menu.children = menu.children.sort((a, b) => a.sort - b.sort);
      }
      // 处理子菜单
      const filteredChildren = menu.children
        ? filterMenusByPermission(menu.children, allowedPaths)
        : [];

      // 如果菜单有子项但过滤后没有，判断当前菜单是否有权限
      if (
        filteredChildren.length === 0 &&
        menu.children &&
        menu.children.length > 0 &&
        !allowedPaths.has(path)
      ) {
        return null;
      }

      // 返回过滤后的菜单项
      return {
        ...menu,
        children: filteredChildren.length > 0 ? filteredChildren : undefined,
      };
    })
    .filter(Boolean) as MenuDataItem[];
};

/**
 * 检查用户是否有权限访问指定路径
 * @param path 要检查的路径
 * @param allowedPaths 允许的路径集合
 * @returns 是否有权限
 */
export const hasPathPermission = (path: string, allowedPaths: Set<string>): boolean => {
  // 特殊路径始终允许访问
  if (
    path === '/403' ||
    path === '/404' ||
    path === '/user/login' ||
    path === '/welcome' ||
    path === '/'
  ) {
    return true;
  }

  // 权限检查逻辑：
  // 1. 精确匹配
  // 2. 路径层级匹配（父路径 or 子路径）
  return (
    allowedPaths.has(path) ||
    Array.from(allowedPaths).some(
      (allowedPath) =>
        // 当前路径是某个允许路径的父路径
        path.startsWith(`${allowedPath}/`) ||
        // 某个允许的路径是当前路径的子路径
        allowedPath.startsWith(`${path}/`),
    )
  );
};
