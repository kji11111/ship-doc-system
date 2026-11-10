import { useState } from 'react';
import { App as AntApp, Button, Card, Col, Descriptions, Form, Input, Modal, Popconfirm, Row, Space } from 'antd';
import type { CompanyProfile } from '../types';
import { useStore } from '../store/AppStore';

/** 系统设置：本公司信息（两块牌子：科诚=装箱单/对账单抬头，衣启盈=报价单抬头），保存进 store 并持久化 */
export default function Settings() {
  const { company, saveCompany, clearBusinessData } = useStore();
  const { message } = AntApp.useApp();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<CompanyProfile>();

  const openEdit = () => {
    form.setFieldsValue(company);
    setOpen(true);
  };

  const submit = (v: CompanyProfile) => {
    saveCompany({ ...company, ...v });
    message.success('公司信息已保存');
    setOpen(false);
  };

  return (
    <Card
      title="本公司信息（两块牌子）"
      extra={
        <Space>
          <Popconfirm
            title="清空演示数据？"
            description="将清空客户 / 款号 / 装箱单 / 对账单（保留公司信息），之后可从 Excel 导入或手工新建真数据。建议先在顶栏导出 JSON 备份。"
            okText="清空"
            cancelText="取消"
            onConfirm={() => {
              clearBusinessData();
              message.success('已清空演示数据（公司信息保留），可从导入或新增开始');
            }}
          >
            <Button danger>清空演示数据</Button>
          </Popconfirm>
          <Button type="primary" onClick={openEdit}>
            编辑
          </Button>
        </Space>
      }
    >
      <Descriptions
        bordered
        size="small"
        column={2}
        items={[
          { key: 'nameCn', label: '中文名称（装箱单/对账单抬头）', children: company.nameCn },
          { key: 'nameAlt', label: '报价单抬头（衣启盈）', children: company.nameAlt || '—' },
          { key: 'docTitle', label: '装箱单标题', children: company.docTitlePacking },
          { key: 'taxNo', label: '纳税人识别号', children: company.taxNo },
          { key: 'address', label: '地址', children: company.address, span: 2 },
          { key: 'contact', label: '联系人', children: company.contact || '—' },
          { key: 'tel', label: '电话', children: company.tel },
          { key: 'fax', label: '传真', children: company.fax || '—' },
          { key: 'email', label: '邮箱', children: company.email || '—' },
          { key: 'bank', label: '收款银行', children: company.bankName },
          { key: 'account', label: '银行账号', children: company.bankAccount },
        ]}
      />
      <Modal
        title="编辑本公司信息"
        open={open}
        onOk={() => form.submit()}
        onCancel={() => setOpen(false)}
        okText="保存"
        cancelText="取消"
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nameCn" label="中文名称（装箱单/对账单抬头）" rules={[{ required: true, message: '请输入中文名称' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nameAlt" label="报价单抬头（衣启盈）">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="docTitlePacking" label="装箱单标题" rules={[{ required: true, message: '请输入装箱单标题' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="taxNo" label="纳税人识别号" rules={[{ required: true, message: '请输入税号' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="地址" rules={[{ required: true, message: '请输入地址' }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="contact" label="联系人">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="tel" label="电话" rules={[{ required: true, message: '请输入电话' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fax" label="传真">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bankName" label="收款银行" rules={[{ required: true, message: '请输入收款银行' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bankAccount" label="银行账号" rules={[{ required: true, message: '请输入银行账号' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Card>
  );
}
