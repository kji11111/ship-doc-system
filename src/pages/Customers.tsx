import { useMemo, useState } from 'react';
import { App as AntApp, Button, Card, Form, Input, Modal, Popconfirm, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Customer } from '../types';
import { nextId, useStore } from '../store/AppStore';
import { round2, unpaidOf } from '../utils/calc';

interface CustomerFormValues {
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  paymentTerm?: string;
  remark?: string;
}

/** 客户档案：完整 CRUD（名称/联系人/电话/地址/结算方式/备注） */
export default function Customers() {
  const { customers, saveCustomer, removeCustomer, packingLists, statements } = useStore();
  const { message } = AntApp.useApp();

  /** 装箱单数 / 应收余额（按客户聚合，供列展示与排序） */
  const packCount = useMemo(() => {
    const m = new Map<string, number>();
    packingLists.forEach((p) => {
      if (p.customerId && p.status !== '已取消') m.set(p.customerId, (m.get(p.customerId) ?? 0) + 1);
    });
    return m;
  }, [packingLists]);
  const unpaidMap = useMemo(() => {
    const m = new Map<string, number>();
    statements.forEach((st) => m.set(st.customerId, round2((m.get(st.customerId) ?? 0) + unpaidOf(st))));
    return m;
  }, [statements]);
  const [kw, setKw] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form] = Form.useForm<CustomerFormValues>();

  const list = useMemo(
    () =>
      customers.filter(
        (c) => !kw || c.name.includes(kw) || (c.contact ?? '').includes(kw) || (c.phone ?? '').includes(kw),
      ),
    [customers, kw],
  );

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    form.setFieldsValue({ name: c.name, contact: c.contact, phone: c.phone, address: c.address, paymentTerm: c.paymentTerm, remark: c.remark });
    setOpen(true);
  };

  const submit = (v: CustomerFormValues) => {
    saveCustomer({
      id: editing?.id ?? nextId(customers.map((c) => c.id), 'CU'),
      name: v.name.trim(),
      contact: v.contact,
      phone: v.phone,
      address: v.address,
      paymentTerm: v.paymentTerm?.trim() || undefined,
      remark: v.remark?.trim() || undefined,
      createdAt: editing?.createdAt ?? dayjs().format('YYYY-MM-DD HH:mm'),
    });
    message.success(editing ? '客户已更新' : '客户已新增');
    setOpen(false);
  };

  const onDelete = (c: Customer) => {
    removeCustomer(c.id);
    message.success('已删除客户：' + c.name);
  };

  const columns: ColumnsType<Customer> = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 90,
      sorter: (a, b) => String(a.id ?? '').localeCompare(String(b.id ?? ''), 'zh-CN'),
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 130,
      render: (v: string) => <b>{v}</b>,
      sorter: (a, b) => String(a.name ?? '').localeCompare(String(b.name ?? ''), 'zh-CN'),
    },
    {
      title: '简称',
      dataIndex: 'shortName',
      width: 90,
      render: (v?: string) => v || '—',
      sorter: (a, b) => String(a.shortName ?? '').localeCompare(String(b.shortName ?? ''), 'zh-CN'),
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      width: 100,
      render: (v?: string) => v || '—',
      sorter: (a, b) => String(a.contact ?? '').localeCompare(String(b.contact ?? ''), 'zh-CN'),
    },
    { title: '电话', dataIndex: 'phone', width: 130, render: (v?: string) => v || '—' },
    { title: '地址', dataIndex: 'address', ellipsis: true, render: (v?: string) => v || '—' },
    { title: '结算方式', dataIndex: 'paymentTerm', width: 100, render: (v?: string) => v || '—' },
    {
      title: '装箱单数',
      key: 'packCount',
      width: 92,
      render: (_, c) => <span className="tabular-nums">{packCount.get(c.id) ?? 0}</span>,
      sorter: (a, b) => (packCount.get(a.id) ?? 0) - (packCount.get(b.id) ?? 0),
    },
    {
      title: '应收余额',
      key: 'unpaid',
      width: 96,
      render: (_, c) => <span className="tabular-nums">{unpaidMap.get(c.id) ?? 0}</span>,
      sorter: (a, b) => (unpaidMap.get(a.id) ?? 0) - (unpaidMap.get(b.id) ?? 0),
    },
    { title: '备注', dataIndex: 'remark', ellipsis: true, render: (v?: string) => v || '—' },
    {
      title: '操作',
      width: 130,
      render: (_, c) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => openEdit(c)}>
            编辑
          </Button>
          <Popconfirm title={'删除客户「' + c.name + '」？'} description="已开装箱单/对账单不受影响" onConfirm={() => onDelete(c)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="客户档案"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          新增客户
        </Button>
      }
    >
      <Space style={{ marginBottom: 12 }}>
        <Input.Search placeholder="搜名称 / 联系人 / 电话" allowClear value={kw} onChange={(e) => setKw(e.target.value)} style={{ width: 260 }} />
      </Space>
      <Table
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={list}
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 10, showTotal: (t) => '共 ' + t + ' 家' }}
      />
      <Modal
        title={editing ? '编辑客户 · ' + editing.id : '新增客户'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="name" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]}>
            <Input placeholder="如 旺兆" />
          </Form.Item>
          <Space wrap size={12}>
            <Form.Item name="contact" label="联系人">
              <Input style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="phone" label="电话">
              <Input style={{ width: 180 }} />
            </Form.Item>
            <Form.Item name="paymentTerm" label="结算方式">
              <Input style={{ width: 140 }} placeholder="含1点税 / 月结" />
            </Form.Item>
          </Space>
          <Form.Item name="address" label="地址">
            <Input />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
