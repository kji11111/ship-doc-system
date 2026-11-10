import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import dayjs from 'dayjs';
import type { CompanyProfile, Customer, PackingList, Statement, Style } from '../types';
import { mockCompany } from '../mocks/company';
import { mockCustomers } from '../mocks/customers';
import { mockStyles } from '../mocks/styles';
import { mockPackingLists } from '../mocks/packingLists';
import { mockStatements } from '../mocks/statements';

/** localStorage 键 v2：不读旧外贸键 ship-doc-db-v1，避免旧数据污染 */
const DB_KEY = 'ship-doc-db-v2';

export interface DbData {
  company: CompanyProfile;
  customers: Customer[];
  styles: Style[];
  packingLists: PackingList[];
  statements: Statement[];
}

/** 首次访问用 mock 初始化并写入 localStorage，之后读写均走本地存储 */
function loadDb(): DbData {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as DbData;
  } catch {
    // 数据损坏时重建
  }
  const fresh: DbData = {
    company: mockCompany,
    customers: mockCustomers,
    styles: mockStyles,
    packingLists: mockPackingLists,
    statements: mockStatements,
  };
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  return fresh;
}

/** 列表 upsert 小工具（按 id 判定新增或覆盖） */
function upsertList<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];
}

/**
 * 通用编号自增：
 * - 无年份段：CU0001（客户）/ ST0001（款号），width=4；
 * - 带年份段：PL2026-021（装箱单）/ STA2025-001（对账单），width=3，只统计当年最大号。
 */
export function nextId(existing: string[], prefix: string, opts?: { yearly?: boolean; width?: number }): string {
  const yearly = opts?.yearly ?? false;
  const width = opts?.width ?? (yearly ? 3 : 4);
  const year = dayjs().format('YYYY');
  const re = yearly ? new RegExp('^' + prefix + '(\\d{4})-(\\d+)$') : new RegExp('^' + prefix + '(\\d+)$');
  let max = 0;
  existing.forEach((id) => {
    const m = id.match(re);
    if (!m) return;
    if (yearly && m[1] !== year) return;
    max = Math.max(max, parseInt(yearly ? m[2] : m[1], 10));
  });
  const serial = String(max + 1).padStart(width, '0');
  return yearly ? prefix + year + '-' + serial : prefix + serial;
}

/** 全局状态与业务动作（Phase 1.5 仅 CRUD；单证生成/导入/打印在后续阶段） */
export interface Store {
  company: CompanyProfile;
  customers: Customer[];
  styles: Style[];
  packingLists: PackingList[];
  statements: Statement[];
  saveCompany: (p: CompanyProfile) => void;
  saveCustomer: (c: Customer) => void;
  removeCustomer: (id: string) => void;
  saveStyle: (s: Style) => void;
  removeStyle: (id: string) => void;
  savePackingList: (p: PackingList) => void;
  removePackingList: (id: string) => void;
  saveStatement: (s: Statement) => void;
  removeStatement: (id: string) => void;
  /** 全量替换（JSON 备份恢复用，调用方负责校验数据结构） */
  replaceAll: (data: DbData) => void;
  /** 清空演示数据：清客户/款号/装箱单/对账单，保留公司信息（便于从导入开始录真数据） */
  clearBusinessData: () => void;
  resetData: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore 必须在 AppStoreProvider 内使用');
  return store;
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DbData>(loadDb);

  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }, [db]);

  const resetData = useCallback(() => {
    localStorage.removeItem(DB_KEY);
    setDb(loadDb());
  }, []);

  const saveCompany = useCallback((company: CompanyProfile) => setDb((prev) => ({ ...prev, company })), []);

  const saveCustomer = useCallback((customer: Customer) => setDb((prev) => ({ ...prev, customers: upsertList(prev.customers, customer) })), []);
  const removeCustomer = useCallback((id: string) => setDb((prev) => ({ ...prev, customers: prev.customers.filter((c) => c.id !== id) })), []);

  const saveStyle = useCallback((style: Style) => setDb((prev) => ({ ...prev, styles: upsertList(prev.styles, style) })), []);
  const removeStyle = useCallback((id: string) => setDb((prev) => ({ ...prev, styles: prev.styles.filter((s) => s.id !== id) })), []);

  const savePackingList = useCallback((pl: PackingList) => setDb((prev) => ({ ...prev, packingLists: upsertList(prev.packingLists, pl) })), []);
  const removePackingList = useCallback((id: string) => setDb((prev) => ({ ...prev, packingLists: prev.packingLists.filter((p) => p.id !== id) })), []);

  const saveStatement = useCallback((st: Statement) => setDb((prev) => ({ ...prev, statements: upsertList(prev.statements, st) })), []);
  const removeStatement = useCallback((id: string) => setDb((prev) => ({ ...prev, statements: prev.statements.filter((s) => s.id !== id) })), []);

  const replaceAll = useCallback((data: DbData) => setDb(data), []);
  const clearBusinessData = useCallback(
    () => setDb((prev) => ({ ...prev, customers: [], styles: [], packingLists: [], statements: [] })),
    [],
  );

  const value = useMemo<Store>(
    () => ({
      company: db.company,
      customers: db.customers,
      styles: db.styles,
      packingLists: db.packingLists,
      statements: db.statements,
      saveCompany,
      saveCustomer,
      removeCustomer,
      saveStyle,
      removeStyle,
      savePackingList,
      removePackingList,
      saveStatement,
      removeStatement,
      replaceAll,
      clearBusinessData,
      resetData,
    }),
    [db, saveCompany, saveCustomer, removeCustomer, saveStyle, removeStyle, savePackingList, removePackingList, saveStatement, removeStatement, replaceAll, clearBusinessData, resetData],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

