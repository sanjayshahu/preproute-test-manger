import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { login } from "../api/auth";
import type { LoginRequest } from "../types/auth";

import "./Login.css";

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

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError("");

      const credentials: LoginRequest = {
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

      
// Save authentication data
localStorage.setItem(
  "token",
  response.data.token
);

localStorage.setItem(
  "user",
  JSON.stringify(response.data.user)
);

console.log(
  "TOKEN SAVED:",
  localStorage.getItem("token")
);

console.log(
  "USER SAVED:",
  JSON.parse(
    localStorage.getItem("user") || "{}"
  )
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
    <main className="login-page">
      {/* Left side - Figma illustration */}
      <section className="login-illustration">
  <img
    src="/assets/login-illustration.png"
    alt="Login illustration"
    className="login-illustration-image"
  />
</section>

      {/* Right side - Login form */}
      <section className="login-panel">
        <div className="login-content">
          {/* Logo */}
          <div className="login-brand">
            Preproute
          </div>

          {/* Heading */}
          <h1 className="login-title">
            Login
          </h1>

          {/* Description */}
          <p className="login-description">
            Use your company provided Login credentials
          </p>

          <form
            className="login-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* User ID */}
            <div className="form-group">
              <label
                htmlFor="userId"
                className="form-label"
              >
                User ID
              </label>

              <input
                id="userId"
                type="text"
                placeholder="Enter User ID"
                className="form-input"
                {...register("userId")}
              />

              {errors.userId && (
                <p className="form-error">
                  {errors.userId.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label
                htmlFor="password"
                className="form-label"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter Password"
                className="form-input"
                {...register("password")}
              />

              {errors.password && (
                <p className="form-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot password */}
            <button
              type="button"
              className="forgot-password"
            >
              Forgot password?
            </button>

            {/* Server error */}
            {serverError && (
              <p className="form-error server-error">
                {serverError}
              </p>
            )}

            {/* Login button */}
            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Logging in..."
                : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}