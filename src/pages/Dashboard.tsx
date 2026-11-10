import { useMemo } from 'react';
import { Alert, Card, Col, Row } from 'antd';
import dayjs from 'dayjs';
import type { BarSeriesOption, EChartsOption, LineSeriesOption, PieSeriesOption } from 'echarts';
import type { PackingStatus } from '../types';
import { useStore } from '../store/AppStore';
import { packingGrandQty, round2, statementAmount, unpaidOf } from '../utils/calc';
import EChart from '../components/EChart';
import StatCard from '../components/StatCard';

const STATUS_LIST: PackingStatus[] = ['草稿', '已出货', '已对账', '已取消'];
const STATUS_COLORS: Record<PackingStatus, string> = {
  草稿: '#9fb3ae',
  已出货: '#4ba39a',
  已对账: '#3f8f5f',
  已取消: '#c95656',
};

/** 数据仪表盘：装箱件数与人民币金额（CNY 单一口径，无币种切换） */
export default function Dashboard() {
  const { customers, packingLists, statements } = useStore();

  const customerName = useMemo(() => {
    const m = new Map<string, string>();
    customers.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [customers]);

  /** 有效装箱单（不含已取消）与已出货口径（已出货 + 已对账） */
  const active = useMemo(() => packingLists.filter((p) => p.status !== '已取消'), [packingLists]);
  const shipped = useMemo(
    () => packingLists.filter((p) => p.status === '已出货' || p.status === '已对账'),
    [packingLists],
  );

  const stats = useMemo(() => {
    const now = dayjs();
    const period = now.format('YYYY-MM');
    const listCount = active.filter((p) => dayjs(p.date).isSame(now, 'month')).length;
    const monthQty = shipped
      .filter((p) => dayjs(p.date).isSame(now, 'month'))
      .reduce((s, p) => s + packingGrandQty(p), 0);
    const monthAmount = round2(
      statements.filter((st) => st.period === period).reduce((s, st) => s + statementAmount(st.lines), 0),
    );
    const dueTotal = round2(statements.reduce((s, st) => s + unpaidOf(st), 0));
    return { listCount, monthQty, monthAmount, dueTotal };
  }, [active, shipped, statements]);

  /** 图1：近 6 个月出货件数（柱）+ 对账金额（线，右轴） */
  const trendOption = useMemo<EChartsOption>(() => {
    const months = Array.from({ length: 6 }, (_, i) => dayjs().subtract(5 - i, 'month'));
    const qtyData = months.map((m) =>
      shipped.filter((p) => dayjs(p.date).isSame(m, 'month')).reduce((s, p) => s + packingGrandQty(p), 0),
    );
    const amtData = months.map((m) =>
      round2(statements.filter((st) => st.period === m.format('YYYY-MM')).reduce((s, st) => s + statementAmount(st.lines), 0)),
    );
    const bar: BarSeriesOption = { name: '出货件数', type: 'bar', barMaxWidth: 26, data: qtyData };
    const line: LineSeriesOption = { name: '对账金额', type: 'line', yAxisIndex: 1, smooth: true, data: amtData };
    return {
      color: ['#11685f', '#d6a044'],
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      grid: { left: 60, right: 64, top: 28, bottom: 48 },
      xAxis: { type: 'category', data: months.map((m) => m.format('M月')) },
      yAxis: [
        { type: 'value', name: '件', minInterval: 1 },
        { type: 'value', name: '元', splitLine: { show: false } },
      ],
      series: [bar, line],
    };
  }, [shipped, statements]);

  /** 图2：客户出货件数 Top8（横向条形，已出货 + 已对账） */
  const customerOption = useMemo<EChartsOption>(() => {
    const byCustomer = new Map<string, number>();
    shipped.forEach((p) => {
      if (!p.customerId) return;
      byCustomer.set(p.customerId, (byCustomer.get(p.customerId) ?? 0) + packingGrandQty(p));
    });
    const ranked = [...byCustomer.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).reverse();
    const series: BarSeriesOption[] = [
      {
        type: 'bar',
        barWidth: 16,
        data: ranked.map(([, v]) => v),
        itemStyle: { color: '#11685f' },
        label: { show: true, position: 'right' },
      },
    ];
    return {
      tooltip: {},
      grid: { left: 70, right: 56, top: 12, bottom: 28 },
      xAxis: { type: 'value', minInterval: 1 },
      yAxis: { type: 'category', data: ranked.map(([id]) => customerName.get(id) ?? id) },
      series,
    };
  }, [shipped, customerName]);

  /** 图3：装箱单状态分布（环形，全部单含已取消） */
  const statusOption = useMemo<EChartsOption>(() => {
    const data = STATUS_LIST.map((st) => ({
      name: st,
      value: packingLists.filter((p) => p.status === st).length,
      itemStyle: { color: STATUS_COLORS[st] },
    })).filter((x) => x.value > 0);
    const series: PieSeriesOption[] = [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '44%'],
        itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 6 },
        label: { formatter: '{b} {c}张' },
        data,
      },
    ];
    return { tooltip: { trigger: 'item' }, legend: { bottom: 0 }, series };
  }, [packingLists]);

  /** 图4：应收账款 Top8（横向条形，对账单未收款） */
  const receivableOption = useMemo<EChartsOption>(() => {
    const byCustomer = new Map<string, number>();
    statements.forEach((st) => {
      const due = unpaidOf(st);
      if (due > 0.005) byCustomer.set(st.customerId, round2((byCustomer.get(st.customerId) ?? 0) + due));
    });
    const ranked = [...byCustomer.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).reverse();
    const series: BarSeriesOption[] = [
      {
        type: 'bar',
        barWidth: 16,
        data: ranked.map(([, v]) => v),
        itemStyle: { color: '#d6a044' },
        label: { show: true, position: 'right' },
      },
    ];
    return {
      tooltip: {},
      grid: { left: 70, right: 64, top: 12, bottom: 28 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: ranked.map(([id]) => customerName.get(id) ?? id) },
      series,
    };
  }, [statements, customerName]);

  return (
    <div>
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message="演示数据说明"
        description="本页统计基于固定种子 mock 数据（首访后保存在本机浏览器），全部为人民币口径；可在顶栏「重置演示数据」恢复初始状态。"
      />
      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}>
          <StatCard label="本月装箱单（张）" value={stats.listCount} sub="含草稿，不含已取消" />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard label="本月出货件数（件）" value={stats.monthQty} sub="状态=已出货 / 已对账" />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard label="本月对账金额（元）" value={stats.monthAmount} sub={'对账期间 ' + dayjs().format('YYYY-MM')} />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard label="未收款余额（元）" value={stats.dueTotal} sub="全部对账单未收合计" />
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="近 6 个月出货件数与对账金额" size="small">
            <EChart option={trendOption} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="客户出货件数 Top8" size="small">
            <EChart option={customerOption} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="装箱单状态分布" size="small">
            <EChart option={statusOption} height={280} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="应收账款 Top8（元）" size="small">
            <EChart option={receivableOption} height={280} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

