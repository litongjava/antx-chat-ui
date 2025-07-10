import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {LockOutlined, MailOutlined} from '@ant-design/icons';
import {Button, Form, Input, message} from 'antd';
import {config} from '../config/config';
import {useUser} from '../context/UserContext';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {user} = useUser();

  const onFinish = async (values: { email: string; password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致！');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${config.base_url}/api/v1/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          user_type: 1, // 普通用户
          verification_type: 0, // 不验证邮箱
          user_id: user?.user_id // 匿名用户ID
        }),
      });

      const result = await response.json();
      if (result.ok) {
        message.success('注册成功！');
        navigate('/login');
      } else {
        message.error(result.msg || '注册失败');
      }
    } catch (error) {
      console.error('注册请求失败', error);
      message.error('注册请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>注册新账号</h1>
          <p>创建一个新账号开始使用</p>
        </div>

        <Form
          name="register_form"
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[
              {required: true, message: '请输入您的邮箱!'},
              {type: 'email', message: '请输入有效的邮箱地址!'}
            ]}
          >
            <Input
              prefix={<MailOutlined/>}
              placeholder="邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{required: true, message: '请输入您的密码!'}]}
          >
            <Input.Password
              prefix={<LockOutlined/>}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              {required: true, message: '请确认您的密码!'},
              ({getFieldValue}) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined/>}
              placeholder="确认密码"
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
              注册
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <span>
            已有账号？<Link to="/login">立即登录</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;