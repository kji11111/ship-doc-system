import type { CompanyProfile, PackingList, Statement } from '../types';
import { cartonQty, packingGrandQty, packingQtyBySize, rmbInWords, round2, statementAmount, statementPaid, unpaidOf } from './calc';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 装箱单单证 HTML（科诚抬头；打印窗口与页面预览共用，版式贴近「科诚无缝出货装箱单」） */
export function packingDocHtml(pl: PackingList, company: CompanyProfile, customerName?: string): string {
  const bySize = packingQtyBySize(pl);
  const sizeHead = pl.sizeScale.map((sz) => `<th>${esc(sz)}</th>`).join('');
  const body = pl.cartons
    .map((c) => {
      const cells = pl.sizeScale.map((sz) => `<td>${c.sizes[sz] || ''}</td>`).join('');
      return `<tr><td>${c.cartonNo}</td><td>${esc(c.color || '')}</td>${cells}<td>${esc(c.remark || '')}</td><td class="num">${cartonQty(c)}</td><td>${esc(c.volume || '')}</td></tr>`;
    })
    .join('');
  const sizeTotals = pl.sizeScale.map((sz) => `<td>${bySize[sz] || ''}</td>`).join('');
  const meta = [
    `品名：${esc(pl.productName)}`,
    `款号：${esc(pl.styleNo)}`,
    `日期：${esc(pl.date)}`,
    pl.orderNo ? `单号：${esc(pl.orderNo)}` : '',
    customerName ? `客户：${esc(customerName)}` : '',
  ]
    .filter(Boolean)
    .map((s) => `<span>${s}</span>`)
    .join('');
  return `
    <h1 class="doc-title">${esc(company.docTitlePacking)}</h1>
    <div class="doc-company">${esc(company.nameCn)}</div>
    <div class="doc-meta">${meta}</div>
    <table class="doc-table">
      <thead><tr><th>箱号</th><th>花型色别</th>${sizeHead}<th>备注</th><th>合计</th><th>箱体积</th></tr></thead>
      <tbody>${body}
        <tr class="doc-total"><td>合计</td><td></td>${sizeTotals}<td></td><td class="num">${packingGrandQty(pl)}</td><td></td></tr>
      </tbody>
    </table>
    <div class="doc-footer"><span>制单：__________</span><span>审核：__________</span><span>客户签收：__________</span></div>
    <div class="doc-bank">${esc(company.nameCn)}　电话：${esc(company.tel)}　地址：${esc(company.address)}</div>`;
}

/** 对账单单证 HTML（科诚抬头，底部银行账号 + 税号，含金额大写与收款情况） */
export function statementDocHtml(st: Statement, company: CompanyProfile, customerName?: string): string {
  const rows = st.lines
    .map(
      (l) =>
        `<tr><td>${esc(l.date)}</td><td>${esc(l.name)}</td><td>${esc(l.unit)}</td><td class="num">${l.quantity}</td><td class="num">${l.unitPrice}</td><td class="num">${round2(l.quantity * l.unitPrice)}</td><td>${esc(l.remark || '')}</td></tr>`,
    )
    .join('');
  const total = statementAmount(st.lines);
  const paid = statementPaid(st);
  const due = unpaidOf(st);
  const payNote =
    st.payments && st.payments.length
      ? `<div class="doc-bank">已收款：¥${paid}（${st.payments.map((p) => `${esc(p.date)} ¥${p.amount}`).join('；')}）<br/>未收款：¥${due}</div>`
      : `<div class="doc-bank">未收款：¥${due}</div>`;
  const [y, m] = st.period.split('-');
  return `
    <h1 class="doc-title">${esc(st.title || `${customerName ?? ''} ${y}年${Number(m)}月份客户对帐单`)}</h1>
    <div class="doc-company">${esc(company.nameCn)}</div>
    <div class="doc-meta"><span>客户：${esc(customerName ?? '—')}</span><span>对账期间：${y}年${Number(m)}月</span></div>
    <table class="doc-table">
      <thead><tr><th>日期</th><th>品名/工艺</th><th>单位</th><th>数量</th><th>单价（元）</th><th>金额（元）</th><th>备注</th></tr></thead>
      <tbody>${rows}
        <tr class="doc-total"><td colspan="5">合计</td><td class="num">${total}</td><td></td></tr>
      </tbody>
    </table>
    <div class="doc-amount">金额大写：${rmbInWords(total)}</div>
    ${payNote}
    <div class="doc-bank">收款银行：${esc(company.bankName)}<br/>银行账号：${esc(company.bankAccount)}<br/>纳税人识别号：${esc(company.taxNo)}</div>
    <div class="doc-footer"><span>制单：__________</span><span>客户确认：__________</span></div>`;
}
