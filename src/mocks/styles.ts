import type { Style } from '../types';

/** 款号资料 mock：J34 复刻样例（S-XXL、黑/紫/米白），另 7 个常见款覆盖尺码列/均码等形态 */
export const mockStyles: Style[] = [
  { id: 'ST0001', styleNo: 'J34', name: '冲锋衣', sizeScale: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['黑色', '紫色', '米白'], unit: '件', bulkPrice: 45, process: '无缝压胶', remark: '样例主力款' },
  { id: 'ST0002', styleNo: 'K07', name: '风衣', sizeScale: ['S', 'M', 'L', 'XL'], colors: ['卡其', '黑色'], unit: '件', bulkPrice: 38, process: '起版' },
  { id: 'ST0003', styleNo: 'K12', name: '裤子', sizeScale: ['M', 'L', 'XL', 'XXL'], colors: ['黑色', '深灰'], unit: '件', bulkPrice: 22 },
  { id: 'ST0004', styleNo: 'M21', name: '冲锋裤', sizeScale: ['M', 'L', 'XL', 'XXL'], colors: ['黑色', '军绿'], unit: '件', bulkPrice: 32, process: '压胶' },
  { id: 'ST0005', styleNo: 'H05', name: '卫衣', sizeScale: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['灰色', '黑色', '米白'], unit: '件', bulkPrice: 28 },
  { id: 'ST0006', styleNo: 'P09', name: '皮肤衣', sizeScale: ['S', 'M', 'L', 'XL'], colors: ['白色', '天蓝', '粉色'], unit: '件', bulkPrice: 25 },
  { id: 'ST0007', styleNo: 'W33', name: '羽绒服', sizeScale: ['M', 'L', 'XL', 'XXL'], colors: ['黑色', '藏青'], unit: '件', bulkPrice: 88, remark: '冬季主力' },
  { id: 'ST0008', styleNo: 'G66', name: '骑行雨披', sizeScale: ['均码'], colors: ['荧光黄', '红色'], unit: '件', bulkPrice: 18, remark: '户外用品（衣启盈）' },
];
