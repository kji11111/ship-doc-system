import dayjs from 'dayjs';
import type { PackingCarton, PackingList, PackingStatus } from '../types';
import { createRng, pick, pickSome } from './rng';
import { mockCustomers } from './customers';
import { mockStyles } from './styles';

/**
 * 装箱单 mock：第一张逐箱复刻用户样例（J34 冲锋衣，2026-06-21，11 箱总件 505，勿改数字），
 * 其余固定种子程序化生成，锚点 = dayjs() 本月，覆盖含本月在内近 6 个月，状态覆盖全部 4 种。
 */
const rng = createRng(20261115);

/** 用户样例逐箱复刻：冲锋衣 J34 / 旺兆 / 11 箱 → S140 M160 L170 XL30 XXL5 = 505 件 */
const sampleCartons: PackingCarton[] = [
  { cartonNo: 1, color: '黑色', sizes: { S: 45 } },
  { cartonNo: 2, color: '黑色', sizes: { S: 15, M: 30 } },
  { cartonNo: 3, color: '黑色', sizes: { M: 30, L: 15 } },
  { cartonNo: 4, color: '黑色', sizes: { L: 45 } },
  { cartonNo: 5, color: '黑色', sizes: { L: 10, XL: 30, XXL: 5 } },
  { cartonNo: 6, color: '紫色', sizes: { S: 40, M: 10 } },
  { cartonNo: 7, color: '紫色', sizes: { M: 40, L: 5 } },
  { cartonNo: 8, color: '紫色', sizes: { L: 45 } },
  { cartonNo: 9, color: '米白', sizes: { S: 40, M: 10 } },
  { cartonNo: 10, color: '米白', sizes: { M: 40, L: 5 } },
  { cartonNo: 11, color: '米白', sizes: { L: 45 } },
];

/** 程序化生成一张装箱单的逐箱明细（每箱 1~3 个码有量，单码 30~60 件） */
function genCartons(sizeScale: string[], colors: string[]): PackingCarton[] {
  const n = 6 + Math.floor(rng() * 9); // 6~14 箱
  const cartons: PackingCarton[] = [];
  for (let i = 1; i <= n; i++) {
    const sizes: Record<string, number> = {};
    pickSome(rng, sizeScale, 1 + Math.floor(rng() * 3)).forEach((sz) => {
      sizes[sz] = 30 + Math.floor(rng() * 31);
    });
    const v = rng();
    cartons.push({
      cartonNo: i,
      color: pick(rng, colors),
      sizes,
      volume: v > 0.66 ? '60*40*35' : v > 0.33 ? '50*40*30' : undefined,
      remark: rng() > 0.93 ? '外箱破损，已更换' : undefined,
    });
  }
  return cartons;
}

interface Draft {
  customerId?: string;
  date: string;
  productName: string;
  styleNo: string;
  orderNo?: string;
  sizeScale: string[];
  cartons: PackingCarton[];
  status: PackingStatus;
  remark?: string;
}

const drafts: Draft[] = [];

// ① 样例复刻（J34，旺兆，2026-06-21，已出货）
drafts.push({
  customerId: 'CU0001',
  date: '2026-06-21',
  productName: '冲锋衣',
  styleNo: 'J34',
  sizeScale: ['S', 'M', 'L', 'XL', 'XXL'],
  cartons: sampleCartons,
  status: '已出货',
});

// ② 程序化生成：近 6 个月（锚点 = 本月），状态按月龄分布；本月保证有已出货与草稿
const monthStart = dayjs().startOf('month').subtract(5, 'month');
const monthCount = [2, 2, 2, 2, 3, 3];
const monthStatus: PackingStatus[][] = [
  ['已对账', '已对账', '已对账'],
  ['已对账', '已对账'],
  ['已出货', '已出货', '已出货'],
  ['已出货', '已出货'],
  ['已出货', '草稿', '草稿'],
  ['已出货', '已出货', '草稿'],
];
const dayPool = [4, 14, 24];
for (let m = 0; m < 6; m++) {
  const base = monthStart.add(m, 'month');
  for (let k = 0; k < monthCount[m]; k++) {
    const style = pick(rng, mockStyles);
    const customer = pick(rng, mockCustomers);
    const maxDay = m === 5 ? dayjs().date() : base.daysInMonth();
    const day = Math.min(dayPool[k % dayPool.length] + Math.floor(rng() * 3), maxDay);
    const date = base.date(day);
    drafts.push({
      customerId: customer.id,
      date: date.format('YYYY-MM-DD'),
      productName: style.name,
      styleNo: style.styleNo,
      orderNo: rng() > 0.4 ? 'DD' + date.format('YYYYMMDD') + '-' + String(10 + Math.floor(rng() * 90)) : undefined,
      sizeScale: style.sizeScale,
      cartons: genCartons(style.sizeScale, style.colors),
      status: monthStatus[m][k] ?? '已出货',
      remark: rng() > 0.85 ? '客户加急，优先排产' : undefined,
    });
  }
}

// ③ 从上月及更早的草稿中抽 2 张改为已取消（保证「已取消」覆盖，且不影响本月数据）
drafts
  .map((d, i) => ({ i, d }))
  .filter(({ i, d }) => i > 0 && d.status === '草稿' && !dayjs().isSame(d.date, 'month'))
  .sort((a, b) => b.d.date.localeCompare(a.d.date))
  .slice(0, 2)
  .forEach(({ i }) => {
    drafts[i].status = '已取消';
  });

/** 按日期升序编号 PL{年}-{3位序号}（mock 数据全部落在当年） */
export const mockPackingLists: PackingList[] = [...drafts]
  .sort((a, b) => a.date.localeCompare(b.date))
  .map((d, i) => ({
    id: 'PL' + dayjs(d.date).format('YYYY') + '-' + String(i + 1).padStart(3, '0'),
    customerId: d.customerId,
    date: d.date,
    productName: d.productName,
    styleNo: d.styleNo,
    orderNo: d.orderNo,
    sizeScale: d.sizeScale,
    cartons: d.cartons,
    status: d.status,
    remark: d.remark,
    createdAt: d.date + ' 17:30',
  }));
