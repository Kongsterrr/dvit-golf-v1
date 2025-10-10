'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  created_at: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  login: (userData: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时从localStorage恢复用户状态
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedAccessToken = localStorage.getItem('access_token');
        const storedRefreshToken = localStorage.getItem('refresh_token');

        if (storedUser && storedAccessToken && storedRefreshToken) {
          const userData = JSON.parse(storedUser);
          const tokenData = {
            access_token: storedAccessToken,
            refresh_token: storedRefreshToken
          };

          setUser(userData);
          setTokens(tokenData);

          // 验证token是否仍然有效
          const isValid = await validateToken(storedAccessToken);
          if (!isValid) {
            // 尝试刷新token
            const refreshed = await refreshTokenInternal(storedRefreshToken);
            if (!refreshed) {
              // 刷新失败，清除所有数据
              logout();
            }
          }
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 验证token有效性
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Token验证失败:', error);
      return false;
    }
  };

  // 内部刷新token方法
  const refreshTokenInternal = async (refreshToken: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newTokens = {
          access_token: data.access_token,
          refresh_token: data.refresh_token || refreshToken
        };

        setTokens(newTokens);
        localStorage.setItem('access_token', newTokens.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', newTokens.refresh_token);
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('刷新token失败:', error);
      return false;
    }
  };

  // 登录方法
  const login = (userData: User, tokenData: AuthTokens) => {
    setUser(userData);
    setTokens(tokenData);

    // 保存到localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('access_token', tokenData.access_token);
    localStorage.setItem('refresh_token', tokenData.refresh_token);
  };

  // 登出方法
  const logout = () => {
    setUser(null);
    setTokens(null);

    // 清除localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // 公开的刷新token方法
  const refreshToken = async (): Promise<boolean> => {
    if (!tokens?.refresh_token) {
      return false;
    }
    return await refreshTokenInternal(tokens.refresh_token);
  };

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    login,
    logout,
    updateUser,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}