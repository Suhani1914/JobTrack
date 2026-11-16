
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { AuthUser } from "../services/authService";

import {
  signup as signupService,
  login as loginService,
  logout as logoutService,
  getCurrentUser,
  isAuthenticated,
} from "../services/authService";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signupUser: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  loginUser: (
    email: string,
    password: string
  ) => Promise<void>;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    return isAuthenticated() ? getCurrentUser() : null;
  });

  const [loading] = useState(false);

  // Register a new user
  const signupUser = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    const loggedInUser = await signupService(
      name,
      email,
      password
    );

    setUser(loggedInUser);
  };

  // Login an existing user
  const loginUser = async (
    email: string,
    password: string
  ): Promise<void> => {
    const loggedInUser = await loginService(email, password);

    setUser(loggedInUser);
  };

  // Logout the current user
  const logoutUser = (): void => {
    logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signupUser,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access authentication
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
};
