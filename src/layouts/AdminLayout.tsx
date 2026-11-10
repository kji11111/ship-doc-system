import { useMemo, useRef, useState } from 'react';
import { App as AntApp, Badge, Button, Dropdown, Layout, Menu, Space, Tag } from 'antd';
import type { MenuProps } from 'antd';
import {
  AppstoreOutlined, AuditOutlined, BellOutlined, ContactsOutlined, DashboardOutlined,
  DownloadOutlined, FileDoneOutlined, ReloadOutlined, SettingOutlined, TagOutlined, UploadOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/AppStore';
import { downloadBackup, readBackupFile } from '../utils/backup';

const { Header, Sider, Content } = Layout;

const SYSTEM_NAME = '出货单证管理系统';

const MENU_ITEMS: MenuProps['items'] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/customers', icon: <ContactsOutlined />, label: '客户档案' },
  { key: '/styles', icon: <AppstoreOutlined />, label: '款号资料' },
  { key: '/packing-lists', icon: <FileDoneOutlined />, label: '出货装箱单' },
  { key: '/statements', icon: <AuditOutlined />, label: '对账单' },
  { key: '/quotations', icon: <TagOutlined />, label: '报价单（Phase 4）', disabled: true },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
];

/**
 * 后台布局：左侧菜单 + 顶栏（待办提醒 / 重置数据）。
 * 待办口径：
 * - 草稿装箱单数 → /packing-lists?todo=1（Phase 2 页面接住参数自动筛选）；
 * - 待确认对账单数 → /statements?todo=1（页面接住参数自动筛选）。
 */
export default function AdminLayout() {
  const { company, customers, styles, packingLists, statements, replaceAll, resetData } = useStore();
  const { modal, message } = AntApp.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const todoCounts = useMemo(
    () => ({
      draftPacking: packingLists.filter((p) => p.status === '草稿').length,
      pendingStatement: statements.filter((s) => s.status === '待确认').length,
    }),
    [packingLists, statements],
  );

  const onReset = () => {
    modal.confirm({
      title: '重置演示数据',
      content: '将清空本机修改，恢复为初始 mock 数据，确定继续吗？',
      okText: '重置',
      cancelText: '取消',
      onOk: () => {
        resetData();
        message.success('已恢复初始演示数据');
      },
    });
  };

  /** 全库 JSON 备份 / 恢复 */
  const fileRef = useRef<HTMLInputElement>(null);
  const backupMenu: MenuProps['items'] = [
    {
      key: 'export',
      icon: <DownloadOutlined />,
      label: '导出全库 JSON',
      onClick: () => {
        downloadBackup({ company, customers, styles, packingLists, statements });
        message.success('已导出全库 JSON 备份');
      },
    },
    {
      key: 'import',
      icon: <UploadOutlined />,
      label: '从 JSON 恢复',
      onClick: () => fileRef.current?.click(),
    },
    { type: 'divider' },
    { key: 'reset', icon: <ReloadOutlined />, label: '重置演示数据', onClick: onReset },
  ];
  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = await readBackupFile(file);
      replaceAll(data);
      message.success('已从备份恢复数据（' + data.packingLists.length + ' 张装箱单 / ' + data.statements.length + ' 张对账单）');
    } catch (err) {
      message.error('恢复失败：' + (err as Error).message);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light" style={{ borderRight: '1px solid #e0e9e6' }}>
        <div className="sider-logo">{collapsed ? '出货' : SYSTEM_NAME}</div>
        <Menu
          mode="inline"
          items={MENU_ITEMS}
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          style={{ borderInlineEnd: 'none' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e0e9e6',
          }}
        >
          <Space>
            <span style={{ fontWeight: 600, fontSize: 16 }}>{SYSTEM_NAME}</span>
            <Tag color="green">演示版</Tag>
          </Space>
          <Space>
            {/* 草稿装箱单：点击跳装箱单列表并自动筛选（?todo=1，Phase 2 页面接住参数） */}
            <Badge count={todoCounts.draftPacking} size="small" color="#d6a044">
              <Button size="small" icon={<FileDoneOutlined />} onClick={() => navigate('/packing-lists?todo=1')}>
                草稿装箱单
              </Button>
            </Badge>
            {/* 待确认对账单：点击跳对账单列表并自动筛选（?todo=1） */}
            <Badge count={todoCounts.pendingStatement} size="small">
              <Button size="small" icon={<BellOutlined />} onClick={() => navigate('/statements?todo=1')}>
                待确认对账
              </Button>
            </Badge>
            <Dropdown menu={{ items: backupMenu }} placement="bottomRight">
              <Button size="small">
                <Space size={4}>
                  <DownloadOutlined />
                  备份 / 恢复
                </Space>
              </Button>
            </Dropdown>
            <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleRestoreFile} />
          </Space>
        </Header>
        <Content style={{ margin: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
