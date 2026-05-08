import { getMenuPermissions, updateMenuPermissions, getAllPermissions } from '@/services';
import { ModalForm, ProFormCheckbox } from '@ant-design/pro-components';
import { message, Alert } from 'antd';
import React, { useEffect, useState } from 'react';

export type AssignMenuPermissionProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu?: API.MenuItem;
  onFinish: () => Promise<void>;
};

/**
 * 分配菜单权限组件
 */
const AssignMenuPermission: React.FC<AssignMenuPermissionProps> = (props) => {
  const { open, onOpenChange, menu, onFinish } = props;
  const [permissions, setPermissions] = useState<API.PermissionItem[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取所有权限和菜单已有权限
  const fetchData = async () => {
    if (!menu?.id || !open) return;

    setLoading(true);
    try {
      // 获取所有权限
      const allPermissions = await getAllPermissions();
      setPermissions(allPermissions.data || []);

      // 获取菜单已有权限
      const menuPermissions = await getMenuPermissions(menu.id);
      const permissionIds = menuPermissions.data?.list?.map((item) => item.id) || [];
      setSelectedPermissionIds(permissionIds);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 当弹窗打开或菜单变更时获取数据
  useEffect(() => {
    fetchData();
  }, [open, menu?.id]);

  // 提交权限分配
  const handleFinish = async () => {
    if (!menu?.id) return false;

    const hide = message.loading('正在分配权限');
    try {
      const res = await updateMenuPermissions(menu.id, selectedPermissionIds);
      if (res.code === 200) {
        hide();
        message.success('分配权限成功');
        await onFinish();
        return true;
      } else {
        hide();
        return false;
      }
    } catch (error) {
      hide();
      message.error('分配权限失败，请重试！');
      return false;
    }
  };

  return (
    <ModalForm
      title={`为菜单 "${menu?.name || ''}" 分配权限`}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={handleFinish}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      loading={loading}
    >
      <Alert
        message="为菜单分配权限后，拥有该菜单访问权的角色将获得这些权限的入口，但需要额外分配角色权限才能执行相应操作"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <ProFormCheckbox.Group
        name="permissionIds"
        layout="vertical"
        options={permissions.map((permission) => ({
          label: `${permission.name} (${permission.code})`,
          value: permission.id,
        }))}
        initialValue={selectedPermissionIds}
        fieldProps={{
          onChange: (values) => setSelectedPermissionIds(values as string[]),
        }}
      />
    </ModalForm>
  );
};

export default AssignMenuPermission;
