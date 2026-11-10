/**
 * 导入解析端到端自检：按「科诚无缝出货装箱单」版式合成 xlsx → 落盘 →
 * 用与页面一致的读取路径（XLSX.read + sheet_to_json header:1 → parsePackingSheet）断言。
 * 运行：npx esbuild scripts/test-import.ts --bundle --format=cjs --outfile=scripts/test-import.cjs && node scripts/test-import.cjs
 */
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx-js-style';
import { parsePackingSheet } from '../src/utils/importPacking';
import { packingGrandQty, packingQtyBySize } from '../src/utils/calc';

let issues = 0;
const warn = (...args: unknown[]) => {
  issues++;
  console.log('❌', ...args);
};

// 1. 合成「科诚无缝出货装箱单」版式（J34 样例，11 箱 = 505 件）
const cartons: (string | number | null)[][] = [
  [1, '黑色', 45, null, null, null, null, null, 45, null],
  [2, '黑色', 15, 30, null, null, null, null, 45, null],
  [3, '黑色', null, 30, 15, null, null, null, 45, null],
  [4, '黑色', null, null, 45, null, null, null, 45, null],
  [5, '黑色', null, null, 10, 30, 5, null, 45, null],
  [6, '紫色', 40, 10, null, null, null, null, 50, null],
  [7, '紫色', null, 40, 5, null, null, null, 45, null],
  [8, '紫色', null, null, 45, null, null, null, 45, null],
  [9, '米白', 40, 10, null, null, null, null, 50, null],
  [10, '米白', null, 40, 5, null, null, null, 45, null],
  [11, '米白', null, null, 45, null, null, null, 45, null],
];
const aoa: (string | number | null)[][] = [
  ['科诚无缝出货装箱单'],
  ['示例服装加工场'],
  ['品名：冲锋衣', null, '款号：J34', null, '日期：2026-06-21', null, '单号：', null, '客户：旺兆'],
  [],
  ['箱号', '花型色别', 'S', 'M', 'L', 'XL', 'XXL', '备注', '合计', '箱体积'],
  ...cartons,
  ['合计', null, 140, 160, 170, 30, 5, null, 505, null],
  ['（以下空白）'],
];
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(aoa);
ws['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
  { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
];
XLSX.utils.book_append_sheet(wb, ws, '装箱单');

// 2. 落盘成真实 xlsx 文件
const outPath = path.join(__dirname, 'packing-fixture.xlsx');
const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
fs.writeFileSync(outPath, buf);
console.log('合成样例已写入:', outPath);

// 3. 用页面同款路径读回并解析
const read = XLSX.read(fs.readFileSync(outPath), { type: 'buffer', cellDates: true });
const sheet = read.Sheets[read.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null });
const r = parsePackingSheet(rows as unknown[][]);

// 4. 断言
if (!r.ok) {
  warn('解析失败：' + r.error);
} else {
  console.log('解析结果: 品名=' + r.productName, '款号=' + r.styleNo, '日期=' + r.date, '客户=' + r.customerName);
  console.log('尺码列:', r.sizeScale.join(' '), ' 箱数:', r.cartons.length);
  const bySize = packingQtyBySize({ sizeScale: r.sizeScale, cartons: r.cartons } as never);
  const grand = packingGrandQty({ sizeScale: r.sizeScale, cartons: r.cartons } as never);
  console.log('各码合计:', bySize, ' 总件:', grand);
  if (r.productName !== '冲锋衣') warn('品名应为 冲锋衣，实际', r.productName);
  if (r.styleNo !== 'J34') warn('款号应为 J34，实际', r.styleNo);
  if (r.date !== '2026-06-21') warn('日期应为 2026-06-21，实际', r.date);
  if (r.customerName !== '旺兆') warn('客户应为 旺兆，实际', r.customerName);
  if (r.sizeScale.join(',') !== 'S,M,L,XL,XXL') warn('尺码列不符', r.sizeScale);
  if (r.cartons.length !== 11) warn('箱数应为 11，实际', r.cartons.length);
  const expect: Record<string, number> = { S: 140, M: 160, L: 170, XL: 30, XXL: 5 };
  Object.entries(expect).forEach(([sz, v]) => {
    if ((bySize[sz] ?? 0) !== v) warn(sz + ' 码合计应为 ' + v + '，实际', bySize[sz]);
  });
  if (grand !== 505) warn('总件数应为 505，实际', grand);
  r.cartons.forEach((c, i) => {
    if (c.cartonNo !== i + 1) warn('箱号不连续:', c.cartonNo);
  });
}

console.log(issues === 0 ? '✅ 导入解析全部断言通过' : `⚠ 共 ${issues} 个问题`);
