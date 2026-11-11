import { useMemo, useState } from 'react';
import { App as AntApp, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import type { Style } from '../types';
import { nextId, useStore } from '../store/AppStore';

interface StyleFormValues {
  styleNo: string;
  name: string;
  sizeScale: string[];
  colors: string[];
  unit: string;
  bulkPrice?: number;
  process?: string;
  remark?: string;
}

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '均码'].map((v) => ({ value: v }));

/** 款号资料：完整 CRUD（款号唯一、尺码列与花型色别 tags、大货单价、工艺） */
export default function Styles() {
  const { styles, saveStyle, removeStyle } = useStore();
  const { message } = AntApp.useApp();
  const [kw, setKw] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Style | null>(null);
  const [form] = Form.useForm<StyleFormValues>();

  const list = useMemo(
    () => styles.filter((s) => !kw || s.styleNo.toLowerCase().includes(kw.toLowerCase()) || s.name.includes(kw)),
    [styles, kw],
  );

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ unit: '件', sizeScale: ['S', 'M', 'L', 'XL', 'XXL'] });
    setOpen(true);
  };

  const openEdit = (s: Style) => {
    setEditing(s);
    form.setFieldsValue({ styleNo: s.styleNo, name: s.name, sizeScale: s.sizeScale, colors: s.colors, unit: s.unit, bulkPrice: s.bulkPrice, process: s.process, remark: s.remark });
    setOpen(true);
  };

  const submit = (v: StyleFormValues) => {
    const styleNo = v.styleNo.trim();
    if (!styleNo) {
      message.error('请填写款号');
      return;
    }
    const dup = styles.find((s) => s.styleNo.toLowerCase() === styleNo.toLowerCase() && s.id !== editing?.id);
    if (dup) {
      message.error('款号 ' + styleNo + ' 已存在（' + dup.id + '），不可重复');
      return;
    }
    if (!v.sizeScale.length) {
      message.error('请至少填写一个尺码');
      return;
    }
    saveStyle({
      id: editing?.id ?? nextId(styles.map((s) => s.id), 'ST'),
      styleNo,
      name: v.name.trim(),
      sizeScale: v.sizeScale,
      colors: v.colors ?? [],
      unit: v.unit?.trim() || '件',
      bulkPrice: v.bulkPrice,
      process: v.process?.trim() || undefined,
      remark: v.remark?.trim() || undefined,
    });
    message.success(editing ? '款号已更新' : '款号已新增');
    setOpen(false);
  };

  const onDelete = (s: Style) => {
    removeStyle(s.id);
    message.success('已删除款号：' + s.styleNo);
  };

  const columns: ColumnsType<Style> = [
    { title: '编号', dataIndex: 'id', width: 90 },
    {
      title: '款号',
      dataIndex: 'styleNo',
      width: 100,
      render: (v: string) => <b>{v}</b>,
      sorter: (a, b) => String(a.styleNo ?? '').localeCompare(String(b.styleNo ?? ''), 'zh-CN'),
    },
    {
      title: '品名',
      dataIndex: 'name',
      width: 120,
      sorter: (a, b) => String(a.name ?? '').localeCompare(String(b.name ?? ''), 'zh-CN'),
    },
    {
      title: '尺码列',
      dataIndex: 'sizeScale',
      width: 200,
      render: (v: string[]) => v.map((sz) => <Tag key={sz}>{sz}</Tag>),
    },
    {
      title: '花型色别',
      dataIndex: 'colors',
      width: 220,
      render: (v: string[]) => (v.length ? v.map((c) => <Tag key={c} color="green">{c}</Tag>) : '—'),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 70,
      sorter: (a, b) => String(a.unit ?? '').localeCompare(String(b.unit ?? ''), 'zh-CN'),
    },
    {
      title: '大货单价',
      dataIndex: 'bulkPrice',
      width: 100,
      render: (v?: number) => (v != null ? '¥' + v : '—'),
      sorter: (a, b) => Number(a.bulkPrice ?? 0) - Number(b.bulkPrice ?? 0),
    },
    { title: '工艺', dataIndex: 'process', width: 110, ellipsis: true, render: (v?: string) => v || '—' },
    { title: '备注', dataIndex: 'remark', ellipsis: true, render: (v?: string) => v || '—' },
    {
      title: '操作',
      width: 130,
      render: (_, s) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => openEdit(s)}>
            编辑
          </Button>
          <Popconfirm title={'删除款号「' + s.styleNo + '」？'} description="已开装箱单不受影响" onConfirm={() => onDelete(s)}>
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
      title="款号资料"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          新增款号
        </Button>
      }
    >
      <Space style={{ marginBottom: 12 }}>
        <Input.Search placeholder="搜款号 / 品名" allowClear value={kw} onChange={(e) => setKw(e.target.value)} style={{ width: 240 }} />
      </Space>
      <Table size="small" rowKey="id" columns={columns} dataSource={list} pagination={{ pageSize: 10, showTotal: (t) => '共 ' + t + ' 个款' }} />
      <Modal
        title={editing ? '编辑款号 · ' + editing.id : '新增款号'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        width={620}
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Space wrap size={12}>
            <Form.Item name="styleNo" label="款号" rules={[{ required: true, message: '请输入款号' }]}>
              <Input placeholder="如 J34" style={{ width: 140 }} />
            </Form.Item>
            <Form.Item name="name" label="品名" rules={[{ required: true, message: '请输入品名' }]}>
              <Input placeholder="如 冲锋衣" style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="unit" label="单位">
              <Input style={{ width: 90 }} placeholder="件" />
            </Form.Item>
            <Form.Item name="bulkPrice" label="大货单价（元）">
              <InputNumber min={0} precision={2} style={{ width: 120 }} />
            </Form.Item>
          </Space>
          <Form.Item name="sizeScale" label="尺码列（可输入新码，如 XS / 均码）" rules={[{ required: true, message: '请至少选一个尺码' }]}>
            <Select mode="tags" options={SIZE_OPTIONS} tokenSeparators={[',']} placeholder="S / M / L / XL / XXL" />
          </Form.Item>
          <Form.Item name="colors" label="花型色别（可输入新颜色）">
            <Select mode="tags" tokenSeparators={[',']} placeholder="黑色 / 紫色 / 米白" open={false} />
          </Form.Item>
          <Form.Item name="process" label="工艺/位置说明">
            <Input placeholder="如 无缝压胶" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

