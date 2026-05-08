import { getAllRoles } from '@/services/role';
import { createUser, updateUser } from '@/services/user';
import {
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormSwitch,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { message, FormInstance } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { getFileList, getImageUrl } from '@/utils/upload';
export type UserFormProps = {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: () => Promise<void>;
  initialValues?: API.UserInfo;
  isEdit?: boolean;
};

/**
 * 用户表单组件
 */
const UserForm: React.FC<UserFormProps> = (props) => {
  const { title, open, onOpenChange, onFinish, initialValues, isEdit = false } = props;
  const [roles, setRoles] = useState<API.RoleInfo[]>([]);
  const formId = `user-form-${Date.now()}`; // 生成唯一的表单ID
  const formRef = useRef<FormInstance<API.UserParams>>();
  // 获取角色列表
  const fetchRoles = async () => {
    try {
      const result = await getAllRoles();
      setRoles(result.data || []);
    } catch (error) {
      message.error('获取角色列表失败');
    }
  };

  useEffect(() => {
    if (open) {
      fetchRoles();
    }
  }, [open]);

  const handleFinish = async (values: API.UserParams) => {
    const hide = message.loading(`正在${isEdit ? '修改' : '添加'}`);
    try {
      // 处理角色ID数组
      if (values.roleIds && !Array.isArray(values.roleIds)) {
        values.roleIds = [values.roleIds];
      }

      values.status = values.status ? 1 : 0;
      values.avatar = getImageUrl(values.avatar || '');
      if (isEdit && initialValues) {
        const res = await updateUser(initialValues.id, values);
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
        const res = await createUser(values);
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
        roleIds: initialValues?.roles?.map((role) => role.id) || [],
        status: initialValues?.status === 1,
        avatar: getFileList(initialValues?.avatar || ''),
      }}
      onFinish={handleFinish}
      formRef={formRef}
      modalProps={{
        destroyOnClose: true,
      }}
      formKey={formId} // 使用唯一的表单键
      id={formId} // 设置唯一的表单ID
    >
      <ProFormSelect
        name="roleIds"
        label="角色"
        // mode="multiple"
        placeholder="请选择角色"
        rules={[
          {
            required: true,
            message: '角色为必填项',
          },
        ]}
        options={roles.map((role) => ({
          label: role.name,
          value: role.id,
        }))}
        fieldProps={{ id: `${formId}-roleIds` }} // 设置唯一的字段ID
      />

      <ProFormText
        name="username"
        label="用户名"
        placeholder="请输入用户名"
        rules={[
          {
            required: true,
            message: '用户名为必填项',
          },
        ]}
        disabled={isEdit} // 编辑时不允许修改用户名
        fieldProps={{ id: `${formId}-username` }} // 设置唯一的字段ID
      />

      <ProFormText.Password
        name="password"
        label="密码"
        placeholder="请输入密码"
        rules={[
          {
            required: !isEdit,
            message: '密码为必填项',
          },
        ]}
        fieldProps={{ id: `${formId}-password` }} // 设置唯一的字段ID
      />
      <ProFormText
        name="nickname"
        label="昵称"
        placeholder="请输入昵称"
        // rules={[
        //   {
        //     required: true,
        //     message: '昵称为必填项',
        //   },
        // ]}
        fieldProps={{ id: `${formId}-nickname` }} // 设置唯一的字段ID
      />

      <ProFormText
        name="email"
        label="邮箱"
        placeholder="请输入邮箱"
        rules={[
          // {
          //   required: true,
          //   message: '邮箱为必填项',
          // },
          {
            type: 'email',
            message: '请输入正确的邮箱格式',
          },
        ]}
        fieldProps={{ id: `${formId}-email` }} // 设置唯一的字段ID
      />

      <ProFormText
        name="phone"
        label="手机号"
        placeholder="请输入手机号"
        rules={[
          // {
          //   required: true,
          //   message: '手机号为必填项',
          // },
          {
            pattern: /^1\d{10}$/,
            message: '请输入正确的手机号格式',
          },
        ]}
        fieldProps={{ id: `${formId}-phone` }} // 设置唯一的字段ID
      />

      <ProFormUploadButton
        label="上传头像"
        tooltip="支持 jpg、jpeg、png、gif 格式，文件小于 2MB"
        max={1}
        fieldProps={{
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          maxCount: 1,
          listType: 'picture-card',
          accept: '.jpg,.jpeg,.png,.gif',
          beforeUpload: (file) => {
            const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
            const isLt2M = file.size / 1024 / 1024 < 2;

            if (!isValidType) {
              message.error('只能上传JPG/PNG/GIF格式的图片!');
            }
            if (!isLt2M) {
              message.error('图片必须小于2MB!');
            }

            return isValidType && isLt2M;
          },
          onChange: (info) => {
            if (info.file.status === 'done') {
              if (info.file.response?.code === 200) {
                formRef.current?.setFieldValue(
                  'avatar',
                  getFileList(info.file.response.data.fileUrl),
                );
              }
            } else if (info.file.status === 'error') {
              message.error('上传失败');
            }
          },
        }}
        name="avatar"
        action="/admin/files/upload"
      />

      {/* <ProFormUploadButton
        name="avatar"
        label="头像"
        rules={[
          {
            type: 'url',
            message: '请输入正确的头像URL',
          },
        ]}
        placeholder="请输入头像URL"
        fieldProps={{ id: `${formId}-avatar` }} // 设置唯一的字段ID
      /> */}

      <ProFormSwitch
        name="status"
        label="状态"
        checkedChildren="启用"
        unCheckedChildren="禁用"
        fieldProps={{ id: `${formId}-status` }} // 设置唯一的字段ID
      />
    </ModalForm>
  );
};

export default UserForm;
