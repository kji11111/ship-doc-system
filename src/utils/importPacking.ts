import dayjs from 'dayjs';
import type { PackingCarton } from '../types';

/** 识别为尺码列的表头（小写比对；花型/备注/合计/体积列不在此列） */
const KNOWN_SIZES = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', '2xl', '3xl', '4xl', '均码', 'f', 'free'];

export interface PackingParseResult {
  ok: boolean;
  error?: string;
  sourceTitle?: string; // 顶部标题（如 科诚无缝出货装箱单）
  productName?: string;
  styleNo?: string;
  date?: string; // YYYY-MM-DD（尽力解析）
  orderNo?: string;
  customerName?: string;
  sizeScale: string[];
  cartons: PackingCarton[];
}

/** Excel 日期序列号 → YYYY-MM-DD */
function serialToDateString(n: number): string {
  const ms = (n - 25569) * 86400 * 1000;
  return dayjs(ms).format('YYYY-MM-DD');
}

/** 单元格值 → 字符串（trim；Date 转日期字符串） */
function cellText(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return dayjs(v).format('YYYY-MM-DD');
  return String(v).trim();
}

/** 单元格值 → 正整数（空/非法返回 undefined） */
function cellQty(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = typeof v === 'number' ? v : parseInt(String(v).replace(/[^\d.-]/g, ''), 10);
  if (Number.isNaN(n) || n <= 0) return undefined;
  return Math.round(n);
}

/** 解析日期值（Date / 序列号 / 2026-06-21 / 2026/6/21 / 2026.6.21 / 2026年6月21日） */
function parseDateValue(v: unknown): string | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  if (v instanceof Date) return dayjs(v).format('YYYY-MM-DD');
  if (typeof v === 'number' && v > 20000 && v < 80000) return serialToDateString(v);
  const s = String(v).trim();
  const m = s.match(/(\d{4})[年./\-](\d{1,2})[月./\-](\d{1,2})/);
  if (m) {
    const d = dayjs(`${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`);
    if (d.isValid()) return d.format('YYYY-MM-DD');
  }
  const d2 = dayjs(s);
  return d2.isValid() ? d2.format('YYYY-MM-DD') : undefined;
}

/** 在一行里找「标签」对应的值：优先同格冒号后，其次同行右侧第一个非空且非标签的单元格 */
function pickLabeledValue(row: unknown[], test: (s: string) => boolean): unknown {
  for (let i = 0; i < row.length; i++) {
    const text = cellText(row[i]);
    if (!text || !test(text)) continue;
    const inline = text.match(/[:：]\s*(.+)$/);
    if (inline && inline[1].trim()) return inline[1].trim();
    for (let j = i + 1; j < row.length; j++) {
      const next = cellText(row[j]);
      if (!next) continue;
      if (/[:：]/.test(next) || /^(品名|款号|日期|单号|客户|订单)/.test(next)) return undefined; // 碰到下一个标签
      return row[j];
    }
    return undefined;
  }
  return undefined;
}

/**
 * 解析「科诚无缝出货装箱单」式工作表：
 * 顶部标题/公司名行 → 品名/款号/日期/单号（标签:值 或 标签+相邻值）→
 * 表头行（箱号/花型色别/尺码列…/备注/合计/箱体积）→ 逐箱行 → 合计行（自动跳过）。
 * 建议以 cellDates:true 读入工作簿后传 sheet_to_json(header:1) 的二维数组。
 */
export function parsePackingSheet(rows: unknown[][]): PackingParseResult {
  const fail = (error: string): PackingParseResult => ({ ok: false, error, sizeScale: [], cartons: [] });
  if (!rows.length) return fail('表格为空');

  // 1. 找表头行（包含「箱号」）
  const headerIdx = rows.findIndex((row) => row.some((c) => cellText(c).includes('箱号')));
  if (headerIdx < 0) return fail('未找到表头行（缺少「箱号」列）');
  const header = rows[headerIdx];

  // 2. 列映射：箱号/花型色别/备注/箱体积 + 尺码列（跳过合计列）
  let colCarton = -1;
  let colColor = -1;
  let colRemark = -1;
  let colVolume = -1;
  const sizeCols: { label: string; index: number }[] = [];
  header.forEach((cell, idx) => {
    const raw = cellText(cell);
    const text = raw.toLowerCase().replace(/\s/g, '');
    if (!text) return;
    if (text.includes('箱号')) colCarton = idx;
    else if (text.includes('花型') || text.includes('色别') || text.includes('颜色')) colColor = idx;
    else if (text.includes('备注')) colRemark = idx;
    else if (text.includes('体积') || text.includes('cbm') || text === 'm3' || text === 'm³') colVolume = idx;
    else if (text.includes('合计') || text.includes('总计') || text.includes('小计')) return;
    else if (KNOWN_SIZES.includes(text)) sizeCols.push({ label: raw, index: idx });
  });
  if (colCarton < 0) return fail('表头缺少「箱号」列');
  if (!sizeCols.length) return fail('表头未识别到任何尺码列（S/M/L/XL/XXL…）');

  // 3. 顶部元信息（品名/款号/日期/单号/客户）+ 标题
  const grab = (test: (s: string) => boolean): unknown => {
    for (let r = 0; r < headerIdx; r++) {
      const v = pickLabeledValue(rows[r], test);
      if (v !== undefined && v !== null && cellText(v) !== '') return v;
    }
    return undefined;
  };
  const firstRowText = rows[0].map(cellText).find((t) => t);
  let sourceTitle = firstRowText;
  if (sourceTitle && (sourceTitle.includes('品名') || sourceTitle.includes('款号') || sourceTitle.includes('日期'))) {
    sourceTitle = undefined; // 首行是元信息而非标题
  }
  const productName = cellText(grab((s) => s.includes('品名') || s.includes('产品名称'))) || undefined;
  const styleNo = cellText(grab((s) => s.includes('款号') || s.includes('款式'))) || undefined;
  const orderNo = cellText(grab((s) => s.includes('单号') || s.toUpperCase().includes('PO#'))) || undefined;
  const customerName = cellText(grab((s) => s.includes('客户'))) || undefined;
  const date = parseDateValue(grab((s) => s.includes('日期') || s.includes('出货日')));

  // 4. 逐箱行；遇「合计」行结束
  const cartons: PackingCarton[] = [];
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    const cartonCell = cellText(row[colCarton]);
    if (!cartonCell) continue;
    if (/^(合计|总计|小计|total)/i.test(cartonCell)) break;
    const no = cellQty(row[colCarton]);
    if (no === undefined) continue; // 非数据行，跳过
    const sizes: Record<string, number> = {};
    sizeCols.forEach(({ label, index }) => {
      const q = cellQty(row[index]);
      if (q) sizes[label] = q;
    });
    cartons.push({
      cartonNo: no,
      color: colColor >= 0 ? cellText(row[colColor]) : '',
      sizes,
      volume: colVolume >= 0 ? cellText(row[colVolume]) || undefined : undefined,
      remark: colRemark >= 0 ? cellText(row[colRemark]) || undefined : undefined,
    });
  }
  if (!cartons.length) return fail('未解析到任何箱行（表头下方没有「箱号+数字」的数据行）');
  return { ok: true, sourceTitle, productName, styleNo, date, orderNo, customerName, sizeScale: sizeCols.map((s) => s.label), cartons };
}

