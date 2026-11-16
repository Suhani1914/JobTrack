
const API_URL = import.meta.env.VITE_API_URL;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
    token: string;
  };
}

// Signup
export const signup = async (
  name: string,
  email: string,
  password: string
): Promise<AuthUser> => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const result: AuthResponse = await response.json();

  if (!response.ok || !result.data) {
    throw new Error(result.message || "Signup failed.");
  }

  // Store token and user information
  localStorage.setItem("token", result.data.token);
  localStorage.setItem("user", JSON.stringify(result.data.user));

  return result.data.user;
};

// Login
export const login = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const result: AuthResponse = await response.json();

  if (!response.ok || !result.data) {
    throw new Error(result.message || "Login failed.");
  }

  // Store token and user information
  localStorage.setItem("token", result.data.token);
  localStorage.setItem("user", JSON.stringify(result.data.user));

  return result.data.user;
};

// Get logged-in user
export const getCurrentUser = (): AuthUser | null => {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

// Logout
export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Check whether a token exists
export const isAuthenticated = (): boolean => {
  return Boolean(localStorage.getItem("token"));
};
