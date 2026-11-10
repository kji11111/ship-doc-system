# PROJECT：出货装箱单与对账单工具

> 服装加工厂（如示例「科诚服装加工场」）的**纯前端单证工具**。目标只有一个：替代手工 Excel——
> 逐箱录出货装箱单、按客户按月开对账单、导出能直接发客户的 xlsx、随时打印。
> 本项目**不是**人大代表系统，也**不是**外贸 FOB/商业发票系统；无多币种，只有件数与人民币。

## 一、整体目标

1. **出货装箱单**：一行 = 一只纸箱（箱号 / 花型色别 / 各码数量 / 备注 / 合计 / 箱体积），尺码列按款可配；
2. **客户对账单**：按客户 + 月份，可手工加行（起版等）或从当月装箱单带出件数（单价手填），登记收款；
3. **Excel 进出**：导入工厂现版式的装箱单表；导出同版式 xlsx 与对账单（底部银行账号 + 税号）；
4. **打印**：A4 单证版式，浏览器打印即 PDF；
5. **纯前端**：无后端、无登录，数据存浏览器 localStorage（键 `ship-doc-db-v2`）。

## 二、数据 Schema（`src/types/index.ts`）

| 实体 | 关键字段 | 说明 |
|---|---|---|
| CompanyProfile（单例） | nameCn / nameAlt / address / contact / tel / bankName / bankAccount / taxNo / docTitlePacking | 两块牌子：科诚抬头（装箱单/对账单）+ nameAlt（报价单）；公开仓库默认占位值 |
| Customer | name / contact / phone / paymentTerm / remark | 客户档案，编号 CU0001… |
| Style | styleNo（唯一）/ name / sizeScale[] / colors[] / unit / bulkPrice / process | 款号资料，编号 ST0001… |
| PackingCarton | cartonNo / color / sizes: Record<尺码,数量> / volume / remark | 一行一箱；缺省码当 0 |
| PackingList | customerId / date / productName / styleNo / orderNo / sizeScale[] / cartons[] / status | 状态：草稿→已出货→已对账（已取消）；编号 PL2026-xxx；**箱数/各码合计/总件数由 calc 实时算，不入库** |
| Statement / StatementLine | customerId / period('YYYY-MM') / title / lines[] / status(待确认/已确认) / payments[] | 金额=Σ(数量×单价)，未收=金额−Σ收款；编号 STA2025-xxx |
| Quotation | —（Phase 4 占位类型，无页面） | 款号+工艺+大货价+客户批价+阶梯价说明 |

## 三、页面

- **仪表盘** `/dashboard`：本月装箱单数 / 本月出货件数 / 本月对账金额 / 未收款余额；近 6 个月件数+金额、客户件数 Top8、状态分布、应收 Top8；
- **客户档案** `/customers`、**款号资料** `/styles`：完整 CRUD；
- **出货装箱单** `/packing-lists`：列表筛选（关键词/状态/月份）、逐箱编辑、状态流转、Excel 导入（解析 → 预览补元信息 → 入库为草稿）、导出 xlsx、打印预览；
- **对账单** `/statements`：列表筛选、编辑（手工加行 / 从当月装箱单带出件数 / 收款登记）、导出 xlsx、打印；
- **系统设置** `/settings`：编辑两块牌子的公司信息；**清空演示数据**（保留公司信息）。

## 四、目录结构

```
src/
├─ types/index.ts          # 全部数据类型 + Excel 导入模板字段注释
├─ utils/
│  ├─ calc.ts              # 箱/单/对账实时汇总 + rmbInWords 人民币大写
│  ├─ importPacking.ts     # 装箱单 Excel 解析（纯函数，node 可测）
│  ├─ exportPacking.ts     # 装箱单 xlsx 导出（xlsx-js-style，带格式）
│  ├─ exportStatement.ts   # 对账单 xlsx 导出
│  ├─ docHtml.ts           # 装箱单/对账单单证 HTML（预览与打印共用）
│  ├─ printDoc.ts          # 新窗口打印（A4 版式）
│  └─ backup.ts            # 全库 JSON 备份/恢复
├─ mocks/                  # 固定种子演示数据（含样例款 J34，总件 505）
├─ store/AppStore.tsx      # Context + localStorage(ship-doc-db-v2) + CRUD + 备份恢复 + 清空演示
├─ components/             # PackingListEditor / ImportPackingModal / StatementEditor / EChart / StatCard
├─ layouts/AdminLayout.tsx # 菜单 + 待办（草稿装箱单/待确认对账）+ 备份恢复下拉
└─ pages/                  # Dashboard / Customers / Styles / PackingLists / Statements / Settings
scripts/
├─ check-data.ts           # mock 数据一致性断言（J34=505、对账单 8000、箱号连续、本月非 0）
└─ test-import.ts          # 导入解析端到端断言（合成科诚版式 xlsx → 解析 → 505）
```

## 五、启动 / 部署 / 校验

```bash
npm install
npm run dev     # http://localhost:5173/ship-doc-system/
npm run build   # tsc --noEmit + vite build
# 数据/解析校验（不参与构建）：
npx esbuild scripts/check-data.ts --bundle --format=cjs --platform=node --outfile=scripts/check-data.cjs && node scripts/check-data.cjs
npx esbuild scripts/test-import.ts --bundle --format=cjs --platform=node --outfile=scripts/test-import.cjs && node scripts/test-import.cjs
```

- GitHub Pages：`.github/workflows/deploy.yml`（checkout → setup-node → npm ci → build → deploy-pages），推送 `main` 自动发布；
- `vite.config.ts` `base: '/ship-doc-system/'` 与仓库名一致；HashRouter 刷新不 404；
- 访问地址：`https://kji11111.github.io/ship-doc-system/`。

## 六、数据安全边界

- 公开仓库中**不含**真实抬头/账号/税号/手机号/门牌地址：`src/mocks/company.ts` 默认值为占位（示例公司、000000000000、示例地址），真实信息只填在本机浏览器「系统设置」（localStorage）；
- `.gitignore` 排除 `*.xlsx`（单证/备份表）与 `ship-doc-backup-*.json`（全库备份），防止真实数据误入库；
- 演示客户/款号（含 J34 样例）仅为导入测试与界面演示，正式使用前在「系统设置」点**清空演示数据**；
- 使用约定：**定期导出全库 JSON 备份**——localStorage 不是可靠存储。
