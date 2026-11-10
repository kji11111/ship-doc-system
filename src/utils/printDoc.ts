/** 新窗口打印单证 HTML（干净 A4 版式，避免后台界面混入打印页） */
export function printDoc(title: string, bodyHtml: string): boolean {
  const w = window.open('', '_blank', 'width=980,height=720');
  if (!w) return false;
  const safeTitle = title.replace(/[<>&"]/g, '');
  w.document.write(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8" /><title>${safeTitle}</title><style>
    body { font-family: "Microsoft YaHei", system-ui, sans-serif; color: #000; margin: 0; padding: 10mm 12mm; }
    h1.doc-title { text-align: center; font-size: 20px; margin: 0 0 6px; letter-spacing: 2px; }
    .doc-company { text-align: center; font-size: 14px; margin-bottom: 10px; }
    .doc-meta { display: flex; flex-wrap: wrap; gap: 6px 28px; font-size: 13px; margin-bottom: 10px; }
    table.doc-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .doc-table th, .doc-table td { border: 1px solid #444; padding: 4px 6px; text-align: center; }
    .doc-table th { background: #f0f0f0; }
    .doc-table td.num { font-variant-numeric: tabular-nums; }
    tr.doc-total td { font-weight: 700; background: #fafafa; }
    .doc-footer { margin-top: 26px; display: flex; justify-content: space-between; font-size: 13px; }
    .doc-bank { margin-top: 16px; font-size: 13px; line-height: 1.9; }
    .doc-amount { margin-top: 12px; font-size: 13px; font-weight: 700; }
    @page { size: A4; margin: 10mm; }
  </style></head><body>${bodyHtml}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
  return true;
}
