import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { login } from "../api/auth";
import type { LoginRequest } from "../types/auth";

const loginSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

const onSubmit = async (data: LoginRequest) => {
  try {
    setServerError("");

    const credentials = {
      userId: data.userId.trim(),
      password: data.password.trim(),
    };

    console.log("LOGIN DATA:", credentials);

    const response = await login(credentials);

    console.log("LOGIN RESPONSE:", response);

    if (response.status !== "success") {
      setServerError(response.message || "Login failed");
      return;
    }

    localStorage.setItem("token", response.data.token);

    console.log(
      "TOKEN SAVED:",
      localStorage.getItem("token")
    );

    navigate("/dashboard");
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);

    setServerError(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to connect to the server"
    );
  }
};

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="userId">User ID</label>

          <input
            id="userId"
            type="text"
            {...register("userId")}
          />

          {errors.userId && (
            <p>{errors.userId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            {...register("password")}
          />

          {errors.password && (
            <p>{errors.password.message}</p>
          )}
        </div>

        {serverError && <p>{serverError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}