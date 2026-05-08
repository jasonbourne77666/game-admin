import { assignRoleMenus, getRoleMenus } from '@/services/role';
import { getMenuTree } from '@/services/menu';
import { ModalForm } from '@ant-design/pro-components';
import { message, Tree, Alert } from 'antd';
import React, { useEffect, useState } from 'react';

export type AssignMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: API.RoleInfo;
  onFinish: () => Promise<void>;
};

/**
 * 分配菜单组件
 */
const AssignMenu: React.FC<AssignMenuProps> = (props) => {
  const { open, onOpenChange, role, onFinish } = props;
  const [menuTree, setMenuTree] = useState<API.MenuItem[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // 是否为超级管理员角色
  const isAdminRole = role?.isAdmin;

  // 获取所有菜单和角色已有菜单
  const fetchData = async () => {
    if (!role?.id || !open) return;

    setLoading(true);
    try {
      // 获取所有菜单树
      const allMenus = await getMenuTree();
      setMenuTree(allMenus.data || []);

      // 收集所有菜单ID，用于超级管理员默认全选
      const collectMenuIds = (menus: API.MenuItem[]): string[] => {
        let ids: string[] = [];
        menus.forEach((menu) => {
          ids.push(menu.id);
          if (menu.children && menu.children.length > 0) {
            ids = [...ids, ...collectMenuIds(menu.children)];
          }
        });
        return ids;
      };

      const allIds = collectMenuIds(allMenus.data || []);
      // 如果是超级管理员角色，默认全选所有菜单
      if (isAdminRole) {
        setCheckedKeys(allIds);
      } else {
        // 获取普通角色已有菜单
        const roleMenus = await getRoleMenus(role.id);
        const menuIds = roleMenus.data?.map((item) => item.id) || [];
        setCheckedKeys(menuIds);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 当弹窗打开或角色变更时获取数据
  useEffect(() => {
    fetchData();
  }, [open, role?.id]);

  // 转换菜单树为Tree组件所需的数据格式
  const transformMenuTreeToTreeData = (
    menus: API.MenuItem[],
  ): { title: string; key: string; children?: any[] }[] => {
    return menus.map((menu) => ({
      title: menu.name,
      key: menu.id,
      children:
        menu.children && menu.children.length > 0
          ? transformMenuTreeToTreeData(menu.children)
          : undefined,
    }));
  };

  // 提交菜单分配
  const handleFinish = async () => {
    if (!role?.id) return false;

    // 超级管理员角色不需要保存，直接关闭
    if (isAdminRole) {
      message.info('超级管理员角色默认拥有所有菜单权限');
      return true;
    }

    const hide = message.loading('正在分配菜单');
    try {
      const res = await assignRoleMenus(role.id, checkedKeys as string[]);
      if (res.code === 200) {
        hide();
        message.success('分配菜单成功');
        await onFinish();
        return true;
      } else {
        hide();
        return false;
      }
    } catch (error) {
      hide();
      return false;
    }
  };

  return (
    <ModalForm
      title={`为 "${role?.name || ''}" 分配菜单`}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={handleFinish}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      loading={loading}
    >
      {isAdminRole && (
        <Alert
          message="超级管理员角色默认拥有所有菜单权限，无需单独分配"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Tree
        checkable
        defaultExpandAll
        checkedKeys={checkedKeys}
        onCheck={(checked) => {
          if (!isAdminRole) {
            setCheckedKeys(checked as React.Key[]);
          }
        }}
        treeData={transformMenuTreeToTreeData(menuTree)}
        disabled={isAdminRole}
        selectable={false}
        showLine
        checkStrictly={false}
      />
    </ModalForm>
  );
};

export default AssignMenu;
