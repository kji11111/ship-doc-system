import { useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, DatePicker, Input, InputNumber, Modal, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { Statement, StatementLine } from '../types';

interface PaymentRecord {
  date: string;
  amount: number;
  note?: string;
}
import { nextId, useStore } from '../store/AppStore';
import { rmbInWords, round2, statementAmount, statementPaid, unpaidOf } from '../utils/calc';

interface Props {
  open: boolean;
  initial: Statement | null; // null = 新增
  onClose: () => void;
}

/** 对账单编辑器：按客户+月份，可手工加行（起版等）或从该月装箱单带出件数（单价手填），可登记收款 */
export default function StatementEditor({ open, initial, onClose }: Props) {
  const { customers, styles, packingLists, statements, saveStatement } = useStore();
  const { message } = AntApp.useApp();

  const [customerId, setCustomerId] = useState<string | undefined>();
  const [period, setPeriod] = useState<Dayjs>(dayjs().startOf('month'));
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'待确认' | '已确认'>('待确认');
  const [lines, setLines] = useState<StatementLine[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [remark, setRemark] = useState('');

  const autoTitle = (cid: string | undefined, p: Dayjs): string => {
    const c = customers.find((x) => x.id === cid);
    return (c ? c.name : '') + ' ' + p.format('YYYY') + '年' + (p.month() + 1) + '月份客户对帐单';
  };

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setCustomerId(initial.customerId);
      setPeriod(dayjs(initial.period + '-01'));
      setTitle(initial.title ?? '');
      setStatus(initial.status);
      setLines(initial.lines.map((l) => ({ ...l })));
      setPayments((initial.payments ?? []).map((p) => ({ ...p })));
      setRemark(initial.remark ?? '');
    } else {
      setCustomerId(undefined);
      setPeriod(dayjs().startOf('month'));
      setTitle('');
      setStatus('待确认');
      setLines([{ date: dayjs().format('YYYY-MM-DD'), name: '', unit: '件', quantity: 0, unitPrice: 0 }]);
      setPayments([]);
      setRemark('');
    }
  }, [open, initial]);

  /** 换客户/期间时自动刷新标题（可再手改） */
  useEffect(() => {
    if (!open) return;
    if (customerId) setTitle(autoTitle(customerId, period));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, period, open]);

  const patchLine = (idx: number, patch: Partial<StatementLine>) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const addLine = () =>
    setLines((prev) => [...prev, { date: period.format('YYYY-MM') + '-28', name: '', unit: '件', quantity: 0, unitPrice: 0 }]);
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  /** 从该月装箱单带出件数（按品名分组，单价留 0 由用户手填） */
  const bringFromPacking = () => {
    if (!customerId) {
      message.warning('请先选择客户');
      return;
    }
    const lists = packingLists.filter(
      (p) => p.customerId === customerId && p.status !== '已取消' && dayjs(p.date).isSame(period, 'month'),
    );
    if (!lists.length) {
      message.warning(period.format('YYYY年M月') + '该客户没有可带出的装箱单');
      return;
    }
    const groups = new Map<string, { qty: number; count: number; lastDate: string }>();
    lists.forEach((p) => {
      const g = groups.get(p.productName) ?? { qty: 0, count: 0, lastDate: p.date };
      g.qty += p.cartons.reduce((s, c) => s + Object.values(c.sizes).reduce((a, b) => a + (b || 0), 0), 0);
      g.count += 1;
      if (p.date > g.lastDate) g.lastDate = p.date;
      groups.set(p.productName, g);
    });
    setLines((prev) => [
      ...prev.filter((l) => l.name.trim() || l.quantity > 0), // 丢弃空行
      ...[...groups.entries()].map(([name, g]) => ({
        date: g.lastDate,
        name,
        unit: styles.find((s) => s.name === name)?.unit ?? '件',
        quantity: g.qty,
        unitPrice: 0,
        remark: '装箱单带出 ' + g.count + ' 张，请补单价',
      })),
    ]);
    message.success('已从 ' + lists.length + ' 张装箱单带出 ' + groups.size + ' 个品名，请补填单价');
  };

  const draft = useMemo(
    () => ({ customerId, period: period.format('YYYY-MM'), lines, payments }) as Statement,
    [customerId, period, lines, payments],
  );
  const total = statementAmount(draft.lines);
  const paid = statementPaid(draft);
  const due = unpaidOf(draft);

  const patchPayment = (idx: number, patch: Partial<PaymentRecord>) =>
    setPayments((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));

  const save = () => {
    if (!customerId) {
      message.error('请选择客户');
      return;
    }
    const validLines = lines.filter((l) => l.name.trim() && l.quantity > 0);
    if (!validLines.length) {
      message.error('至少需要一行有效明细（品名 + 数量）');
      return;
    }
    const st: Statement = {
      id: initial?.id ?? nextId(statements.map((s) => s.id), 'STA', { yearly: true }),
      customerId,
      period: period.format('YYYY-MM'),
      title: title.trim() || autoTitle(customerId, period),
      lines: validLines,
      status,
      confirmedAt: status === '已确认' ? (initial?.confirmedAt ?? dayjs().format('YYYY-MM-DD HH:mm')) : undefined,
      payments: payments.filter((p) => p.amount > 0),
      remark: remark.trim() || undefined,
    };
    saveStatement(st);
    message.success('对账单已保存：' + st.id + '（合计 ¥' + statementAmount(st.lines) + '）');
    onClose();
  };

  const lineColumns: ColumnsType<StatementLine> = [
    {
      title: '日期',
      width: 140,
      render: (_: unknown, l: StatementLine, idx: number) => (
        <DatePicker
          size="small"
          value={l.date ? dayjs(l.date) : null}
          onChange={(d) => patchLine(idx, { date: d ? d.format('YYYY-MM-DD') : '' })}
          style={{ width: '100%' }}
          allowClear={false}
        />
      ),
    },
    {
      title: '品名/工艺',
      render: (_: unknown, l: StatementLine, idx: number) => (
        <Input size="small" placeholder="如 冲锋衣 / 起版风衣" value={l.name} onChange={(e) => patchLine(idx, { name: e.target.value })} />
      ),
    },
    {
      title: '单位',
      width: 76,
      render: (_: unknown, l: StatementLine, idx: number) => (
        <Input size="small" value={l.unit} onChange={(e) => patchLine(idx, { unit: e.target.value })} />
      ),
    },
    {
      title: '数量',
      width: 92,
      render: (_: unknown, l: StatementLine, idx: number) => (
        <InputNumber size="small" min={0} precision={0} value={l.quantity} onChange={(v) => patchLine(idx, { quantity: v ?? 0 })} style={{ width: '100%' }} />
      ),
    },
    {
      title: '单价（元）',
      width: 100,
      render: (_: unknown, l: StatementLine, idx: number) => (
        <InputNumber size="small" min={0} precision={2} value={l.unitPrice} onChange={(v) => patchLine(idx, { unitPrice: v ?? 0 })} style={{ width: '100%' }} />
      ),
    },
    {
      title: '金额（元）',
      width: 90,
      render: (_: unknown, l: StatementLine) => <span className="tabular-nums">{round2(l.quantity * l.unitPrice)}</span>,
    },
    {
      title: '备注',
      width: 150,
      render: (_: unknown, l: StatementLine, idx: number) => (
        <Input size="small" placeholder="含1点税" value={l.remark} onChange={(e) => patchLine(idx, { remark: e.target.value || undefined })} />
      ),
    },
    {
      title: '',
      width: 44,
      render: (_: unknown, __: StatementLine, idx: number) => (
        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => removeLine(idx)} />
      ),
    },
  ];

  const payColumns: ColumnsType<PaymentRecord> = [
    {
      title: '收款日期',
      width: 150,
      render: (_: unknown, p: PaymentRecord, idx: number) => (
        <DatePicker
          size="small"
          value={p.date ? dayjs(p.date) : null}
          onChange={(d) => patchPayment(idx, { date: d ? d.format('YYYY-MM-DD') : '' })}
          style={{ width: '100%' }}
          allowClear={false}
        />
      ),
    },
    {
      title: '金额（元）',
      width: 120,
      render: (_: unknown, p: PaymentRecord, idx: number) => (
        <InputNumber size="small" min={0} precision={2} value={p.amount} onChange={(v) => patchPayment(idx, { amount: v ?? 0 })} style={{ width: '100%' }} />
      ),
    },
    {
      title: '说明',
      render: (_: unknown, p: PaymentRecord, idx: number) => (
        <Input size="small" placeholder="如 货款（60%）" value={p.note} onChange={(e) => patchPayment(idx, { note: e.target.value || undefined })} />
      ),
    },
    {
      title: '',
      width: 44,
      render: (_: unknown, __: PaymentRecord, idx: number) => (
        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => setPayments((prev) => prev.filter((_, i) => i !== idx))} />
      ),
    },
  ];

  return (
    <Modal
      title={initial ? '编辑对账单 · ' + initial.id : '新增对账单'}
      open={open}
      onCancel={onClose}
      width={1040}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={save}>
          保存
        </Button>,
      ]}
    >
      <Space wrap size={10} style={{ marginBottom: 12 }}>
        <Select
          showSearch
          placeholder="客户"
          style={{ width: 180 }}
          value={customerId}
          onChange={setCustomerId}
          options={customers.map((c) => ({ value: c.id, label: c.name }))}
          optionFilterProp="label"
        />
        <DatePicker picker="month" value={period} onChange={(d) => d && setPeriod(d)} style={{ width: 130 }} />
        <Select
          style={{ width: 100 }}
          value={status}
          onChange={setStatus}
          options={[
            { value: '待确认', label: '待确认' },
            { value: '已确认', label: '已确认' },
          ]}
        />
        <Input style={{ width: 300 }} placeholder="标题（自动生成可改）" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input style={{ width: 160 }} placeholder="备注（可空）" value={remark} onChange={(e) => setRemark(e.target.value)} />
      </Space>
      <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
        <Button size="small" icon={<PlusOutlined />} onClick={addLine}>
          加一行（手工录）
        </Button>
        <Button size="small" icon={<DownloadOutlined />} onClick={bringFromPacking} disabled={!customerId}>
          从{period.format('YYYY年M月')}装箱单带出件数
        </Button>
      </div>
      <Table size="small" rowKey={(_, i) => i ?? 0} columns={lineColumns} dataSource={lines} pagination={false} scroll={{ x: 'max-content' }} />
      <div style={{ margin: '12px 0 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <b>收款记录</b>
        <span className="tabular-nums" style={{ fontSize: 13 }}>
          合计金额：<b>¥{total}</b>　已收：<b>¥{paid}</b>　未收：<b style={{ color: '#c95656' }}>¥{due}</b>
          <span style={{ marginLeft: 12, fontWeight: 400, color: '#637674' }}>{rmbInWords(total)}</span>
        </span>
      </div>
      <Table size="small" rowKey={(_, i) => i ?? 0} columns={payColumns} dataSource={payments} pagination={false} />
      <Button
        size="small"
        icon={<PlusOutlined />}
        style={{ marginTop: 8 }}
        onClick={() => setPayments((prev) => [...prev, { date: dayjs().format('YYYY-MM-DD'), amount: 0 }])}
      >
        添加收款
      </Button>
    </Modal>
  );
}


