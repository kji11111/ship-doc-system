import dayjs from 'dayjs';
import type { Statement, StatementLine } from '../types';
import { createRng, pick } from './rng';
import { mockCustomers } from './customers';
import { mockStyles } from './styles';
import { round2 } from '../utils/calc';

/**
 * 对账单 mock：第一张逐行复刻用户样例（旺兆 2025-12，合计 8000，已确认、未收款，勿改数字），
 * 其余覆盖近几个月，部分带收款（未收≠0，供仪表盘应收统计）。
 */
const rng = createRng(20261116);

/** 用户样例复刻：旺兆 2025年12月份客户对帐单（起版风衣/裤子各 8×500），合计 8000 */
const sampleStatement: Statement = {
  id: 'STA2025-001',
  customerId: 'CU0001',
  period: '2025-12',
  title: '旺兆 2025年12月份客户对帐单',
  lines: [
    { date: '2025-12-10', name: '起版风衣', unit: '件', quantity: 8, unitPrice: 500, remark: '含1点税' },
    { date: '2025-12-10', name: '起版裤子', unit: '件', quantity: 8, unitPrice: 500 },
  ],
  status: '已确认',
  confirmedAt: '2025-12-20 10:30',
};

/** 对账单标题：旺兆 2025年12月份客户对帐单 */
function titleOf(customerName: string, period: string): string {
  const [y, m] = period.split('-');
  return customerName + ' ' + y + '年' + Number(m) + '月份客户对帐单';
}

interface Draft {
  customerId: string;
  period: string;
  pay: 'none' | 'partial' | 'full';
  confirmed: boolean;
}

const drafts: Draft[] = [
  { customerId: 'CU0002', period: dayjs().subtract(4, 'month').format('YYYY-MM'), pay: 'full', confirmed: true },
  { customerId: 'CU0003', period: dayjs().subtract(2, 'month').format('YYYY-MM'), pay: 'partial', confirmed: true },
  { customerId: 'CU0004', period: dayjs().subtract(1, 'month').format('YYYY-MM'), pay: 'none', confirmed: true },
  { customerId: 'CU0005', period: dayjs().format('YYYY-MM'), pay: 'none', confirmed: false },
];

function buildStatement(d: Draft, seq: number): Statement {
  const customer = mockCustomers.find((c) => c.id === d.customerId);
  const lineCount = 2 + Math.floor(rng() * 2); // 2~3 行
  const lines: StatementLine[] = [];
  for (let i = 0; i < lineCount; i++) {
    const st = pick(rng, mockStyles);
    lines.push({
      date: d.period + '-' + String(2 + Math.floor(rng() * 26)).padStart(2, '0'),
      name: st.name,
      unit: st.unit,
      quantity: 100 + Math.floor(rng() * 700),
      unitPrice: st.bulkPrice ?? 30,
      remark: rng() > 0.5 ? '含1点税' : undefined,
    });
  }
  const total = round2(lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0));
  const payments: Statement['payments'] = [];
  if (d.pay === 'partial') {
    payments.push({
      date: d.period + '-' + String(15 + Math.floor(rng() * 13)).padStart(2, '0'),
      amount: round2(total * (0.3 + rng() * 0.4)),
      note: '部分货款',
    });
  } else if (d.pay === 'full') {
    const p1Date = d.period + '-' + String(15 + Math.floor(rng() * 10)).padStart(2, '0');
    const p1 = round2(total * 0.6);
    payments.push({ date: p1Date, amount: p1, note: '货款（60%）' });
    payments.push({
      date: dayjs(p1Date).add(10 + Math.floor(rng() * 10), 'day').format('YYYY-MM-DD'),
      amount: round2(total - p1),
      note: '货款结清',
    });
  }
  return {
    id: 'STA' + d.period.slice(0, 4) + '-' + String(seq).padStart(3, '0'),
    customerId: d.customerId,
    period: d.period,
    title: titleOf(customer?.name ?? d.customerId, d.period),
    lines,
    status: d.confirmed ? '已确认' : '待确认',
    confirmedAt: d.confirmed ? d.period + '-28 10:00' : undefined,
    payments: payments.length ? payments : undefined,
  };
}

export const mockStatements: Statement[] = [
  sampleStatement,
  ...drafts
    .slice()
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((d, i) => buildStatement(d, i + 1)),
];
