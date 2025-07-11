import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {Button, message, Result, Spin} from 'antd';
import {config} from '../../config/config.ts';

const Verification = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const code = searchParams.get('code');
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!email || !code) {
        setStatus('error');
        message.error('缺少验证参数');
        return;
      }

      try {
        const response = await fetch(`${config.base_url}/api/v1/verify?email=${email}&code=${code}`);
        const result = await response.json();

        if (result.ok) {
          setStatus('success');
          message.success('邮箱验证成功！');
          // 2秒后跳转到登录页面
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setStatus('error');
          message.error(result.msg || '验证失败');
        }
      } catch (error) {
        console.error('验证请求失败', error);
        setStatus('error');
        message.error('验证请求失败');
      }
    };

    verifyEmail();
  }, [email, code, navigate]);

  if (status === 'pending') {
    return (
      <div style={{textAlign: 'center', padding: '50px 20px'}}>
        <Spin size="large"/>
        <p style={{marginTop: 20}}>正在验证您的邮箱，请稍候...</p>
      </div>
    );
  }

  return (
    <div style={{maxWidth: 800, margin: '0 auto', padding: '20px'}}>
      {status === 'success' ? (
        <Result
          status="success"
          title="邮箱验证成功！"
          subTitle="您已成功验证邮箱，系统将自动跳转到登录页面。"
          extra={[
            <Button type="primary" key="login" onClick={() => navigate('/login')}>
              立即登录
            </Button>,
          ]}
        />
      ) : (
        <Result
          status="error"
          title="邮箱验证失败"
          subTitle="验证链接无效或已过期，请重试或重新发送验证邮件。"
          extra={[
            <Button type="primary" key="retry" onClick={() => window.location.reload()}>
              重试
            </Button>,
            <Button key="home" onClick={() => navigate('/')}>
              返回首页
            </Button>,
          ]}
        />
      )}
    </div>
  );
};

export default Verification;