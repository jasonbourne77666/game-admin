import { useModel } from '@umijs/max';
import { useCallback, useEffect, useState } from 'react';

/**
 * 权限检查钩子函数
 * @returns 权限检查相关函数
 */
export default () => {
  const { initialState } = useModel('@@initialState') as any;
  const [permissionMap, setPermissionMap] = useState<Record<string, boolean>>({});
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  /**
   * 初始化权限映射
   */
  const initPermissions = useCallback(() => {
    console.log('初始化权限映射 - currentUser.roles');

    // 避免重复初始化
    if (initialized || !initialState?.currentUser?.roles) return;

    const currentUser = initialState?.currentUser;
    if (!currentUser || !currentUser.roles) {
      setPermissionMap({});
      setIsAdmin(false);
      setInitialized(true);
      return;
    }

    const permMap: Record<string, boolean> = {};
    let userIsAdmin = false;

    // 遍历用户角色
    currentUser.roles.forEach((role: any) => {
      // 检查是否为超级管理员
      if (role.isAdmin) {
        userIsAdmin = true;
      }

      // 遍历角色的权限
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach((permission: any) => {
          if (permission.code) {
            permMap[permission.code] = true;
          }
        });
      }
    });

    setIsAdmin(userIsAdmin);
    setPermissionMap(permMap);
    setInitialized(true);
  }, [initialState?.currentUser?.username, initialized]);

  useEffect(() => {
    initPermissions();
  }, [initPermissions, initialState?.currentUser?.username]);

  /**
   * 检查是否有指定权限
   * @param permissionCode 权限代码
   * @returns 是否拥有权限
   */
  const hasPermission = useCallback(
    (permissionCode: string): boolean => {
      // 如果是超级管理员，拥有所有权限
      if (isAdmin) {
        return true;
      }

      return !!permissionMap[permissionCode];
    },
    [permissionMap, isAdmin],
  );

  /**
   * 检查是否有指定权限中的任意一个
   * @param permissionCodes 权限代码数组
   * @returns 是否拥有任意一个权限
   */
  const hasAnyPermission = useCallback(
    (permissionCodes: string[]): boolean => {
      // 如果是超级管理员，拥有所有权限
      if (isAdmin) {
        return true;
      }

      return permissionCodes.some((code) => hasPermission(code));
    },
    [hasPermission, isAdmin],
  );

  /**
   * 检查是否拥有所有指定权限
   * @param permissionCodes 权限代码数组
   * @returns 是否拥有所有权限
   */
  const hasAllPermissions = useCallback(
    (permissionCodes: string[]): boolean => {
      // 如果是超级管理员，拥有所有权限
      if (isAdmin) {
        return true;
      }

      return permissionCodes.every((code) => hasPermission(code));
    },
    [hasPermission, isAdmin],
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    initPermissions,
    isAdmin,
  };
};
