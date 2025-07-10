// 带认证头的请求封装
export const authFetch = async (url: string, options: RequestInit = {}) => {
  // 从本地存储获取用户信息
  const userData = localStorage.getItem('app_login_user');

  if (!userData) {
    throw new Error('用户未登录');
  }

  const user = JSON.parse(userData);

  // 设置认证头
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${user.token}`);

  return fetch(url, {
    ...options,
    headers
  });
};

// 检查token是否过期
export const isTokenExpired = (): boolean => {
  const userData = localStorage.getItem('app_login_user');

  if (!userData) return true;

  const user = JSON.parse(userData);
  // 提前5分钟判断为过期
  return Date.now() / 1000 > user.expires_in - 300;
};

// 刷新token
export const refreshToken = async (): Promise<void> => {
  const userData = localStorage.getItem('app_login_user');

  if (!userData) {
    throw new Error('用户未登录');
  }

  const user = JSON.parse(userData);
  const response = await fetch('/api/v1/token/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.refresh_token}`
    }
  });

  if (!response.ok) {
    throw new Error('刷新token失败');
  }

  const result = await response.json();

  if (result.ok && result.data) {
    // 更新本地存储
    const newUser = {...user, ...result.data};
    localStorage.setItem('app_login_user', JSON.stringify(newUser));
  } else {
    throw new Error(result.msg || '刷新token失败');
  }
};

// 带自动刷新的请求封装
export const autoRefreshFetch = async (url: string, options: RequestInit = {}) => {
  // 检查token是否过期
  if (isTokenExpired()) {
    await refreshToken();
  }

  return authFetch(url, options);
};