import { deleteMenu, getMenuList, getMenuTree } from '@/services/menu';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ColumnsState, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Access, useModel } from '@umijs/max';
import { Button, message, Modal, Space, FormInstance } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import AssignMenuPermission from './components/AssignMenuPermission';
import MenuForm from './components/MenuForm';

/**
 * 菜单管理页面
 */
const MenuList: React.FC = () => {
  const [currentRow, setCurrentRow] = useState<API.MenuItem>({} as API.MenuItem);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [columnsState, setColumnsState] = useState<Record<string, ColumnsState>>({
    createTime: {
      show: false,
    },
  });
  const { hasPermission } = useModel('permissions');
  const [menuTree, setMenuTree] = useState<API.MenuItem[]>([]);
  const formRef = useRef<FormInstance>();
  useEffect(() => {
    getMenuTree().then((res) => {
      setMenuTree(res.data);
    });
  }, []);

  /**
   * 新增菜单
   */
  const handleAdd = async (parentId?: string) => {
    setCurrentRow(parentId ? ({ parentId } as any) : undefined);
    setCreateModalOpen(true);
  };

  /**
   * 编辑菜单
   */
  const handleEdit = (record: API.MenuItem) => {
    setCurrentRow(record);
    setUpdateModalOpen(true);
  };

  /**
   * 分配菜单权限
   */
  // const handleAssignPermission = (record: API.MenuItem) => {
  //   setCurrentRow(record);
  //   setPermissionModalOpen(true);
  // };

  /**
   * 删除菜单
   */
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '删除菜单',
      content: '确定删除该菜单吗？如果存在子菜单，将一并删除。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const hide = message.loading('正在删除');
        try {
          await deleteMenu(id);
          hide();
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          hide();
        }
      },
    });
  };

  /**
   * 表格列定义
   */
  const columns: ProColumns<API.MenuItem>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      hideInSearch: true,
      width: 80,
      renderText: (text, record, index) => index + 1,
    },
    {
      title: '菜单名称',
      dataIndex: 'name',
    },
    {
      title: '上级菜单',
      dataIndex: 'parentId',
      valueType: 'cascader',
      fieldProps: {
        options: menuTree,
        placeholder: '请选择上级菜单',
        changeOnSelect: true,
        expandTrigger: 'hover',
        fieldNames: {
          label: 'name',
          value: 'id',
          children: 'children',
        },
        onChange: () => {
          formRef.current?.submit();
        },
      },
      renderText: (text: string, record: API.MenuItem) => {
        if (!text || text === '0') {
          return '顶级菜单';
        }
        return record.parent?.name;
      },
    },
    {
      title: '路径',
      dataIndex: 'path',
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      hideInSearch: true,
      sorter: (a, b) => a.sort - b.sort,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      hideInSearch: true,
      renderText: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      hideInSearch: true,
      renderText: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''),
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 300,
      render: (_, record) => (
        <Space>
          <Access key="edit" accessible={hasPermission('menu:update')}>
            <a onClick={() => handleEdit(record)}>编辑</a>
          </Access>
          {/* <a key="permissions" onClick={() => handleAssignPermission(record)}>
            分配权限
          </a> */}
          <Access key="add-child" accessible={hasPermission('menu:create')}>
            <a onClick={() => handleAdd(record.id)}>添加子菜单</a>
          </Access>
          <Access key="delete" accessible={hasPermission('menu:delete')}>
            <a onClick={() => handleDelete(record.id)}>删除</a>
          </Access>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<
        API.MenuItem,
        {
          page: number;
          pageSize: number;
          name?: string;
          path?: string;
          parentId?: number[];
        }
      >
        headerTitle="菜单列表"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Access key="add" accessible={hasPermission('menu:create')}>
            <Button type="primary" key="primary" onClick={() => handleAdd()}>
              <PlusOutlined /> 新建
            </Button>
          </Access>,
        ]}
        columnsState={{
          value: columnsState,
          onChange: setColumnsState,
        }}
        request={async (params) => {
          if (!hasPermission('menu:getList')) {
            return {
              data: [],
              success: true,
              total: 0,
            };
          }
          let parent;
          if (params.parentId) {
            parent = params.parentId[params.parentId.length - 1];
          }

          const result = await getMenuList({
            page: params.current || 1,
            pageSize: params.pageSize || 10,
            name: params.name,
            path: params.path,
            parentId: parent,
          });
          return {
            data: result.data?.list || [],
            success: true,
            total: result.data?.total || 0,
          };
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        }}
        expandable={{ defaultExpandAllRows: true }}
      />

      {/* 新增菜单表单 */}
      <MenuForm
        title="新增菜单"
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={async () => {
          setCreateModalOpen(false);
          setCurrentRow({} as API.MenuItem);
          actionRef.current?.reload();
        }}
        initialValues={currentRow}
      />

      {/* 编辑菜单表单 */}
      <MenuForm
        title="编辑菜单"
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        initialValues={currentRow}
        onFinish={async () => {
          setUpdateModalOpen(false);
          setCurrentRow({} as API.MenuItem);
          actionRef.current?.reload();
        }}
        isEdit={true}
      />

      {/* 分配菜单权限 */}
      <AssignMenuPermission
        open={permissionModalOpen}
        onOpenChange={setPermissionModalOpen}
        menu={currentRow}
        onFinish={async () => {
          setPermissionModalOpen(false);
          setCurrentRow({} as API.MenuItem);
          actionRef.current?.reload();
        }}
      />
    </PageContainer>
  );
};

export default MenuList;
