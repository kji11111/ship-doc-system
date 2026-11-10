import type { Customer } from '../types';

/** 客户档案 mock：7 家中文名客户（含样例客户「旺兆」），地址/电话均为虚构演示值 */
export const mockCustomers: Customer[] = [
  { id: 'CU0001', name: '旺兆', contact: '陈生', phone: '138-0000-0001', address: '示例市白云区示例路 88 号', paymentTerm: '含1点税', remark: '冲锋衣主力客户，月结对账', createdAt: '2025-06-01 09:00' },
  { id: 'CU0002', name: '恒晖', contact: '梁小姐', phone: '138-0000-0002', address: '示例市禅城区示例大道 12 号', paymentTerm: '月结30天', createdAt: '2025-07-15 10:30' },
  { id: 'CU0003', name: '天添乐', contact: '何生', phone: '138-0000-0003', address: '示例市沙溪镇示例服装城 B 座', paymentTerm: '含1点税', createdAt: '2025-08-20 14:00' },
  { id: 'CU0004', name: '华旗', contact: '麦经理', phone: '138-0000-0004', address: '示例市虎门镇示例路 5 号', paymentTerm: '月结', remark: '户外套装为主', createdAt: '2025-09-10 11:20' },
  { id: 'CU0005', name: '悦莱', contact: '苏小姐', phone: '138-0000-0005', address: '示例市示例区示例大道中 66 号', paymentTerm: '含1点税', createdAt: '2025-10-05 15:45' },
  { id: 'CU0006', name: '金昊', contact: '冯生', phone: '138-0000-0006', address: '示例市香洲区示例科技园 3 栋', paymentTerm: '月结30天', createdAt: '2026-01-12 09:40' },
  { id: 'CU0007', name: '彤晖', contact: '赖小姐', phone: '138-0000-0007', address: '示例市番禺区示例大道 26 号', paymentTerm: '现结', remark: '童装小单多', createdAt: '2026-03-18 16:10' },
];
