import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Card, Form, Input, message, Modal, Spin, Upload } from 'antd';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { useUser } from '../../context/UserContext.tsx';
import { config } from '../../config/config.ts';
import './UserProfile.css';
import {showError} from "../../utils/ErrorUtils.ts";

const UserProfile = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!user?.token) throw new Error('未登录');

        const response = await fetch(`${config.base_url}/api/v1/user/profile`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        if (!response.ok) throw new Error('获取用户信息失败');

        const result = await response.json();
        if (result.ok && result.data) {
          form.setFieldsValue({
            displayName: result.data.displayName,
            email: result.data.email,
            bio: result.data.bio || '',
          });
          setAvatarUrl(result.data.photoUrl);
          setLoading(false);
        } else {
          throw new Error(result.msg || '获取用户信息失败');
        }
      } catch (error) {
        showError(error, '获取用户信息失败');
        navigate('/login');
      }
    };

    fetchUserProfile();
  }, [form, navigate, user]);

  const handleUpdateProfile = async (values: any) => {
    try {
      setLoading(true);
      const token = user?.token;
      if (!token) throw new Error('未登录');

      // 修改为使用POST方法和正确的接口路径
      const response = await fetch(`${config.base_url}/api/v1/user/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          display_name: values.displayName,
          bio: values.bio || null,
        })
      });

      const result = await response.json();
      if (result.ok) {
        message.success('更新成功');
        // 更新用户上下文
        if (user) {
          setUser(user);
        }
      } else {
        throw new Error(result.msg || '更新失败');
      }
    } catch (error) {
      showError(error, '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      const token = user?.token;
      if (!token) throw new Error('未登录');

      setLoading(true);
      const response = await fetch(`${config.base_url}/api/v1/user/updatePassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: values.oldPassword,
          new_password: values.newPassword
        })
      });

      const result = await response.json();
      if (result.ok) {
        message.success('密码更新成功');
        setPasswordModalVisible(false);
        passwordForm.resetFields();
      } else {
        throw new Error(result.msg || '密码更新失败');
      }
    } catch (error) {
      showError(error, '密码更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.token) {
        // 调用登出接口
        await fetch(`${config.base_url}/api/v1/logout`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
      }
    } finally {
      localStorage.removeItem('app_user');
      setUser(null);
      message.success('已退出登录');
      navigate('/login');
    }
  };

  const handleRemoveUser = async () => {
    Modal.confirm({
      title: '删除账户',
      content: '确定要删除您的账户吗？此操作不可撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          setRemoveLoading(true);
          if (!user?.token) throw new Error('未登录');

          const response = await fetch(`${config.base_url}/api/v1/user/remove`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });

          const result = await response.json();
          if (result.ok) {
            message.success('账户已删除');
            localStorage.removeItem('app_user');
            localStorage.removeItem('app_token');
            setUser(null);
            navigate('/login');
          } else {
            throw new Error(result.msg || '删除失败');
          }
        } catch (error) {
          showError(error, '删除账户失败');
        } finally {
          setRemoveLoading(false);
        }
      }
    });
  };

  const handleAvatarChange = async (file: File) => {
    try {
      setAvatarLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      if (!user?.token) throw new Error('未登录');

      const response = await fetch(`${config.base_url}/api/v1/user/updateAvatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`
        },
        body: formData
      });

      const result = await response.json();
      if (result.ok) {
        message.success('头像更新成功');
        setAvatarUrl(result.data.avatarUrl);
        // 更新context中的头像
        if (user) {
          user.photo_url = result.data.avatarUrl
          setUser(user);
        }
      } else {
        throw new Error(result.msg || '头像更新失败');
      }
    } catch (error) {
      showError(error, '头像更新失败')
    } finally {
      setAvatarLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-spinner">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
        <p>加载用户信息中...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Card title="个人中心" className="profile-card">
        <div className="avatar-section">
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={({ file }) => handleAvatarChange(file as File)}
          >
            {avatarLoading ? (
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            ) : (
              <Avatar
                size={128}
                src={avatarUrl}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
            )}
          </Upload>
          <div className="avatar-hint">点击更换头像</div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          className="profile-form"
        >
          <Form.Item
            label="用户名"
            name="displayName"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input size="large" placeholder="用户名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
          >
            <Input size="large" placeholder="邮箱" disabled />
          </Form.Item>

          <Form.Item
            label="个人简介"
            name="bio"
          >
            <Input.TextArea placeholder="介绍一下你自己..." rows={4} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              更新个人信息
            </Button>
          </Form.Item>

          <div className="action-buttons">
            <Button
              onClick={() => setPasswordModalVisible(true)}
              className="change-password-btn"
            >
              修改密码
            </Button>

            <Button
              onClick={handleLogout}
              className="logout-btn"
            >
              退出登录
            </Button>

            <Button
              onClick={handleRemoveUser}
              danger
              loading={removeLoading}
            >
              删除账户
            </Button>
          </div>
        </Form>
      </Card>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        visible={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        onOk={handleUpdatePassword}
        confirmLoading={loading}
        okText="确认修改"
        cancelText="取消"
      >
        <Form
          form={passwordForm}
          layout="vertical"
        >
          <Form.Item
            label="原密码"
            name="oldPassword"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password size="large" placeholder="原密码" />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' }
            ]}
          >
            <Input.Password size="large" placeholder="新密码" />
          </Form.Item>

          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="确认新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;