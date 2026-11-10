import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Styles from './pages/Styles';
import PackingLists from './pages/PackingLists';
import Statements from './pages/Statements';
import Settings from './pages/Settings';

/** 路由：单用户、无登录；报价单 Phase 4（菜单置灰，暂无路由） */
export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/styles" element={<Styles />} />
        <Route path="/packing-lists" element={<PackingLists />} />
        <Route path="/statements" element={<Statements />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
