/**
 * mock 数据与 calc 工具一致性自检（不参与 tsc/vite build）：
 * 运行：npx esbuild scripts/check-data.ts --bundle --format=cjs --outfile=scripts/check-data.cjs && node scripts/check-data.cjs
 */
import type { PackingStatus } from '../src/types';
import dayjs from 'dayjs';
import { mockCustomers } from '../src/mocks/customers';
import { mockPackingLists } from '../src/mocks/packingLists';
import { mockStatements } from '../src/mocks/statements';
import { mockStyles } from '../src/mocks/styles';
import { cartonCount, packingGrandQty, packingQtyBySize, rmbInWords, statementAmount, unpaidOf } from '../src/utils/calc';

let issues = 0;
const warn = (...args: unknown[]) => {
  issues++;
  console.log('❌', ...args);
};

// ① J34 样例装箱单（逐箱复刻，勿改数字）
const j34 = mockPackingLists.find((p) => p.styleNo === 'J34' && p.date === '2026-06-21');
if (!j34) {
  warn('未找到 J34 样例装箱单（2026-06-21）');
} else {
  const bySize = packingQtyBySize(j34);
  console.log('J34 各码合计:', bySize, ' 总件:', packingGrandQty(j34), ' 箱数:', cartonCount(j34));
  if (cartonCount(j34) !== 11) warn('J34 箱数应为 11，实际', cartonCount(j34));
  if (packingGrandQty(j34) !== 505) warn('J34 总件数应为 505，实际', packingGrandQty(j34));
  const expect: Record<string, number> = { S: 140, M: 160, L: 170, XL: 30, XXL: 5 };
  Object.entries(expect).forEach(([sz, v]) => {
    if ((bySize[sz] ?? 0) !== v) warn('J34 ' + sz + ' 码合计应为 ' + v + '，实际', bySize[sz]);
  });
  const cust = mockCustomers.find((c) => c.id === j34.customerId);
  if (cust?.name !== '旺兆') warn('J34 客户应为 旺兆，实际', cust?.name);
  if (j34.status !== '已出货') warn('J34 状态应为 已出货，实际', j34.status);
  j34.cartons.forEach((c, i) => {
    if (c.cartonNo !== i + 1) warn('J34 箱号不连续:', c.cartonNo);
  });
}

// ② 旺兆 2025-12 对账单（逐行复刻，合计 8000）
const wz = mockStatements.find((s) => s.period === '2025-12');
if (!wz) {
  warn('未找到旺兆 2025-12 对账单');
} else {
  const amt = statementAmount(wz.lines);
  console.log('旺兆对账单金额:', amt, ' 未收:', unpaidOf(wz));
  if (amt !== 8000) warn('对账单合计应为 8000，实际', amt);
  if (wz.lines.length !== 2) warn('样例对账单应为 2 行，实际', wz.lines.length);
  else {
    if (statementAmount([wz.lines[0]]) !== 4000) warn('第一行金额应为 4000');
    if (statementAmount([wz.lines[1]]) !== 4000) warn('第二行金额应为 4000');
  }
  if (unpaidOf(wz) !== 8000) warn('旺兆对账单应未收款 8000，实际', unpaidOf(wz));
  if (wz.status !== '已确认') warn('旺兆对账单应已确认');
  if (wz.title !== '旺兆 2025年12月份客户对帐单') warn('对账单标题不符:', wz.title);
}

// ③ 全部装箱单：箱号从 1 连续、总件 > 0
console.log('装箱单总数:', mockPackingLists.length, ' 对账单总数:', mockStatements.length);
mockPackingLists.forEach((pl) => {
  pl.cartons.forEach((c, i) => {
    if (c.cartonNo !== i + 1) warn('箱号不连续:', pl.id, '第', i + 1, '行箱号', c.cartonNo);
  });
  if (packingGrandQty(pl) <= 0) warn('装箱单总件数为 0:', pl.id);
});

// ④ 装箱单状态覆盖：草稿/已出货/已对账/已取消
const statusSet = new Set<string>(mockPackingLists.map((p) => p.status));
(['草稿', '已出货', '已对账', '已取消'] as PackingStatus[]).forEach((s) => {
  if (!statusSet.has(s)) warn('缺少装箱单状态覆盖:', s);
});
console.log(
  '状态分布:',
  mockPackingLists.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {}),
);

// ⑤ 对账单：未收 ≥ 0，且至少一张未收 > 0（仪表盘应收才有数据）
let hasUnpaid = false;
mockStatements.forEach((st) => {
  const due = unpaidOf(st);
  if (due < -0.01) warn('对账单超收:', st.id, due);
  if (due > 0.005) hasUnpaid = true;
});
if (!hasUnpaid) warn('没有任何未收款对账单，仪表盘应收为空');

// ⑥ 月份覆盖：近 6 个月（含本月）
const periods = new Set(mockPackingLists.map((p) => p.date.slice(0, 7)));
console.log('装箱单覆盖月份:', [...periods].sort().join(', '));
if (periods.size < 6) warn('装箱单月份覆盖不足 6 个月');

// ⑦ 人民币大写
console.log('rmbInWords(0)       =', rmbInWords(0));
console.log('rmbInWords(10)      =', rmbInWords(10));
console.log('rmbInWords(100000)  =', rmbInWords(100000));
console.log('rmbInWords(8000)    =', rmbInWords(8000));
console.log('rmbInWords(1234.56) =', rmbInWords(1234.56));
console.log('rmbInWords(1000.05) =', rmbInWords(1000.05));
const rmbExpect: [number, string][] = [
  [0, '人民币零元整'],
  [10, '人民币壹拾元整'],
  [100000, '人民币壹拾万元整'],
  [8000, '人民币捌仟元整'],
  [1234.56, '人民币壹仟贰佰叁拾肆元伍角陆分'],
  [1000.05, '人民币壹仟元零伍分'],
];
rmbExpect.forEach(([n, expectStr]) => {
  if (rmbInWords(n) !== expectStr) warn('rmbInWords(' + n + ') 应为 ' + expectStr + '，实际', rmbInWords(n));
});

// ⑧ 款号唯一性（styleNo 不可重复）
const styleNos = new Set(mockStyles.map((s) => s.styleNo));
if (styleNos.size !== mockStyles.length) warn('款号存在重复');

// ⑨ 本月数据非 0（仪表盘「本月」口径，日期锚定 dayjs()）
const nowMonth = dayjs().format('YYYY-MM');
const monthActive = mockPackingLists.filter((p) => dayjs(p.date).isSame(nowMonth, 'month') && p.status !== '已取消');
const monthShipped = mockPackingLists.filter(
  (p) => dayjs(p.date).isSame(nowMonth, 'month') && (p.status === '已出货' || p.status === '已对账'),
);
const monthQty = monthShipped.reduce((s, p) => s + packingGrandQty(p), 0);
console.log('本月装箱单（非取消）:', monthActive.length, ' 本月出货件数:', monthQty);
if (monthActive.length === 0) warn('本月没有任何有效装箱单，仪表盘「本月装箱单数」将为 0');
if (monthQty <= 0) warn('本月出货件数为 0，仪表盘「本月出货件数」将为 0');
const monthStatement = mockStatements.find((s) => s.period === nowMonth);
if (!monthStatement) {
  warn('缺少本月（' + nowMonth + '）对账单，仪表盘「本月对账金额」将为 0');
} else {
  console.log('本月对账单:', monthStatement.id, ' 金额:', statementAmount(monthStatement.lines));
}

console.log(issues === 0 ? '✅ 全部校验通过' : `⚠ 共 ${issues} 个问题`);
