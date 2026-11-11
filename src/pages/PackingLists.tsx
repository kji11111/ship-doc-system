import { useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, Card, DatePicker, Empty, Input, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, ExportOutlined, FileAddOutlined, PlusOutlined, PrinterOutlined, UploadOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { PackingList, PackingStatus } from '../types';
import { useStore } from '../store/AppStore';
import { cartonCount, packingGrandQty } from '../utils/calc';
import { exportPackingExcel } from '../utils/exportPacking';
import { packingDocHtml } from '../utils/docHtml';
import { printDoc } from '../utils/printDoc';
import PackingListEditor from '../components/PackingListEditor';
import ImportPackingModal from '../components/ImportPackingModal';

const STATUS_TAG: Record<PackingStatus, string> = { 草稿: 'default', 已出货: 'cyan', 已对账: 'green', 已取消: 'red' };
const NEXT_STATUS: Partial<Record<PackingStatus, { next: PackingStatus; label: string }>> = {
  草稿: { next: '已出货', label: '确认出货' },
  已出货: { next: '已对账', label: '标记已对账' },
};

/** 出货装箱单：完整 CRUD + 一行一箱编辑 + Excel 导入/导出 + 打印 */
export default function PackingLists() {
  const { company, customers, packingLists, savePackingList, removePackingList } = useStore();
  const { message } = AntApp.useApp();
  const [searchParams] = useSearchParams();

  const [kw, setKw] = useState('');
  const [status, setStatus] = useState<PackingStatus | undefined>();
  const [month, setMonth] = useState<Dayjs | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<PackingList | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [printId, setPrintId] = useState<string | null>(null);

  /** 顶栏「草稿装箱单」待办跳转：自动筛选草稿 */
  useEffect(() => {
    if (searchParams.get('todo') === '1') setStatus('草稿');
  }, [searchParams]);

  const custName = useMemo(() => new Map(customers.map((c) => [c.id, c.name])), [customers]);

  const list = useMemo(
    () =>
      packingLists
        .filter((p) => {
          if (status && p.status !== status) return false;
          if (month && !dayjs(p.date).isSame(month, 'month')) return false;
          if (kw) {
            const hay = [p.id, p.productName, p.styleNo, p.orderNo ?? '', custName.get(p.customerId ?? '') ?? ''].join('|');
            if (!hay.toLowerCase().includes(kw.toLowerCase())) return false;
          }
          return true;
        })
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [packingLists, status, month, kw, custName],
  );

  const openAdd = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (p: PackingList) => {
    setEditing(p);
    setEditorOpen(true);
  };
  const advance = (p: PackingList) => {
    const step = NEXT_STATUS[p.status];
    if (!step) return;
    savePackingList({ ...p, status: step.next });
    message.success(p.id + ' 已' + (step.next === '已出货' ? '确认出货' : '标记已对账'));
  };
  const doExport = (p: PackingList) => {
    exportPackingExcel(p, company, custName.get(p.customerId ?? ''));
    message.success('已导出：装箱单_' + (p.styleNo || '未命名') + '_' + p.date + '.xlsx');
  };
  const onDelete = (p: PackingList) => {
    removePackingList(p.id);
    message.success('已删除 ' + p.id);
  };

  const printPl = printId ? packingLists.find((p) => p.id === printId) : undefined;
  const printCust = printPl ? custName.get(printPl.customerId ?? '') : undefined;

  const columns: ColumnsType<PackingList> = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 110,
      sorter: (a, b) => String(a.id ?? '').localeCompare(String(b.id ?? ''), 'zh-CN'),
    },
    {
      title: '日期',
      dataIndex: 'date',
      width: 100,
      defaultSortOrder: 'descend',
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
    },
    {
      title: '品名',
      dataIndex: 'productName',
      width: 110,
      sorter: (a, b) => String(a.productName ?? '').localeCompare(String(b.productName ?? ''), 'zh-CN'),
    },
    {
      title: '款号',
      dataIndex: 'styleNo',
      width: 90,
      render: (v: string) => <b>{v}</b>,
      sorter: (a, b) => String(a.styleNo ?? '').localeCompare(String(b.styleNo ?? ''), 'zh-CN'),
    },
    {
      title: '客户',
      dataIndex: 'customerId',
      width: 100,
      render: (v?: string) => (v ? custName.get(v) ?? v : '—'),
      sorter: (a, b) => {
        const an = (a.customerId ? custName.get(a.customerId) : undefined) ?? '';
        const bn = (b.customerId ? custName.get(b.customerId) : undefined) ?? '';
        if (!an && !bn) return 0;
        if (!an) return 1; // 未关联客户的排后面
        if (!bn) return -1;
        return an.localeCompare(bn, 'zh-CN');
      },
    },
    { title: '客户单号', dataIndex: 'orderNo', width: 130, render: (v?: string) => v || '—' },
    {
      title: '箱数',
      width: 70,
      render: (_, p) => <span className="tabular-nums">{cartonCount(p)}</span>,
      sorter: (a, b) => cartonCount(a) - cartonCount(b),
    },
    {
      title: '总件数',
      width: 84,
      render: (_, p) => <b className="tabular-nums">{packingGrandQty(p)}</b>,
      sorter: (a, b) => packingGrandQty(a) - packingGrandQty(b),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 84,
      render: (s: PackingStatus) => <Tag color={STATUS_TAG[s]}>{s}</Tag>,
      sorter: (a, b) => String(a.status ?? '').localeCompare(String(b.status ?? ''), 'zh-CN'),
    },
    {
      title: '操作',
      width: 320,
      render: (_, p) => (
        <Space size={0} wrap>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(p)}>
            编辑
          </Button>
          {NEXT_STATUS[p.status] && (
            <Button type="link" size="small" onClick={() => advance(p)}>
              {NEXT_STATUS[p.status]!.label}
            </Button>
          )}
          <Button type="link" size="small" icon={<ExportOutlined />} onClick={() => doExport(p)}>
            导出
          </Button>
          <Button type="link" size="small" icon={<PrinterOutlined />} onClick={() => setPrintId(p.id)}>
            打印
          </Button>
          <Popconfirm title="删除这张装箱单？" description="删除后不可恢复（已开对账单不受影响）" onConfirm={() => onDelete(p)}>
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
      title="出货装箱单"
      extra={
        <Space>
          <Button icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
            导入 Excel
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            新增装箱单
          </Button>
        </Space>
      }
    >
      <Space wrap size={10} style={{ marginBottom: 12 }}>
        <Input.Search placeholder="搜编号 / 品名 / 款号 / 客户 / 单号" allowClear value={kw} onChange={(e) => setKw(e.target.value)} style={{ width: 280 }} />
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 120 }}
          value={status}
          onChange={(v) => setStatus(v)}
          options={(['草稿', '已出货', '已对账', '已取消'] as PackingStatus[]).map((s) => ({ value: s, label: s }))}
        />
        <DatePicker picker="month" placeholder="按月份筛选" value={month} onChange={(d) => setMonth(d)} style={{ width: 140 }} allowClear />
      </Space>
      {packingLists.length === 0 ? (
        <Empty
          description="还没有装箱单：可以手工新建，或导入你手上的「科诚无缝出货装箱单」Excel"
          style={{ padding: '48px 0' }}
        >
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              新增装箱单
            </Button>
            <Button icon={<FileAddOutlined />} onClick={() => setImportOpen(true)}>
              导入 Excel
            </Button>
          </Space>
        </Empty>
      ) : (
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={list}
          pagination={{ pageSize: 10, showTotal: (t) => '共 ' + t + ' 张' }}
        />
      )}
      <PackingListEditor open={editorOpen} initial={editing} onClose={() => setEditorOpen(false)} />
      <ImportPackingModal open={importOpen} onClose={() => setImportOpen(false)} />
      <Modal
        open={!!printPl}
        onCancel={() => setPrintId(null)}
        width={880}
        title={'打印预览 · ' + (printPl?.id ?? '')}
        footer={[
          <Button key="close" onClick={() => setPrintId(null)}>
            关闭
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              if (printPl && !printDoc(printPl.id, packingDocHtml(printPl, company, printCust))) {
                message.warning('浏览器拦截了弹出窗口，请允许弹窗后重试');
              }
            }}
          >
            打印
          </Button>,
        ]}
      >
        {printPl && <div className="doc-preview" dangerouslySetInnerHTML={{ __html: packingDocHtml(printPl, company, printCust) }} />}
      </Modal>
    </Card>
  );
}

