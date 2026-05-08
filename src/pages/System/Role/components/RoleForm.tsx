import { createRole, updateRole } from '@/services/role';
import { ModalForm, ProFormText, ProFormTextArea, ProFormSwitch } from '@ant-design/pro-components';
import { message } from 'antd';
import React from 'react';

export type RoleFormProps = {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: () => Promise<void>;
  initialValues?: API.RoleInfo;
  isEdit?: boolean;
};

/**
 * 角色表单组件
 */
const RoleForm: React.FC<RoleFormProps> = (props) => {
  const { title, open, onOpenChange, onFinish, initialValues, isEdit = false } = props;

  const handleFinish = async (values: API.RoleParams) => {
    const hide = message.loading(`正在${isEdit ? '修改' : '添加'}`);
    try {
      values.status = values.status ? 1 : 0;
      if (isEdit && initialValues) {
        const res = await updateRole(initialValues.id, values);
        if (res.code === 200) {
          hide();
          message.success(`${isEdit ? '修改' : '添加'}成功`);
          await onFinish();
          return true;
        } else {
          hide();
          return false;
        }
      } else {
        const res = await createRole(values);
        if (res.code === 200) {
          hide();
          message.success(`${isEdit ? '修改' : '添加'}成功`);
          await onFinish();
          return true;
        } else {
          hide();
          return false;
        }
      }
    } catch (error) {
      hide();
      return false;
    }
  };

  return (
    <ModalForm
      title={title}
      open={open}
      onOpenChange={onOpenChange}
      initialValues={{
        ...initialValues,
        status: !initialValues?.id ? 1 : initialValues?.status ? 1 : 0,
      }}
      onFinish={handleFinish}
      modalProps={{
        destroyOnClose: true,
      }}
    >
      <ProFormText
        name="name"
        label="角色名称"
        placeholder="请输入角色名称"
        rules={[
          {
            required: true,
            message: '角色名称为必填项',
          },
        ]}
      />

      <ProFormTextArea
        name="description"
        label="角色描述"
        placeholder="请输入角色描述"
        fieldProps={{
          rows: 4,
        }}
      />

      <ProFormSwitch
        name="status"
        label="状态"
        checkedChildren="启用"
        unCheckedChildren="禁用"
        initialValue={true}
      />
    </ModalForm>
  );
};

export default RoleForm;
