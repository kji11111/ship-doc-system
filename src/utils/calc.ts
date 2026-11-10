import type { PackingCarton, PackingList, Statement, StatementLine } from '../types';

/** 金额统一保留两位小数，避免浮点累加误差 */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** 单箱合计件数（缺省码当 0） */
export function cartonQty(c: PackingCarton): number {
  return Object.values(c.sizes).reduce((s, v) => s + (v || 0), 0);
}

/** 装箱单各码合计 → { S: 140, M: 160, … }（尺码列表头 + 箱内实际出现的码） */
export function packingQtyBySize(pl: PackingList): Record<string, number> {
  const out: Record<string, number> = {};
  pl.sizeScale.forEach((sz) => (out[sz] = 0));
  pl.cartons.forEach((c) => {
    Object.entries(c.sizes).forEach(([sz, v]) => {
      out[sz] = (out[sz] ?? 0) + (v || 0);
    });
  });
  return out;
}

/** 装箱单总件数 */
export function packingGrandQty(pl: PackingList): number {
  return pl.cartons.reduce((s, c) => s + cartonQty(c), 0);
}

/** 装箱单箱数 */
export function cartonCount(pl: PackingList): number {
  return pl.cartons.length;
}

/** 对账单行金额 = 数量 × 单价 */
export function lineAmount(l: StatementLine): number {
  return round2(l.quantity * l.unitPrice);
}

/** 对账单合计金额 = Σ(数量 × 单价) */
export function statementAmount(lines: StatementLine[]): number {
  return round2(lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0));
}

/** 已收款合计 */
export function statementPaid(st: Statement): number {
  return round2((st.payments ?? []).reduce((s, p) => s + p.amount, 0));
}

/** 未收款余额 = 合计金额 − 已收款 */
export function unpaidOf(st: Statement): number {
  return round2(statementAmount(st.lines) - statementPaid(st));
}

/* ───────────────────────── 人民币中文大写（对账单/装箱单打印用） ───────────────────────── */

const CN_DIGITS = '零壹贰叁肆伍陆柒捌玖';
const CN_UNITS = ['', '拾', '佰', '仟'];
const CN_GROUPS = ['', '万', '亿', '兆'];

/** 1~9999 组内转中文大写：8000 → 捌仟；105 → 壹佰零伍；10 → 壹拾 */
function cnGroup(n: number): string {
  let out = '';
  let pendingZero = false;
  for (let i = 3; i >= 0; i--) {
    const d = Math.floor(n / 10 ** i) % 10;
    if (d === 0) {
      if (out) pendingZero = true;
    } else {
      if (pendingZero) {
        out += '零';
        pendingZero = false;
      }
      out += CN_DIGITS[d] + CN_UNITS[i];
    }
  }
  return out;
}

/** 整数转中文大写：100005000 → 壹亿零伍仟；100000 → 壹拾万；1000001 → 壹佰万零壹 */
function cnInt(n: number): string {
  if (n === 0) return '零';
  const gs: number[] = [];
  let x = n;
  while (x > 0) {
    gs.push(x % 10000);
    x = Math.floor(x / 10000);
  }
  let out = '';
  let zeroPending = false; // 中间有整组为 0 时，下一个非零组前补零
  for (let i = gs.length - 1; i >= 0; i--) {
    const g = gs[i];
    if (g === 0) {
      zeroPending = out !== '';
      continue;
    }
    if (out && (g < 1000 || zeroPending)) out += '零';
    out += cnGroup(g) + CN_GROUPS[i];
    zeroPending = false;
  }
  return out;
}

/** 人民币中文大写：8000 → 人民币捌仟元整；1234.56 → 人民币壹仟贰佰叁拾肆元伍角陆分 */
export function rmbInWords(n: number): string {
  const neg = n < 0;
  const cents = Math.round(Math.abs(n) * 100);
  const intPart = Math.floor(cents / 100);
  const jiao = Math.floor((cents % 100) / 10);
  const fen = cents % 10;
  let out = '人民币' + (neg ? '负' : '');
  if (intPart === 0 && jiao === 0 && fen === 0) return out + '零元整';
  if (intPart > 0) out += cnInt(intPart) + '元';
  if (jiao === 0 && fen === 0) {
    out += '整';
  } else {
    if (jiao > 0) out += CN_DIGITS[jiao] + '角';
    if (fen > 0) {
      if (jiao === 0 && intPart > 0) out += '零';
      out += CN_DIGITS[fen] + '分';
    }
  }
  return out;
}
