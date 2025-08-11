import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input,App } from 'antd';
import { config } from '../../config/config.ts';
import { useUser } from '../../context/UserContext.tsx';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { message } = App.useApp();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.base_url}/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const result = await response.json();
      if (result.ok && result.data) {
        setUser({
          ...result.data,
          type: 1 // 登录后设置为普通用户
        });
        message.success('登录成功！');
        navigate('/');
      } else {
        message.error(result.msg || '登录失败');
      }
    } catch (error) {
      console.error('登录请求失败', error);
      message.error('登录请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>欢迎回来</h1>
          <p>请输入您的账号密码登录</p>
        </div>

        <Form
          name="login_form"
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入您的邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入您的密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <span>
            没有账号？<Link to="/register">立即注册</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;