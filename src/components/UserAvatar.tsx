import { useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, MenuProps, message } from 'antd';
import { LoginOutlined, LogoutOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';

const UserAvatar = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('app_user');
    setUser(null);
    message.success('已退出登录');
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = !user?.user_id
    ? [
      {
        key: 'login',
        label: '登录',
        icon: <LoginOutlined />,
        onClick: () => navigate('/login'),
      },
      {
        key: 'register',
        label: '注册',
        icon: <UserAddOutlined />,
        onClick: () => navigate('/register'),
      },
    ]
    : [
      {
        key: 'profile',
        label: '个人中心',
        icon: <UserOutlined />,
        onClick: () => message.info('个人中心功能开发中'),
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="topRight">
      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <Avatar
          size={32}
          icon={<UserOutlined />}
          src={user?.photo_url}
          style={{ backgroundColor: user?.user_id ? '#1890ff' : '#ccc' }}
        />
        {user?.user_id && (
          <span style={{ marginLeft: 8, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.email || '用户'}
          </span>
        )}
      </div>
    </Dropdown>
  );
};

export default UserAvatar;