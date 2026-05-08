import { PlusOutlined, DownOutlined } from '@ant-design/icons';
import type {
  ActionType,
  ProColumns,
  ProDescriptionsItemProps,
  ColumnsState,
} from '@ant-design/pro-components';
import { PageContainer, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Access, useModel } from '@umijs/max';
import { Button, Drawer, message, Modal, Switch, Dropdown, FormInstance } from 'antd';
import React, { useRef, useState } from 'react';
import { getRoleList, updateRoleStatus, deleteRole } from '@/services/role';
import RoleForm from './components/RoleForm';
import AssignPermission from './components/AssignPermission';
import AssignMenu from './components/AssignMenu';
import dayjs from 'dayjs';

/**
 * 角色管理页面
 */
const RoleList: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.RoleInfo>();
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [assignPermissionOpen, setAssignPermissionOpen] = useState<boolean>(false);
  const [assignMenuOpen, setAssignMenuOpen] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const [columnsState, setColumnsState] = useState<Record<string, ColumnsState>>({
    id: {
      show: false,
    },
    createTime: {
      show: false,
    },
  });
  const { hasPermission } = useModel('permissions');

  /**
   * 新增角色
   */
  const handleAdd = async () => {
    setCreateModalOpen(true);
  };

  /**
   * 编辑角色
   */
  const handleEdit = (record: API.RoleInfo) => {
    setCurrentRow(record);
    setUpdateModalOpen(true);
  };

  /**
   * 删除角色
   */
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '删除角色',
      content: '确定删除该角色吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const hide = message.loading('正在删除');
        try {
          const res = await deleteRole(id);
          if (res.code === 200) {
            hide();
            message.success('删除成功');
            actionRef.current?.reload();
          } else {
            hide();
          }
        } catch (error) {
          hide();
        }
      },
    });
  };

  /**
   * 修改角色状态
   */
  const handleStatusChange = async (checked: boolean, record: API.RoleInfo) => {
    const hide = message.loading('正在修改状态');
    try {
      const res = await updateRoleStatus(record.id, checked ? 1 : 0);
      if (res.code === 200) {
        hide();
        message.success('状态修改成功');
        actionRef.current?.reload();
      } else {
        hide();
      }
    } catch (error) {
      hide();
    }
  };

  /**
   * 分配权限
   */
  const handleAssignPermission = (record: API.RoleInfo) => {
    setCurrentRow(record);
    setAssignPermissionOpen(true);
  };

  /**
   * 分配菜单
   */
  const handleAssignMenu = (record: API.RoleInfo) => {
    setCurrentRow(record);
    setAssignMenuOpen(true);
  };

  /**
   * 表格列定义
   */
  const columns: ProColumns<API.RoleInfo>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      hideInSearch: true,
      renderText: (text, record, index) => index + 1,
    },
    {
      title: '角色ID',
      dataIndex: 'id',
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      // valueEnum: {
      //   true: { text: '启用', status: 'Success', value: 1 },
      //   false: { text: '禁用', status: 'Error', value: 0 },
      // },
      valueType: 'select',
      fieldProps: {
        onChange: () => {
          formRef.current?.submit();
        },
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
      render: (_, record) => {
        return record?.isAdmin ? (
          '-'
        ) : (
          <Switch
            checked={record.status === 1}
            onChange={(checked) => handleStatusChange(checked, record)}
          />
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      hideInSearch: true,
      renderText: (text: string) => {
        return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '';
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      hideInSearch: true,
      renderText: (text: string) => {
        return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '';
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 240,
      render: (_, record) => [
        <a
          key="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          详情
        </a>,
        <Access key="edit" accessible={hasPermission('role:update')}>
          <a onClick={() => handleEdit(record)}>编辑</a>
        </Access>,
        <Dropdown
          key="dropdown"
          menu={{
            items: [
              {
                label: '分配权限',
                key: 'permission',
                onClick: () => handleAssignPermission(record),
              },
              {
                label: '分配菜单',
                key: 'menu',
                onClick: () => handleAssignMenu(record),
              },
              {
                label: '删除',
                key: 'delete',
                onClick: () => handleDelete(record.id),
              },
            ].filter((item) => {
              if (item.key === 'delete' && hasPermission('role:delete')) {
                return true;
              }
              if (item.key === 'permission' && hasPermission('role:update')) {
                return true;
              }
              if (item.key === 'menu' && hasPermission('role:update')) {
                return true;
              }

              return false;
            }),
          }}
        >
          <a href="#">
            更多操作 <DownOutlined />
          </a>
        </Dropdown>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<
        API.RoleInfo,
        {
          status: number;
          name: string;
        }
      >
        headerTitle="角色列表"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Access key="add" accessible={hasPermission('role:create')}>
            <Button type="primary" key="primary" onClick={handleAdd}>
              <PlusOutlined /> 新建
            </Button>
          </Access>,
        ]}
        columnsState={{
          value: columnsState,
          onChange: setColumnsState,
        }}
        request={async (params) => {
          if (!hasPermission('role:getList')) {
            return {
              data: [],
              success: true,
              total: 0,
            };
          }
          const result = await getRoleList({
            page: params.current,
            pageSize: params.pageSize,
            name: params.name,
            status: params.status,
          });
          return {
            data: result.data?.list || [],
            success: true,
            total: result.data?.total || 0,
          };
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        }}
        columns={columns}
      />

      {/* 详情抽屉 */}
      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.id && (
          <ProDescriptions<API.RoleInfo>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.RoleInfo>[]}
          />
        )}
      </Drawer>

      {/* 新增角色表单 */}
      <RoleForm
        title="新增角色"
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={async () => {
          setCreateModalOpen(false);
          actionRef.current?.reload();
        }}
      />

      {/* 编辑角色表单 */}
      <RoleForm
        title="编辑角色"
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        initialValues={currentRow}
        onFinish={async () => {
          setUpdateModalOpen(false);
          setCurrentRow(undefined);
          actionRef.current?.reload();
        }}
        isEdit={true}
      />

      {/* 分配权限 */}
      <AssignPermission
        open={assignPermissionOpen}
        onOpenChange={setAssignPermissionOpen}
        role={currentRow}
        onFinish={async () => {
          setAssignPermissionOpen(false);
          setCurrentRow(undefined);
          actionRef.current?.reload();
        }}
      />

      <AssignMenu
        open={assignMenuOpen}
        onOpenChange={setAssignMenuOpen}
        role={currentRow}
        onFinish={async () => {
          setAssignMenuOpen(false);
          setCurrentRow(undefined);
          actionRef.current?.reload();
        }}
      />
    </PageContainer>
  );
};

export default RoleList;
