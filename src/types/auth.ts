export interface LoginRequest {
  userId: string;
  password: string;
}

export interface User {
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
}

export interface LoginResponse {
  status: "success" | "error";
  message: string;
  data: {
    token: string;
    user: User;
  };
}