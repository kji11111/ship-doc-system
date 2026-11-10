# 出货装箱单与对账单工具（ship-doc-system）

服装加工厂用的**纯前端单证工具**：逐箱录入出货装箱单、按客户按月开对账单，替代手工 Excel。
不涉及外贸 FOB / 商业发票 / 多币种——只有一件代工场景的 **件数与人民币**。

> 在线地址（GitHub Pages）：https://kji11111.github.io/ship-doc-system/

## 功能

- **出货装箱单**：一行一箱（箱号 / 花型色别 / S M L XL XXL…/ 备注 / 合计 / 箱体积），尺码列可配，各码合计与总件数实时计算；状态流转（草稿 → 已出货 → 已对账）。
- **Excel 导入 / 导出**：导入识别「标题 + 品名/款号/日期/单号 + 箱号+花型+尺码列」版式（自动跳过合计行）；导出的 xlsx 保留同样版式，空格不写 0，可直接发给客户。
- **打印**：装箱单 / 对账单均为 A4 版式打印（科诚抬头），预览后调浏览器打印。
- **客户对账单**：按客户 + 月份；可手工加行（起版等），或**从当月装箱单带出件数**（单价手填）；收款登记（已收 / 未收 / 金额大写）；单据底部带银行账号与税号。
- **仪表盘**：本月装箱单数 / 出货件数 / 对账金额 / 未收款余额，近 6 个月趋势、客户出货件数 Top、状态分布、应收 Top。
- **数据安全**：全库 JSON 备份 / 恢复（顶栏「备份 / 恢复」）、重置演示数据、系统设置里可一键「清空演示数据」。

## 本地启动

```bash
npm install
npm run dev   # http://localhost:5173/ship-doc-system/
npm run build # tsc 类型检查 + 打包到 dist/
```

## 数据与隐私（重要）

- 所有数据保存在**本机浏览器 localStorage**（键 `ship-doc-db-v2`），没有后端；换电脑 / 清浏览器数据 = 数据没了。
- **务必定期用顶栏「备份 / 恢复 → 导出全库 JSON」**保存备份文件；换机器或重装浏览器后用「从 JSON 恢复」还原。
- **真实抬头、银行账号、税号、客户信息只应填在本机浏览器的「系统设置」与业务页面里**（存 localStorage），**不要写进代码提交到本仓库**。`.gitignore` 已排除 `*.xlsx` 与 `ship-doc-backup-*.json`，防止误提交真实单证。
- 首次打开是演示数据（含示例款号 J34）：到「系统设置」点**清空演示数据**（公司信息保留），再从 Excel 导入或手工新建开始用真数据。公司默认抬头是占位值（示例公司 / 000000000000），请在「系统设置」中改成自己的。

## Excel 导入格式（装箱单，一行一箱）

| 箱号 | 花型色别 | S | M | L | XL | XXL | 备注 | 合计 | 箱体积 |
|---|---|---|---|---|---|---|---|---|---|

- 表头行需含「箱号」列与尺码列（S/M/L/XL/XXL/XS/XXXL/均码）；「花型色别」「备注」「箱体积」列可缺省；
- 顶部任意行支持 `品名：xxx / 款号：xxx / 日期：xxxx-xx-xx / 单号：xxx / 客户：xxx`（同格冒号写或标签+相邻格均可）；
- 底部「合计」行自动跳过；参考样例可看 `scripts/test-import.ts` 生成的合成表。

## 部署到 GitHub Pages

- 仓库 **Settings → Pages → Build and deployment → Source 选 GitHub Actions**；
- 已内置 `.github/workflows/deploy.yml`（checkout → setup-node → npm ci → npm run build → 上传 dist → deploy-pages），推送 `main` 即自动发布；
- `vite.config.ts` 的 `base: '/ship-doc-system/'` 与仓库名一致，访问地址 `https://<用户名>.github.io/ship-doc-system/`；
- 路由为 **HashRouter**（地址带 `#`，如 `#/packing-lists`），刷新 / 分享链接不会 404。

## 技术栈

React 18 + TypeScript + Vite 5 + Ant Design 5 + ECharts + dayjs + `xlsx-js-style`（Excel 导入导出）。校验脚本：`scripts/check-data.ts`（mock 数据一致性）、`scripts/test-import.ts`（导入解析断言）。
