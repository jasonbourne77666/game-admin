import { createPermission, updatePermission } from '@/services/permission';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { message } from 'antd';
import React from 'react';

export type PermissionFormProps = {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: () => Promise<void>;
  initialValues?: API.PermissionItem;
  isEdit?: boolean;
};

/**
 * 权限表单组件
 */
const PermissionForm: React.FC<PermissionFormProps> = (props) => {
  const { title, open, onOpenChange, onFinish, initialValues, isEdit = false } = props;

  const handleFinish = async (values: API.PermissionParams) => {
    const hide = message.loading(`正在${isEdit ? '修改' : '添加'}`);
    try {
      if (isEdit && initialValues) {
        await updatePermission(initialValues.id, values);
      } else {
        await createPermission(values);
      }
      hide();
      message.success(`${isEdit ? '修改' : '添加'}成功`);
      await onFinish();
      return true;
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
      initialValues={initialValues}
      onFinish={handleFinish}
      modalProps={{
        destroyOnClose: true,
      }}
    >
      <ProFormText
        name="name"
        label="权限名称"
        placeholder="请输入权限名称"
        rules={[
          {
            required: true,
            message: '权限名称为必填项',
          },
        ]}
      />

      <ProFormText
        name="code"
        label="权限编码"
        placeholder="请输入权限编码，如：system:user:create"
        rules={[
          {
            required: true,
            message: '权限编码为必填项',
          },
          {
            pattern: /^[a-z]+(:[a-z]+)*$/,
            message: '权限编码格式不正确，请使用小写字母和冒号，如：system:user:create',
          },
        ]}
        disabled={isEdit}
      />

      <ProFormTextArea
        name="description"
        label="权限描述"
        placeholder="请输入权限描述"
        fieldProps={{
          rows: 4,
        }}
      />
    </ModalForm>
  );
};

export default PermissionForm;
