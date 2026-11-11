import { useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, Card, DatePicker, Empty, Input, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, ExportOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import type { Statement } from '../types';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../store/AppStore';
import { statementAmount, statementPaid, unpaidOf } from '../utils/calc';
import { exportStatementExcel } from '../utils/exportStatement';
import { statementDocHtml } from '../utils/docHtml';
import { printDoc } from '../utils/printDoc';
import StatementEditor from '../components/StatementEditor';

/** 客户对账单：完整 CRUD + 从装箱单带出件数 + Excel 导出 + 打印（科诚抬头） */
export default function Statements() {
  const { company, customers, statements, removeStatement } = useStore();
  const { message } = AntApp.useApp();
  const [searchParams] = useSearchParams();

  const [kw, setKw] = useState('');
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [period, setPeriod] = useState<Dayjs | null>(null);
  const [statusFilter, setStatusFilter] = useState<'待确认' | '已确认' | undefined>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Statement | null>(null);
  const [printId, setPrintId] = useState<string | null>(null);

  /** 顶栏「待确认对账」待办跳转：自动筛选待确认 */
  useEffect(() => {
    if (searchParams.get('todo') === '1') setStatusFilter('待确认');
  }, [searchParams]);

  const custName = useMemo(() => new Map(customers.map((c) => [c.id, c.name])), [customers]);

  const list = useMemo(
    () =>
      statements
        .filter((st) => {
          if (customerId && st.customerId !== customerId) return false;
          if (period && st.period !== period.format('YYYY-MM')) return false;
          if (statusFilter && st.status !== statusFilter) return false;
          if (kw) {
            const hay = [st.id, st.title ?? '', custName.get(st.customerId) ?? ''].join('|');
            if (!hay.toLowerCase().includes(kw.toLowerCase())) return false;
          }
          return true;
        })
        .sort((a, b) => b.period.localeCompare(a.period) || b.id.localeCompare(a.id)),
    [statements, customerId, period, statusFilter, kw, custName],
  );

  const openAdd = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (st: Statement) => {
    setEditing(st);
    setEditorOpen(true);
  };
  const doExport = (st: Statement) => {
    exportStatementExcel(st, company, custName.get(st.customerId));
    message.success('已导出：对账单_' + (custName.get(st.customerId) ?? st.customerId) + '_' + st.period + '.xlsx');
  };
  const onDelete = (st: Statement) => {
    removeStatement(st.id);
    message.success('已删除 ' + st.id);
  };

  const printSt = printId ? statements.find((s) => s.id === printId) : undefined;
  const printCust = printSt ? custName.get(printSt.customerId) : undefined;

  const columns: ColumnsType<Statement> = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 116,
      sorter: (a, b) => String(a.id ?? '').localeCompare(String(b.id ?? ''), 'zh-CN'),
    },
    {
      title: '对账期间',
      dataIndex: 'period',
      width: 100,
      sorter: (a, b) => String(a.period ?? '').localeCompare(String(b.period ?? ''), 'zh-CN'),
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
      render: (v?: string) => v || '—',
      sorter: (a, b) => String(a.title ?? '').localeCompare(String(b.title ?? ''), 'zh-CN'),
    },
    {
      title: '客户',
      dataIndex: 'customerId',
      width: 100,
      render: (v: string) => custName.get(v) ?? v,
      sorter: (a, b) => {
        const an = custName.get(a.customerId) ?? '';
        const bn = custName.get(b.customerId) ?? '';
        if (!an && !bn) return 0;
        if (!an) return 1;
        if (!bn) return -1;
        return an.localeCompare(bn, 'zh-CN');
      },
    },
    {
      title: '金额（元）',
      width: 100,
      render: (_, st) => <b className="tabular-nums">{statementAmount(st.lines)}</b>,
      sorter: (a, b) => statementAmount(a.lines) - statementAmount(b.lines),
    },
    { title: '已收', width: 88, render: (_, st) => <span className="tabular-nums">{statementPaid(st)}</span> },
    {
      title: '未收',
      width: 96,
      render: (_, st) => {
        const due = unpaidOf(st);
        return <span className="tabular-nums" style={{ color: due > 0.005 ? '#c95656' : undefined }}>{due}</span>;
      },
      sorter: (a, b) => unpaidOf(a) - unpaidOf(b),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: Statement['status']) => <Tag color={s === '已确认' ? 'green' : 'gold'}>{s}</Tag>,
      sorter: (a, b) => String(a.status ?? '').localeCompare(String(b.status ?? ''), 'zh-CN'),
    },
    {
      title: '确认时间',
      dataIndex: 'confirmedAt',
      width: 150,
      render: (v?: string) => v || '—',
      sorter: (a, b) => {
        const x = String(a.confirmedAt ?? '');
        const y = String(b.confirmedAt ?? '');
        if (!x && !y) return 0;
        if (!x) return 1; // 未确认的（空）排后面
        if (!y) return -1;
        return x.localeCompare(y);
      },
    },
    {
      title: '操作',
      width: 260,
      render: (_, st) => (
        <Space size={0} wrap>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(st)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<ExportOutlined />} onClick={() => doExport(st)}>
            导出
          </Button>
          <Button type="link" size="small" icon={<PrinterOutlined />} onClick={() => setPrintId(st.id)}>
            打印
          </Button>
          <Popconfirm title="删除这张对账单？" onConfirm={() => onDelete(st)}>
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
      title="对账单"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          新增对账单
        </Button>
      }
    >
      <Space wrap size={10} style={{ marginBottom: 12 }}>
        <Input.Search placeholder="搜编号 / 标题 / 客户" allowClear value={kw} onChange={(e) => setKw(e.target.value)} style={{ width: 240 }} />
        <Select
          allowClear
          showSearch
          placeholder="客户"
          style={{ width: 150 }}
          value={customerId}
          onChange={setCustomerId}
          options={customers.map((c) => ({ value: c.id, label: c.name }))}
          optionFilterProp="label"
        />
        <DatePicker picker="month" placeholder="对账期间" value={period} onChange={(d) => setPeriod(d)} style={{ width: 140 }} allowClear />
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 110 }}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v)}
          options={[
            { value: '待确认', label: '待确认' },
            { value: '已确认', label: '已确认' },
          ]}
        />
      </Space>
      {statements.length === 0 ? (
        <Empty description="还没有对账单：点「新增对账单」，可手工加行，或从当月装箱单带出件数（单价手填）" style={{ padding: '48px 0' }} />
      ) : (
        <Table size="small" rowKey="id" columns={columns} dataSource={list} pagination={{ pageSize: 10, showTotal: (t) => '共 ' + t + ' 张' }} />
      )}
      <StatementEditor open={editorOpen} initial={editing} onClose={() => setEditorOpen(false)} />
      <Modal
        open={!!printSt}
        onCancel={() => setPrintId(null)}
        width={880}
        title={'打印预览 · ' + (printSt?.id ?? '')}
        footer={[
          <Button key="close" onClick={() => setPrintId(null)}>
            关闭
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              if (printSt && !printDoc(printSt.id, statementDocHtml(printSt, company, printCust))) {
                message.warning('浏览器拦截了弹出窗口，请允许弹窗后重试');
              }
            }}
          >
            打印
          </Button>,
        ]}
      >
        {printSt && <div className="doc-preview" dangerouslySetInnerHTML={{ __html: statementDocHtml(printSt, company, printCust) }} />}
      </Modal>
    </Card>
  );
}

