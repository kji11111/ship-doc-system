/** 装箱单状态：草稿 →(发货)→ 已出货 →(开对账单并核销)→ 已对账；异常单 → 已取消 */
export type PackingStatus = '草稿' | '已出货' | '已对账' | '已取消';

/**
 * 本公司信息（两块牌子，打印规则）：
 * - 「科诚」抬头（nameCn / bankName / taxNo / docTitlePacking）用于出货装箱单与对账单；
 * - 「衣启盈」抬头（nameAlt）用于报价单（同一地址/电话）。
 * 「系统设置」页可修改并保存在 DbData.company。
 */
export interface CompanyProfile {
  nameCn: string; // 装箱单/对账单抬头（默认占位，真实值填在系统设置）
  nameAlt?: string; // 报价单抬头（默认占位，真实值填在系统设置）
  address: string;
  contact?: string;
  tel: string;
  fax?: string;
  email?: string;
  bankName: string;
  bankAccount: string;
  taxNo: string; // 纳税人识别号
  docTitlePacking: string; // 装箱单标题，如 科诚无缝出货装箱单
}

/** 客户档案（中文名，如 旺兆） */
export interface Customer {
  id: string; // CU0001
  name: string;
  shortName?: string;
  contact?: string;
  phone?: string;
  address?: string;
  paymentTerm?: string; // 结算方式：含1点税 / 月结 / 月结30天 …
  remark?: string;
  createdAt: string;
}

/** 款号资料 */
export interface Style {
  id: string; // ST0001
  styleNo: string; // 款号，如 J34（不可重复）
  name: string; // 品名，如 冲锋衣
  sizeScale: string[]; // 尺码列，默认 ['S','M','L','XL','XXL']，允许 XS/XXXL/均码
  colors: string[]; // 花型色别，如 ['黑色','紫色','米白']
  unit: string; // 单位，通常 件
  bulkPrice?: number; // 大货单价（元）
  process?: string; // 工艺/位置说明（报价用）
  remark?: string;
}

/** 装箱单明细行：一行 = 一只纸箱 */
export interface PackingCarton {
  cartonNo: number; // 箱号，从 1 连续
  color: string; // 花型色别
  sizes: Record<string, number>; // 各码数量，如 {S:45}；缺省当 0
  volume?: string; // 箱体积，如 60*40*35，可空
  remark?: string;
}

/** 出货装箱单（箱数/各码合计/总件数由 calc 实时算，不入库） */
export interface PackingList {
  id: string; // PL2026-021
  customerId?: string;
  date: string; // YYYY-MM-DD
  productName: string; // 品名，如 冲锋衣
  styleNo: string; // 款号，如 J34
  orderNo?: string; // 客户单号，可空
  sizeScale: string[]; // 尺码列（表头）
  cartons: PackingCarton[];
  status: PackingStatus;
  remark?: string;
  createdAt: string;
}

/** 对账单明细行 */
export interface StatementLine {
  date: string;
  refId?: string;
  name: string; // 品名/工艺名，如 冲锋衣 / 起版风衣
  unit: string; // 件
  quantity: number;
  unitPrice: number; // 元/件
  remark?: string; // 含税说明，如 含1点税
}

/** 客户对账单（月结；合计金额与未收款由 calc 实时算，不入库） */
export interface Statement {
  id: string; // STA2025-001
  customerId: string;
  period: string; // 2025-12
  title?: string; // 旺兆 2025年12月份客户对帐单
  lines: StatementLine[];
  status: '待确认' | '已确认';
  confirmedAt?: string;
  payments?: { date: string; amount: number; note?: string }[];
  remark?: string;
}

/** 报价单（Phase 4 实现；先占类型，不建页面）：款号 + 工艺和位置 + 大货单价 + 客户批价 + 阶梯价说明 */
export interface Quotation {
  id: string;
  customerId?: string;
  date: string;
  styleNo: string;
  process: string; // 工艺和位置
  bulkPrice?: number; // 大货单价（元）
  customerPrice?: number; // 客户批价（元）
  tierNote?: string; // 阶梯价说明
  remark?: string;
}

/*
 * ─── Excel 导入模板字段（Phase 2 使用，中英文表头别名映射） ───
 *
 * 装箱单（一行一箱）：箱号, 花型色别, S, M, L, XL, XXL, 备注, 箱体积
 *   表头信息：品名, 款号, 客户, 日期, 客户单号
 * 对账单（一行一款）：日期, 品名/工艺名, 单位, 数量, 单价, 备注(含税说明)
 * 客户：客户名称, 联系人, 电话, 地址, 结算方式
 * 款号：款号, 品名, 尺码列(逗号分隔), 颜色(逗号分隔), 单位, 大货单价, 工艺
 */
