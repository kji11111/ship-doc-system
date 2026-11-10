import * as XLSX from 'xlsx-js-style';
import type { CompanyProfile, PackingList } from '../types';
import { cartonQty, packingGrandQty, packingQtyBySize } from './calc';

type Cell = string | number | null;

/**
 * 导出「科诚无缝出货装箱单」式 xlsx：
 * 标题 + 公司名 + 品名/款号/日期/单号/客户 + 表头 + 逐箱行（空码留空不写 0）+ 合计行；
 * 标题/公司/元信息合并居中，表格加边框，Excel 打开即可改、可发客户。
 */
export function exportPackingExcel(pl: PackingList, company: CompanyProfile, customerName?: string): void {
  const header: Cell[] = ['箱号', '花型色别', ...pl.sizeScale, '备注', '合计', '箱体积'];
  const lastCol = header.length - 1;

  const meta: Cell[] = [`品名：${pl.productName}`, `款号：${pl.styleNo}`, `日期：${pl.date}`];
  if (pl.orderNo) meta.push(`单号：${pl.orderNo}`);
  if (customerName) meta.push(`客户：${customerName}`);

  const aoa: Cell[][] = [];
  aoa.push([company.docTitlePacking]);
  aoa.push([company.nameCn]);
  aoa.push(meta);
  aoa.push([]);
  aoa.push(header);
  pl.cartons.forEach((c) => {
    aoa.push([
      c.cartonNo,
      c.color || null,
      ...pl.sizeScale.map((sz) => c.sizes[sz] || null),
      c.remark ?? null,
      cartonQty(c),
      c.volume ?? null,
    ]);
  });
  const bySize = packingQtyBySize(pl);
  aoa.push(['合计', null, ...pl.sizeScale.map((sz) => bySize[sz] || null), null, packingGrandQty(pl), null]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: lastCol } },
  ];
  ws['!cols'] = [{ wch: 6 }, { wch: 12 }, ...pl.sizeScale.map(() => ({ wch: 6 })), { wch: 16 }, { wch: 6 }, { wch: 10 }];

  const thin = { style: 'thin' as const };
  const box = { top: thin, bottom: thin, left: thin, right: thin };
  const center = { horizontal: 'center' as const, vertical: 'center' as const };
  const headerRow = 4;
  const totalRow = headerRow + pl.cartons.length + 1;
  const range = XLSX.utils.decode_range(ws['!ref'] as string);
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[addr] as XLSX.CellObject | undefined;
      if (!cell) continue;
      if (R === 0) cell.s = { font: { bold: true, sz: 16 }, alignment: center };
      else if (R === 1) cell.s = { font: { bold: true, sz: 12 }, alignment: center };
      else if (R === 2) cell.s = { font: { sz: 11 }, alignment: { horizontal: 'left' as const } };
      else if (R === headerRow) cell.s = { font: { bold: true }, alignment: center, border: box, fill: { patternType: 'solid', fgColor: { rgb: 'EAF2EF' } } };
      else if (R > headerRow && R <= totalRow) cell.s = { alignment: center, border: box };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '装箱单');
  XLSX.writeFile(wb, `装箱单_${pl.styleNo || '未命名'}_${pl.date}.xlsx`);
}
