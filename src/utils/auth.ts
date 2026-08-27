
export interface LoggedInUser {
  id: string;
  userId: string;
  name: string;
  role: string;
  subrole: string;
  phone: string;
  joiningDate: string;
  endDate: string;
  lastActive: string;
  payment: boolean;
}

export const getCurrentUser = (): LoggedInUser | null => {
  try {
    const user = localStorage.getItem("user");

    if (!user) {
      return null;
    }

    return JSON.parse(user) as LoggedInUser;
  } catch (error) {
    console.error(
      "Failed to read logged-in user:",
      error
    );

    return null;
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}