import { useEffect, useMemo, useState } from 'react';
import { App as AntApp, AutoComplete, Button, DatePicker, Input, InputNumber, Modal, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { PackingCarton, PackingList, PackingStatus } from '../types';
import { nextId, useStore } from '../store/AppStore';
import { cartonQty, packingGrandQty, packingQtyBySize } from '../utils/calc';

const STATUS_OPTIONS: { value: PackingStatus; label: string }[] = [
  { value: '草稿', label: '草稿' },
  { value: '已出货', label: '已出货' },
  { value: '已对账', label: '已对账' },
  { value: '已取消', label: '已取消' },
];

interface Props {
  open: boolean;
  initial: PackingList | null; // null = 新增
  onClose: () => void;
}

/** 装箱单编辑器：一行一箱，尺码列可配，底部各码合计与总件数实时计算 */
export default function PackingListEditor({ open, initial, onClose }: Props) {
  const { styles, customers, packingLists, savePackingList } = useStore();
  const { message } = AntApp.useApp();

  const [customerId, setCustomerId] = useState<string | undefined>();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [productName, setProductName] = useState('');
  const [styleNo, setStyleNo] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [sizeScale, setSizeScale] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL']);
  const [status, setStatus] = useState<PackingStatus>('草稿');
  const [remark, setRemark] = useState('');
  const [cartons, setCartons] = useState<PackingCarton[]>([]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setCustomerId(initial.customerId);
      setDate(dayjs(initial.date));
      setProductName(initial.productName);
      setStyleNo(initial.styleNo);
      setOrderNo(initial.orderNo ?? '');
      setSizeScale(initial.sizeScale.length ? initial.sizeScale : ['S', 'M', 'L', 'XL', 'XXL']);
      setStatus(initial.status);
      setRemark(initial.remark ?? '');
      setCartons(initial.cartons.map((c) => ({ ...c, sizes: { ...c.sizes } })));
    } else {
      setCustomerId(undefined);
      setDate(dayjs());
      setProductName('');
      setStyleNo('');
      setOrderNo('');
      setSizeScale(['S', 'M', 'L', 'XL', 'XXL']);
      setStatus('草稿');
      setRemark('');
      setCartons([{ cartonNo: 1, color: '', sizes: {} }]);
    }
  }, [open, initial]);

  /** 选中款号时带出颜色候选 */
  const style = useMemo(() => styles.find((s) => s.styleNo === styleNo), [styles, styleNo]);
  const colorOptions = useMemo(() => {
    const set = new Set<string>(style?.colors ?? []);
    cartons.forEach((c) => c.color && set.add(c.color));
    return [...set].map((v) => ({ value: v }));
  }, [style, cartons]);

  const renumber = (list: PackingCarton[]): PackingCarton[] => list.map((c, i) => ({ ...c, cartonNo: i + 1 }));
  const addCarton = () => setCartons((prev) => renumber([...prev, { cartonNo: prev.length + 1, color: '', sizes: {} }]));
  const removeCarton = (idx: number) => setCartons((prev) => renumber(prev.filter((_, i) => i !== idx)));
  const patchCarton = (idx: number, patch: Partial<PackingCarton>) =>
    setCartons((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  const patchSize = (idx: number, size: string, value: number | undefined) =>
    setCartons((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        const sizes = { ...c.sizes };
        if (value && value > 0) sizes[size] = value;
        else delete sizes[size];
        return { ...c, sizes };
      }),
    );

  /** 实时合计（只依赖 sizeScale + cartons） */
  const draft = useMemo(() => ({ sizeScale, cartons }) as PackingList, [sizeScale, cartons]);
  const bySize = useMemo(() => packingQtyBySize(draft), [draft]);
  const grand = useMemo(() => packingGrandQty(draft), [draft]);

  const save = () => {
    if (!productName.trim()) {
      message.error('请填写品名');
      return;
    }
    if (!cartons.length) {
      message.error('至少需要一行箱明细');
      return;
    }
    const pl: PackingList = {
      id: initial?.id ?? nextId(packingLists.map((p) => p.id), 'PL', { yearly: true }),
      customerId,
      date: date.format('YYYY-MM-DD'),
      productName: productName.trim(),
      styleNo: styleNo.trim(),
      orderNo: orderNo.trim() || undefined,
      sizeScale,
      cartons: renumber(cartons),
      status,
      remark: remark.trim() || undefined,
      createdAt: initial?.createdAt ?? dayjs().format('YYYY-MM-DD HH:mm'),
    };
    savePackingList(pl);
    message.success('装箱单已保存：' + pl.id + '（' + cartons.length + ' 箱 ' + grand + ' 件）');
    onClose();
  };

  const sizeColumns: ColumnsType<PackingCarton> = sizeScale.map((sz) => ({
    title: sz,
    width: 84,
    render: (_: unknown, c: PackingCarton, idx: number) => (
      <InputNumber min={0} precision={0} value={c.sizes[sz]} onChange={(v) => patchSize(idx, sz, v ?? undefined)} style={{ width: '100%' }} />
    ),
  }));

  const columns: ColumnsType<PackingCarton> = [
    {
      title: '箱号',
      width: 60,
      fixed: 'left',
      render: (_: unknown, __: PackingCarton, idx: number) => <span className="tabular-nums">{idx + 1}</span>,
    },
    {
      title: '花型色别',
      width: 124,
      fixed: 'left',
      render: (_: unknown, c: PackingCarton, idx: number) => (
        <AutoComplete
          value={c.color}
          options={colorOptions}
          onChange={(v) => patchCarton(idx, { color: v })}
          style={{ width: '100%' }}
          placeholder="颜色"
          filterOption={(input, opt) => (String(opt?.value ?? '') as string).includes(input)}
        />
      ),
    },
    ...sizeColumns,
    {
      title: '备注',
      width: 140,
      render: (_: unknown, c: PackingCarton, idx: number) => (
        <Input value={c.remark} onChange={(e) => patchCarton(idx, { remark: e.target.value || undefined })} />
      ),
    },
    {
      title: '箱体积',
      width: 116,
      render: (_: unknown, c: PackingCarton, idx: number) => (
        <Input value={c.volume} placeholder="60*40*35" onChange={(e) => patchCarton(idx, { volume: e.target.value || undefined })} />
      ),
    },
    {
      title: '合计',
      width: 64,
      render: (_: unknown, c: PackingCarton) => <span className="tabular-nums">{cartonQty(c)}</span>,
    },
    {
      title: '',
      width: 48,
      render: (_: unknown, __: PackingCarton, idx: number) => (
        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => removeCarton(idx)} />
      ),
    },
  ];

  return (
    <Modal
      title={initial ? '编辑装箱单 · ' + initial.id : '新增装箱单'}
      open={open}
      onCancel={onClose}
      width={1120}
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
          allowClear
          showSearch
          placeholder="客户（可空）"
          style={{ width: 150 }}
          value={customerId}
          onChange={setCustomerId}
          options={customers.map((c) => ({ value: c.id, label: c.name }))}
          optionFilterProp="label"
        />
        <DatePicker value={date} onChange={(d) => d && setDate(d)} style={{ width: 130 }} />
        <Select
          showSearch
          allowClear
          placeholder="选款号带出"
          style={{ width: 170 }}
          value={styleNo || undefined}
          onChange={(v) => {
            setStyleNo(v ?? '');
            const st = styles.find((s) => s.styleNo === v);
            if (st) {
              setProductName(st.name);
              setSizeScale(st.sizeScale);
            }
          }}
          options={styles.map((s) => ({ value: s.styleNo, label: s.styleNo + ' ' + s.name }))}
          optionFilterProp="label"
        />
        <Input placeholder="品名" style={{ width: 120 }} value={productName} onChange={(e) => setProductName(e.target.value)} />
        <Input placeholder="客户单号（可空）" style={{ width: 150 }} value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
        <Select
          mode="tags"
          placeholder="尺码列"
          style={{ minWidth: 210 }}
          value={sizeScale}
          onChange={setSizeScale}
          options={['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '均码'].map((v) => ({ value: v }))}
          tokenSeparators={[',']}
        />
        <Select style={{ width: 96 }} value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <Input placeholder="备注（可空）" style={{ width: 150 }} value={remark} onChange={(e) => setRemark(e.target.value)} />
      </Space>
      <Table size="small" rowKey={(_, i) => i ?? 0} columns={columns} dataSource={cartons} pagination={false} scroll={{ x: 'max-content' }} />
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <Button icon={<PlusOutlined />} onClick={addCarton}>
          添加一行（共 {cartons.length} 箱）
        </Button>
        <Space size={16} wrap>
          {sizeScale.map((sz) => (
            <span key={sz} className="tabular-nums" style={{ fontSize: 13 }}>
              {sz}：<b>{bySize[sz] || 0}</b>
            </span>
          ))}
          <span className="tabular-nums" style={{ fontSize: 13 }}>
            总件数：<b>{grand}</b>
          </span>
        </Space>
      </div>
    </Modal>
  );
}

