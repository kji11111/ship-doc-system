import type { CompanyProfile } from '../types';

/**
 * 本公司信息默认占位值（公开仓库不含真实抬头/账号/税号）。
 * 真实信息只应填在本机浏览器「系统设置」里（存 localStorage），不要提交进仓库。
 * - 科诚抬头（nameCn）：出货装箱单 + 客户对账单；
 * - 衣启盈抬头（nameAlt）：报价单（同一地址/电话）。
 */
export const mockCompany: CompanyProfile = {
  nameCn: '示例：科诚服装加工场',
  nameAlt: '示例：衣启盈户外用品有限公司',
  address: '示例地址：请在「系统设置」中填写',
  contact: '示例联系人',
  tel: '00000000000',
  bankName: '示例银行：请在「系统设置」中填写',
  bankAccount: '000000000000',
  taxNo: '000000000000000000',
  docTitlePacking: '科诚无缝出货装箱单',
};
