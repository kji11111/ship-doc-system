import { Card, Empty } from 'antd';

/** Phase 1 占位页：标题 + 待实现提示（保证路由不 404，Phase 2/3 替换为完整页面） */
export default function PlaceholderPage({ title, phase, desc }: { title: string; phase: string; desc?: string }) {
  return (
    <Card title={title}>
      <Empty
        description={phase + ' 实现' + (desc ? '：' + desc : '')}
        style={{ padding: '48px 0' }}
      />
    </Card>
  );
}
