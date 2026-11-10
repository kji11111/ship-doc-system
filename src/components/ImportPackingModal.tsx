import { useEffect, useState } from 'react';
import { App as AntApp, Alert, Button, DatePicker, Input, Modal, Select, Space, Table, Upload } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { InboxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';
import type { PackingCarton, PackingList } from '../types';
import { nextId, useStore } from '../store/AppStore';
import { cartonQty, packingGrandQty, packingQtyBySize } from '../utils/calc';
import { parsePackingSheet } from '../utils/importPacking';
import type { PackingParseResult } from '../utils/importPacking';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** 导入「科诚无缝出货装箱单」式 Excel：解析 → 预览（可补元信息）→ 确认入库 */
export default function ImportPackingModal({ open, onClose }: Props) {
  const { customers, packingLists, savePackingList } = useStore();
  const { message } = AntApp.useApp();

  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<PackingParseResult | null>(null);
  const [productName, setProductName] = useState('');
  const [styleNo, setStyleNo] = useState('');
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [orderNo, setOrderNo] = useState('');
  const [customerId, setCustomerId] = useState<string | undefined>();

  useEffect(() => {
    if (!open) {
      setResult(null);
      setError('');
      setFileName('');
    }
  }, [open]);

  const applyResult = (r: PackingParseResult) => {
    setResult(r);
    setProductName(r.productName ?? '');
    setStyleNo(r.styleNo ?? '');
    setDate(r.date ? dayjs(r.date) : null);
    setOrderNo(r.orderNo ?? '');
    const m = r.customerName
      ? customers.find((c) => c.name === r.customerName || (r.customerName && c.name.includes(r.customerName)))
      : undefined;
    setCustomerId(m?.id);
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setError('');
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array', cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });
      const r = parsePackingSheet(rows as unknown[][]);
      if (!r.ok) {
        setError(r.error ?? '解析失败');
        setResult(null);
        return;
      }
      applyResult(r);
    } catch (e) {
      setError('读取文件失败：' + (e as Error).message);
      setResult(null);
    }
  };

  const confirm = () => {
    if (!result) return;
    if (!productName.trim()) {
      message.error('请填写品名');
      return;
    }
    if (!date) {
      message.error('请选择出货日期');
      return;
    }
    const pl: PackingList = {
      id: nextId(packingLists.map((p) => p.id), 'PL', { yearly: true }),
      customerId,
      date: date.format('YYYY-MM-DD'),
      productName: productName.trim(),
      styleNo: styleNo.trim(),
      orderNo: orderNo.trim() || undefined,
      sizeScale: result.sizeScale,
      cartons: result.cartons,
      status: '草稿',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
    };
    savePackingList(pl);
    message.success('导入成功：' + pl.id + '，共 ' + result.cartons.length + ' 箱 ' + packingGrandQty(pl) + ' 件');
    onClose();
  };

  const previewDraft = result ? ({ sizeScale: result.sizeScale, cartons: result.cartons } as PackingList) : null;
  const bySize = previewDraft ? packingQtyBySize(previewDraft) : {};
  const grand = previewDraft ? packingGrandQty(previewDraft) : 0;

  const previewColumns: ColumnsType<PackingCarton> = [
    { title: '箱号', dataIndex: 'cartonNo', width: 64 },
    { title: '花型色别', dataIndex: 'color', width: 100, render: (v: string) => v || '' },
    ...(result?.sizeScale.map((sz) => ({
      title: sz,
      width: 70,
      render: (_: unknown, c: PackingCarton) => <span className="tabular-nums">{c.sizes[sz] ?? ''}</span>,
    })) ?? []),
    { title: '合计', width: 70, render: (_: unknown, c: PackingCarton) => <span className="tabular-nums">{cartonQty(c)}</span> },
  ];

  return (
    <Modal
      title="导入装箱单 Excel"
      open={open}
      onCancel={onClose}
      width={880}
      footer={
        result
          ? [
              <Button key="cancel" onClick={onClose}>
                取消
              </Button>,
              <Button key="ok" type="primary" onClick={confirm}>
                确认导入（{result.cartons.length} 箱 / {grand} 件）
              </Button>,
            ]
          : [
              <Button key="close" onClick={onClose}>
                关闭
              </Button>,
            ]
      }
    >
      <Upload.Dragger
        accept=".xlsx,.xls"
        maxCount={1}
        showUploadList={false}
        beforeUpload={(file) => {
          void handleFile(file);
          return false;
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖入「科诚无缝出货装箱单」Excel（.xlsx / .xls）</p>
        <p className="ant-upload-hint">识别：标题行 → 品名/款号/日期/单号 → 箱号+花型色别+尺码列；自动跳过合计行，空码不记 0</p>
      </Upload.Dragger>
      {fileName && (
        <div style={{ marginTop: 10, fontSize: 13, color: '#637674' }}>
          已选择：{fileName}
          {result?.sourceTitle ? '（识别到标题：' + result.sourceTitle + '）' : ''}
        </div>
      )}
      {error && (
        <Alert type="error" showIcon message={error} style={{ marginTop: 10 }} />
      )}
      {result && (
        <>
          <Space wrap size={10} style={{ marginTop: 12 }}>
            <Input addonBefore="品名" style={{ width: 220 }} value={productName} onChange={(e) => setProductName(e.target.value)} />
            <Input addonBefore="款号" style={{ width: 180 }} value={styleNo} onChange={(e) => setStyleNo(e.target.value)} />
            <DatePicker value={date} onChange={(d) => setDate(d)} placeholder="出货日期" style={{ width: 140 }} />
            <Input addonBefore="单号" style={{ width: 200 }} value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
            <Select
              allowClear
              showSearch
              placeholder="关联客户（可空）"
              style={{ width: 160 }}
              value={customerId}
              onChange={setCustomerId}
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
              optionFilterProp="label"
            />
          </Space>
          <Table
            size="small"
            style={{ marginTop: 12 }}
            rowKey="cartonNo"
            pagination={false}
            scroll={{ y: 280 }}
            dataSource={result.cartons}
            columns={previewColumns}
          />
          <div style={{ marginTop: 10, textAlign: 'right' }}>
            <Space size={16} wrap>
              {result.sizeScale.map((sz) => (
                <span key={sz} className="tabular-nums" style={{ fontSize: 13 }}>
                  {sz}：<b>{bySize[sz] || 0}</b>
                </span>
              ))}
              <span className="tabular-nums" style={{ fontSize: 13 }}>
                总件数：<b>{grand}</b>
              </span>
            </Space>
          </div>
        </>
      )}
    </Modal>
  );
}

