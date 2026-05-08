import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { PageContainer, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Access, useModel } from '@umijs/max';
import { Button, Drawer, message, Modal, Switch, FormInstance } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { getUserList, updateUserStatus, deleteUser, getAllRoles, kickOutUser } from '@/services';
import UserForm from './components/UserForm';
import type { ColumnsState } from '@ant-design/pro-components';
import dayjs from 'dayjs';
/**
 * 系统用户管理页面
 */
const UserList: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.UserInfo>();
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [roles, setRoles] = useState<API.RoleInfo[]>([]);
  const [columnsState, setColumnsState] = useState<Record<string, ColumnsState>>({
    id: {
      show: false,
    },
    email: {
      show: false,
    },
    phone: {
      show: false,
    },
    createTime: {
      show: false,
    },
  });
  const { hasPermission } = useModel('permissions');

  // 获取角色列表
  useEffect(() => {
    const fetchRoles = async () => {
      const res = await getAllRoles();
      setRoles(res.data);
    };
    fetchRoles();
  }, []);

  /**
   * 新增用户
   */
  const handleAdd = async () => {
    setCreateModalOpen(true);
  };

  /**
   * 编辑用户
   */
  const handleEdit = (record: API.UserInfo) => {
    setCurrentRow(record);
    setUpdateModalOpen(true);
  };

  /**
   * 删除用户
   */
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '删除用户',
      content: '确定删除该用户吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const hide = message.loading('正在删除');
        try {
          const res = await deleteUser(id);
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
   * 踢出用户
   */
  const handleKickOut = async (id: number) => {
    Modal.confirm({
      title: '踢出用户',
      content: '确定踢出该用户吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const hide = message.loading('正在踢出');
        try {
          const res = await kickOutUser(id);
          if (res.code === 200) {
            hide();
            message.success('踢出成功');
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
   * 修改用户状态
   */
  const handleStatusChange = async (checked: boolean, record: API.UserInfo) => {
    const hide = message.loading('正在修改状态');
    try {
      const res = await updateUserStatus(record.id, checked);
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
   * 表格列定义
   */
  const columns: ProColumns<API.UserInfo>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      hideInSearch: true,
      renderText: (text, record, index) => index + 1,
    },
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '角色',
      dataIndex: 'roleId',
      valueType: 'select',
      fieldProps: {
        onChange: () => {
          formRef.current?.submit();
        },
        options: roles.map((role) => ({
          label: role.name,
          value: role.id,
        })),
      },
      renderText: (text, record) => record.roles.map((role) => role.name).join(','),
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      search: false,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      search: false,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
        onChange: () => {
          formRef.current?.submit();
        },
      },
      render: (_, record) => {
        return (
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
        <Access key="edit" accessible={hasPermission('user:update')}>
          <a onClick={() => handleEdit(record)}>编辑</a>
        </Access>,
        <Access
          key="kickOut"
          accessible={
            hasPermission('user:kickOut') && !record.roles.some((role) => role.name !== 'admin')
          }
        >
          <a onClick={() => handleKickOut(Number(record.id))}>踢出</a>
        </Access>,
        <Access key="delete" accessible={hasPermission('user:delete')}>
          <a onClick={() => handleDelete(record.id)}>删除</a>
        </Access>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<
        API.UserInfo,
        {
          status: number;
          username: string;
          roleId: string;
        }
      >
        headerTitle="用户列表"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Access key="add" accessible={hasPermission('user:create')}>
            <Button type="primary" key="primary" onClick={handleAdd}>
              <PlusOutlined /> 新建
            </Button>
          </Access>,
        ]}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        }}
        columnsState={{
          value: columnsState,
          onChange: setColumnsState,
        }}
        request={async (params) => {
          if (!hasPermission('user:getList')) {
            return {
              data: [],
              success: true,
              total: 0,
            };
          }
          const result = await getUserList({
            page: params.current,
            pageSize: params.pageSize,
            status: params.status,
            username: params.username,
            roleId: params.roleId,
          });

          return {
            data: result.data.list || [],
            success: true,
            total: result.data.total || 0,
          };
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
          <ProDescriptions<API.UserInfo>
            column={2}
            title={currentRow?.username}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.UserInfo>[]}
          />
        )}
      </Drawer>

      {/* 新增用户表单 */}
      <UserForm
        title="新增用户"
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={async () => {
          setCreateModalOpen(false);
          actionRef.current?.reload();
        }}
      />

      {/* 编辑用户表单 */}
      <UserForm
        title="编辑用户"
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        initialValues={currentRow}
        onFinish={async () => {
          setUpdateModalOpen(false);
          setCurrentRow(undefined);
          const res = await initialState?.fetchUserInfo?.();
          if (res) {
            setInitialState((prevState) => ({
              ...prevState,
              currentUser: res,
            }));
          }
          actionRef.current?.reload();
        }}
        isEdit={true}
      />
    </PageContainer>
  );
};

export default UserList;
