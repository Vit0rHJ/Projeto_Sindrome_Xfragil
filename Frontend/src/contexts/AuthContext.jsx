import React, { createContext, useContext, useState } from 'react';
import { getUser, getToken, saveAuth, clearAuth } from '../services/api';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(getUser);
  const [token, setToken] = useState(getToken);

  const signIn = async (email, senha) => {
    const data = await api.login(email, senha);
    saveAuth(data.token, data.usuario);
    setToken(data.token);
    setUser(data.usuario);
    return data.usuario;
  };

  const signOut = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  const isAdmin      = user?.perfil === 'admin';
  const isSecretaria = user?.perfil === 'secretaria';
  const isMedico     = user?.perfil === 'medico';
  const canViewAll   = isAdmin || isSecretaria;

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut, isAdmin, isSecretaria, isMedico, canViewAll }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
