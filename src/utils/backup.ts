import dayjs from 'dayjs';
import type { CompanyProfile, Customer, PackingList, Statement, Style } from '../types';

export interface BackupData {
  version: 2;
  exportedAt: string;
  company: CompanyProfile;
  customers: Customer[];
  styles: Style[];
  packingLists: PackingList[];
  statements: Statement[];
}

/** 导出全库 JSON 备份（浏览器下载；避免 localStorage 成为唯一副本） */
export function downloadBackup(db: Omit<BackupData, 'version' | 'exportedAt'>): void {
  const payload: BackupData = { version: 2, exportedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'), ...db };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ship-doc-backup-' + dayjs().format('YYYYMMDD-HHmm') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

/** 读取并校验备份文件（结构不对则抛错，交由调用方提示） */
export async function readBackupFile(file: File): Promise<BackupData> {
  const text = await file.text();
  const data = JSON.parse(text) as Partial<BackupData>;
  if (!data || typeof data !== 'object') throw new Error('不是有效的 JSON 文件');
  if (!data.company || !Array.isArray(data.customers) || !Array.isArray(data.styles) || !Array.isArray(data.packingLists) || !Array.isArray(data.statements)) {
    throw new Error('缺少 company/customers/styles/packingLists/statements 字段');
  }
  return {
    version: 2,
    exportedAt: data.exportedAt ?? '',
    company: data.company,
    customers: data.customers,
    styles: data.styles,
    packingLists: data.packingLists,
    statements: data.statements,
  };
}
