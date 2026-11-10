import * as XLSX from 'xlsx-js-style';
import dayjs from 'dayjs';
import type { CompanyProfile, Statement } from '../types';
import { rmbInWords, round2, statementAmount, statementPaid, unpaidOf } from './calc';

type Cell = string | number | null;

/**
 * 导出「×× 2025年12月份客户对帐单」式 xlsx：
 * 标题 + 客户/期间 + 明细行（日期/品名/单位/数量/单价/金额/备注）+ 合计 + 收款情况 +
 * 底部收款银行/账号/纳税人识别号（系统设置里的科诚信息）。
 */
export function exportStatementExcel(st: Statement, company: CompanyProfile, customerName?: string): void {
  const [y, m] = st.period.split('-');
  const title = st.title || `${customerName ?? ''} ${y}年${Number(m)}月份客户对帐单`;

  const aoa: Cell[][] = [];
  aoa.push([title]);
  aoa.push([`客户：${customerName ?? '—'}`, `对账期间：${y}年${Number(m)}月`, `制单日期：${dayjs().format('YYYY-MM-DD')}`]);
  aoa.push([]);
  aoa.push(['日期', '品名/工艺', '单位', '数量', '单价（元）', '金额（元）', '备注']);
  st.lines.forEach((l) => {
    aoa.push([l.date, l.name, l.unit, l.quantity, l.unitPrice, round2(l.quantity * l.unitPrice), l.remark ?? null]);
  });
  aoa.push(['合计', null, null, null, null, statementAmount(st.lines), null]);
  aoa.push([]);
  aoa.push([`金额大写：${rmbInWords(statementAmount(st.lines))}`]);
  if (st.payments && st.payments.length) {
    aoa.push([`已收款：${statementPaid(st)} 元（${st.payments.map((p) => `${p.date} ¥${p.amount}`).join('；')}）`]);
  }
  aoa.push([`未收款：${unpaidOf(st)} 元`]);
  aoa.push([]);
  aoa.push([`收款银行：${company.bankName}`]);
  aoa.push([`银行账号：${company.bankAccount}`]);
  aoa.push([`纳税人识别号：${company.taxNo}`]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  ];
  ws['!cols'] = [{ wch: 12 }, { wch: 22 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 14 }];

  const thin = { style: 'thin' as const };
  const box = { top: thin, bottom: thin, left: thin, right: thin };
  const center = { horizontal: 'center' as const, vertical: 'center' as const };
  const headerRow = 3;
  const totalRow = headerRow + st.lines.length + 1;
  const range = XLSX.utils.decode_range(ws['!ref'] as string);
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[addr] as XLSX.CellObject | undefined;
      if (!cell) continue;
      if (R === 0) cell.s = { font: { bold: true, sz: 15 }, alignment: center };
      else if (R === 1) cell.s = { font: { sz: 11 }, alignment: { horizontal: 'left' as const } };
      else if (R === headerRow) cell.s = { font: { bold: true }, alignment: center, border: box, fill: { patternType: 'solid', fgColor: { rgb: 'EAF2EF' } } };
      else if (R > headerRow && R <= totalRow) cell.s = { alignment: center, border: box };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '对账单');
  XLSX.writeFile(wb, `对账单_${customerName ?? st.customerId}_${st.period}.xlsx`);
}
