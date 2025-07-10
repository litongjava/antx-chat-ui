import {createContext, useContext, useEffect, useState} from 'react';
import {config} from "../config/config.ts";

interface UserData {
  user_id: string;
  token: string;
  refresh_token: string;
  expires_in: number;
  //0 匿名 1 普通用户 2 高级用户
  type: number;
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null
});

export const UserProvider = ({children}: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const anonymousLogin = async () => {
      try {
        // 检查本地是否已有用户数据
        const storedUser = localStorage.getItem('app_user');

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
          localStorage.setItem('app_user', JSON.stringify(result.data));
          setUser(result.data);
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

    anonymousLogin();
  }, []);

  return (
    <UserContext.Provider value={{user, loading, error}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);