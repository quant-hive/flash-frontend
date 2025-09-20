"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth";

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(20, { message: "Username cannot exceed 20 characters" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores",
      }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * RegisterForm component for the register page.
 */
export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // First, register the user
      const response = await registerUser({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
      });

      // Registration successful, now try to log them in
      try {
        await login({
          username: data.username,
          password: data.password,
        });

        // Both registration and login successful
        setSuccess(true);

        // Redirect based on user role after a short delay to show success message
        setTimeout(() => {
          if (response.user.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        }, 1500);
      } catch (loginErr: any) {
        // Registration succeeded but login failed
        setError(
          `Account created successfully, but auto-login failed: ${
            loginErr.response?.data?.message ||
            loginErr.message ||
            "Please try logging in manually."
          }`
        );

        // Still redirect to login page after showing error
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (registerErr: any) {
      // Registration failed
      setError(
        registerErr.response?.data?.message ||
          registerErr.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription className="text-gray-400">
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="bg-green-900 border-green-800 text-white mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Registration Successful</AlertTitle>
            <AlertDescription>
              Your account has been created. Redirecting you to the dashboard...
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              className="bg-gray-800 border-gray-700 text-white"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">
              Username
            </Label>
            <Input
              id="username"
              placeholder="johndoe123"
              {...register("username")}
              className="bg-gray-800 border-gray-700 text-white"
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              autoComplete="email"
              className="bg-gray-800 border-gray-700 text-white"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              autoComplete="new-password"
              className="bg-gray-800 border-gray-700 text-white"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              autoComplete="new-password"
              className="bg-gray-800 border-gray-700 text-white"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Register"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-sm text-gray-400 mt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-400 hover:underline">
            Login
          </Link>
        </div>
      </CardFooter>
    </>
  );
}
