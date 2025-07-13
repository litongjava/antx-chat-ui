import {createContext, useContext, useEffect, useState} from 'react';
import {config} from "../config/config.ts";

interface AppLoginUserData {
  user_id: string;
  token: string;
  refresh_token: string;
  expires_in: number;
  //0 匿名 1 普通用户 2 高级用户
  type: number;
  display_name?: string;
  bil?:string,
  email?: string;
  photo_url?: string;
  school_id?: string;
}

interface UserContextType {
  user: AppLoginUserData | null;
  loading: boolean;
  error: string | null;
  setUser: (user: AppLoginUserData | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  setUser: () => {}
});

export const UserProvider = ({children}: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<AppLoginUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setUser = (userData: AppLoginUserData | null) => {
    if (userData) {
      localStorage.setItem('app_login_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('app_login_user');
    }
    setUserState(userData);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 添加请求拦截器添加认证头
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
          const [input, init] = args;
          const headers = new Headers(init?.headers);

          if (user?.token) {
            headers.set('Authorization', `Bearer ${user.token}`);
          }

          const newInit = init ? { ...init, headers } : { headers };
          return originalFetch(input, newInit);
        };

        // 检查本地是否已有用户数据
        const storedUser = localStorage.getItem('app_login_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }

        // 调用匿名登录接口
        const response = await fetch(config.base_url+'/api/v1/anonymous/create');
        if (!response.ok) {
          throw new Error(`登录失败: ${response.status}`);
        }

        const result = await response.json();
        if (result.ok && result.data) {
          // 保存到本地存储和状态
          const anonymousUser = {
            ...result.data,
            type: 0 // 匿名用户
          };
          setUser(anonymousUser);
        } else {
          throw new Error(result.msg || '未知错误');
        }
      } catch (err) {
        console.error('匿名登录失败:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <UserContext.Provider value={{user, loading, error, setUser}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);