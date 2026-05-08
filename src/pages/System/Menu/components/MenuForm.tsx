import { createMenu, updateMenu, getMenuTree } from '@/services/menu';
import { ModalForm, ProFormText, ProFormDigit, ProFormSelect } from '@ant-design/pro-components';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';

export type MenuFormProps = {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: () => Promise<void>;
  initialValues?: API.MenuItem;
  isEdit?: boolean;
};

/**
 * 菜单表单组件
 */
const MenuForm: React.FC<MenuFormProps> = (props) => {
  const {
    title,
    open,
    onOpenChange,
    onFinish,
    initialValues = {} as API.MenuItem,
    isEdit = false,
  } = props;
  const [menuTree, setMenuTree] = useState<API.MenuItem[]>([]);

  // 获取菜单树
  const fetchMenuTree = async () => {
    try {
      const result = await getMenuTree();
      setMenuTree(result.data || []);
    } catch (error) {}
  };

  useEffect(() => {
    if (open) {
      fetchMenuTree();
    }
  }, [open]);

  const handleFinish = async (values: API.MenuParams) => {
    const hide = message.loading(`正在${isEdit ? '修改' : '添加'}`);
    try {
      if (isEdit && 'id' in initialValues!) {
        const result = await updateMenu((initialValues as API.MenuItem).id, values);
        if (result.code === 200) {
          message.success(`${isEdit ? '修改' : '添加'}成功`);
          await onFinish();
          hide();
          return true;
        }
      } else {
        values.parentId = Number(values?.parentId || 0);
        const result = await createMenu(values);
        if (result.code === 200) {
          message.success(`${isEdit ? '修改' : '添加'}成功`);
          await onFinish();
          hide();
          return true;
        }
      }
      return false;
    } catch (error) {
      hide();
      return false;
    }
  };

  // 转换菜单树为选项
  const transformMenuTreeToOptions = (menus: API.MenuItem[]) => {
    const options = [{ label: '顶级菜单', value: 0 }];

    const traverse = (items: API.MenuItem[], prefix = '') => {
      items.forEach((item) => {
        options.push({
          label: `${prefix}${item.name}`,
          value: Number(item.id),
        });

        if (item.children && item.children.length > 0) {
          traverse(item.children, `${prefix}${item.name} / `);
        }
      });
    };

    traverse(menus);
    return options;
  };

  return (
    <ModalForm
      title={title}
      open={open}
      onOpenChange={onOpenChange}
      initialValues={{ ...initialValues, sort: initialValues?.sort || 1 }}
      onFinish={handleFinish}
      modalProps={{
        destroyOnClose: true,
      }}
    >
      <ProFormSelect
        name="parentId"
        label="上级菜单"
        options={transformMenuTreeToOptions(menuTree)}
        placeholder="请选择上级菜单"
        disabled={
          isEdit &&
          'id' in initialValues! &&
          menuTree.some((menu) => menu.id === (initialValues as API.MenuItem).id)
        }
      />

      <ProFormText
        name="name"
        label="菜单名称"
        placeholder="请输入菜单名称"
        rules={[
          {
            required: true,
            message: '菜单名称为必填项',
          },
        ]}
      />

      <ProFormText
        name="path"
        label="路由路径"
        placeholder="请输入路由路径，如：/system/user"
        rules={[
          {
            required: true,
            message: '路由路径为必填项',
          },
        ]}
      />

      <ProFormDigit
        name="sort"
        label="排序号"
        placeholder="请输入排序号，数字越小越靠前"
        min={1}
        fieldProps={{ precision: 0 }}
      />
    </ModalForm>
  );
};

export default MenuForm;
