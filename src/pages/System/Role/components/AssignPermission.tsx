import { assignRolePermissions, getRolePermissions, getAllPermissions } from '@/services';
import { ModalForm, ProFormCheckbox } from '@ant-design/pro-components';
import { message, Alert, FormInstance } from 'antd';
import React, { useEffect, useState, useRef } from 'react';

export type AssignPermissionProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: API.RoleInfo;
  onFinish: () => Promise<void>;
};

/**
 * 分配权限组件
 */
const AssignPermission: React.FC<AssignPermissionProps> = (props) => {
  const { open, onOpenChange, role, onFinish } = props;
  const [permissions, setPermissions] = useState<API.PermissionItem[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const formRef = useRef<FormInstance>();

  // 是否为超级管理员角色
  const isAdminRole = role?.isAdmin;

  // 获取所有权限和角色已有权限
  const fetchData = async () => {
    if (!role?.id || !open) return;

    setLoading(true);
    try {
      // 获取所有权限
      const allPermissions = await getAllPermissions();
      setPermissions(allPermissions.data || []);

      // 如果是超级管理员角色，默认全选所有权限
      if (isAdminRole) {
        const allPermissionIds = allPermissions.data?.map((item) => item.id) || [];
        setSelectedPermissionIds(allPermissionIds);
        formRef.current?.setFieldsValue({
          permissionIds: allPermissionIds,
        });
      } else {
        // 获取普通角色已有权限
        const rolePermissions = await getRolePermissions(role.id);
        const permissionIds = rolePermissions.data?.map((item) => item.id) || [];
        setSelectedPermissionIds(permissionIds);
        formRef.current?.setFieldsValue({
          permissionIds: permissionIds,
        });
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

  // 提交权限分配
  const handleFinish = async () => {
    if (!role?.id) return false;

    // 超级管理员角色不需要保存，直接关闭
    if (isAdminRole) {
      message.info('超级管理员角色默认拥有所有权限');
      return true;
    }

    const hide = message.loading('正在分配权限');
    try {
      const res = await assignRolePermissions(role.id, selectedPermissionIds);
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
      return false;
    }
  };

  return (
    <ModalForm
      title={`为 "${role?.name || ''}" 分配权限`}
      open={open}
      formRef={formRef}
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
          message="超级管理员角色默认拥有所有权限，无需单独分配"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <ProFormCheckbox.Group
        name="permissionIds"
        layout="vertical"
        options={permissions.map((permission) => ({
          label: `${permission.name} (${permission.code})`,
          value: permission.id,
        }))}
        fieldProps={{
          onChange: (values) => {
            if (!isAdminRole) {
              setSelectedPermissionIds(values as string[]);
            }
          },
          disabled: isAdminRole,
        }}
      />
    </ModalForm>
  );
};

export default AssignPermission;
