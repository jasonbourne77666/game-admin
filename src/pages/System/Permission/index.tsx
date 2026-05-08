import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { PageContainer, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Access, useModel } from '@umijs/max';
import { Button, Drawer, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import { getPermissionList, deletePermission } from '@/services/permission';
import PermissionForm from './components/PermissionForm';
import dayjs from 'dayjs';
import type { ColumnsState } from '@ant-design/pro-components';

/**
 * 权限管理页面
 */
const PermissionList: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.PermissionItem>();
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [columnsState, setColumnsState] = useState<Record<string, ColumnsState>>({
    createTime: {
      show: false,
    },
  });
  const { hasPermission } = useModel('permissions');

  /**
   * 新增权限
   */
  const handleAdd = async () => {
    setCreateModalOpen(true);
  };

  /**
   * 编辑权限
   */
  const handleEdit = (record: API.PermissionItem) => {
    setCurrentRow(record);
    setUpdateModalOpen(true);
  };

  /**
   * 删除权限
   */
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '删除权限',
      content: '确定删除该权限吗？这可能会影响已分配该权限的角色。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const hide = message.loading('正在删除');
        try {
          await deletePermission(id);
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
  const columns: ProColumns<API.PermissionItem>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      hideInSearch: true,
      width: 80,
      renderText: (text, record, index) => index + 1,
    },
    {
      title: '权限名称',
      dataIndex: 'name',
    },
    {
      title: '权限编码',
      dataIndex: 'code',
    },
    {
      title: '描述',
      dataIndex: 'description',
      hideInSearch: true,
      ellipsis: true,
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
        <Access key="edit" accessible={hasPermission('permission:update')}>
          <a onClick={() => handleEdit(record)}>编辑</a>
        </Access>,
        <Access key="delete" accessible={hasPermission('permission:delete')}>
          <a onClick={() => handleDelete(record.id)}>删除</a>
        </Access>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.PermissionItem, API.PermissionItem>
        headerTitle="权限列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Access key="add" accessible={hasPermission('permission:create')}>
            <Button type="primary" key="primary" onClick={handleAdd}>
              <PlusOutlined /> 新建
            </Button>
          </Access>,
        ]}
        columnsState={{
          value: columnsState,
          onChange: setColumnsState,
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        }}
        request={async (params) => {
          if (!hasPermission('permission:getList')) {
            return {
              data: [],
              success: true,
              total: 0,
            };
          }
          const { current, pageSize, ...rest } = params;
          const result = await getPermissionList({
            page: current,
            pageSize,
            name: rest.name,
            code: rest.code,
          });
          return {
            data: result.data?.list || [],
            success: true,
            total: result.data?.total || 0,
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
          <ProDescriptions<API.PermissionItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.PermissionItem>[]}
          />
        )}
      </Drawer>

      {/* 新增权限表单 */}
      <PermissionForm
        title="新增权限"
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={async () => {
          setCreateModalOpen(false);
          actionRef.current?.reload();
        }}
      />

      {/* 编辑权限表单 */}
      <PermissionForm
        title="编辑权限"
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
    </PageContainer>
  );
};

export default PermissionList;
