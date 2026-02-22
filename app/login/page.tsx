"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

const onSubmit = async (data: LoginFormData) => {
  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.message || "Invalid email or password");
    } else {
     localStorage.setItem("user-token", result.token);
  localStorage.setItem("user-name", result.user.name);
      router.push("/");
    }
  } catch (err: any) {
    console.error("Login error:", err);
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6">
  <div className="w-full max-w-md  rounded-3xl shadow-2xl p-8">
    <div className="text-center mb-6">
    
      <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">Welcome Back</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Log in to your account</p>
    </div>

    {error && (
      <div className="mb-5 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
        {error}
      </div>
    )}

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  placeholder="abc@gmail.com"
                  className="py-3 px-4 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...field}
                    placeholder="••••••••"
                    className="py-3 px-4 pr-12 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white font-bold rounded-xl bg-black hover:scale-105 transition-transform duration-200"
        >
          {loading ? "Signing in..." : "Log In"}
        </Button>
      </form>
    </Form>

    <div className="my-6 flex items-center">
      <Separator className="flex-1" />
      <span className="text-sm text-gray-400">or</span>
      <Separator className="flex-1" />
    </div>

    <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
      Don't have an account?{" "}
      <a href="/register" className="text-indigo-600 hover:text-indigo-800 font-medium">
        Create one
      </a>
    </p>
  </div>
</div>
  );
}
