import { Footer, AvatarDropdown, AvatarName } from '@/components';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { currentUser as queryCurrentUser } from '@/services/auth';
import { collectMenuPaths, filterMenusByPermission, hasPathPermission } from '@/utils/menuUtils';

import React from 'react';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };

  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();

    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    actionsRender: () => [],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.username,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = window;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }

      // 如果已登录但没有权限访问当前路由，重定向到 403 页面
      if (
        initialState?.currentUser &&
        location.pathname !== loginPath &&
        location.pathname !== '/403' &&
        location.pathname !== '/404' &&
        location.pathname !== '/welcome' &&
        location.pathname !== '/'
      ) {
        // 获取用户角色菜单权限
        const userRoles = initialState?.currentUser?.roles || [];

        // 超级管理员角色可以访问所有页面
        const isAdmin = userRoles.some((role) => role.isAdmin);
        if (isAdmin) {
          return;
        }

        // 检查用户是否有权限访问当前路由
        const checkRoutePermission = async () => {
          const allowedPaths = new Set<string>();

          try {
            for (const role of userRoles) {
              const roleMenus = role?.menus || [];
              if (roleMenus.length > 0) {
                const menus = roleMenus;

                // 使用工具函数收集菜单路径
                const { paths } = collectMenuPaths(menus);

                // 合并路径集合
                paths.forEach((path) => allowedPaths.add(path));
              }
            }

            // 使用工具函数检查路径权限
            const path = location.pathname;
            const hasPermission = hasPathPermission(path, allowedPaths);

            if (!hasPermission) {
              // 重定向到 403 页面
              history.push('/');
            }
          } catch (error) {
            console.error('检查路由权限失败', error);
          }
        };

        checkRoutePermission();
      }
    },

    // 根据用户角色和权限过滤菜单项
    menu: {
      // 每当 initialState?.currentUser?.roles 发生变化时重新执行
      params: {
        userId: initialState?.currentUser?.id,
      },
      request: async (params, defaultMenuData) => {
        // 获取当前用户角色的菜单权限
        // 如果用户是超级管理员，显示所有菜单
        const userRoles = initialState?.currentUser?.roles || [];
        const isAdmin = userRoles.some((role) => role.isAdmin);
        if (isAdmin) {
          return defaultMenuData;
        }

        // 从后端获取用户有权限的菜单
        const allowedMenuPaths = new Set<string>(['/welcome', '/']);
        console.log('userRoles', userRoles);
        try {
          // 获取用户所有角色的菜单权限
          for (const role of userRoles) {
            const roleMenus = role?.menus || [];

            // 使用工具函数收集菜单路径
            const { paths } = collectMenuPaths(roleMenus);

            // 合并路径集合
            paths.forEach((path) => allowedMenuPaths.add(path));
          }
        } catch (error) {
          console.error('获取菜单权限失败', error);
        }
        // 使用工具函数过滤菜单
        const menu = filterMenusByPermission(defaultMenuData, allowedMenuPaths);
        console.log('menu', menu);
        return menu;
      },
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};
