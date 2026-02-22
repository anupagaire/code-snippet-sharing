"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

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
import { Eye, EyeOff, Loader2 } from "lucide-react";
// import { GoogleLogin } from "@/components/auth/google-login";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z
    .string()
    .min(9, "Phone number must be at least 9 digits")
    .regex(/^\+?\d{9,15}$/, "Invalid phone number format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [registeredPhone, setRegisteredPhone] = useState("");
  const [cleanPhone, setCleanPhone] = useState(""); // for display
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
  });

  // Helper: normalize phone for display and sending
  const normalizePhone = (phone: string) => {
    let digits = phone.replace(/\D/g, "");
    if (digits.startsWith("977")) digits = digits.slice(3);
    return digits;
  };

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError("");

    try {
      // Step 1: Register user
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Registration failed");
      }

      // Step 2: Send OTP
      const otpRes = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: data.phoneNumber }),
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok) {
        throw new Error(
          otpData.error ||
            "Failed to send OTP. Check balance or number format."
        );
      }

      const cleaned = normalizePhone(data.phoneNumber);

      toast.success("OTP sent successfully!");
      setRegisteredPhone(data.phoneNumber); // keep original for backend
      setCleanPhone(cleaned); // nice display
      setOtpSent(true);
      setResendCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      const msg = err.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");

    try {
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: registeredPhone, otp }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Invalid or expired OTP");
      }

      toast.success("Phone verified! Logging you in...");

      const loginRes = await signIn("credentials", {
        email: form.getValues("email"),
        password: form.getValues("password"),
        redirect: false,
      });

      if (loginRes?.error) {
        throw new Error(loginRes.error || "Login failed after verification");
      }

      router.push("/");
    } catch (err: any) {
      const msg = err.message || "Verification failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: registeredPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      toast.success("New OTP sent!");
      setOtp("");
      setResendCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      const msg = err.message || "Could not resend OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Countdown for resend
  useEffect(() => {
    if (resendCountdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Create Account
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Join today
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!otpSent ? (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your name" className="py-6" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            className="py-6"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            {...field}
                            placeholder=" 98XXXXXXXX"
                            className="py-6"
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
                              className="py-6 pr-12"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                    className="w-full py-6 text-lg bg-black hover:bg-[#2a1426] text-white transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="my-8 flex items-center">
                <Separator className="flex-1" />
                <span className="px-4 text-sm text-gray-500">or</span>
                <Separator className="flex-1" />
              </div>

              {/* <GoogleLogin /> */}
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-black dark:text-white">
                  Verify Phone Number
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Enter the OTP sent to <strong>+977 {cleanPhone}</strong>
                </p>
              </div>

              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                maxLength={6}
                className="text-center text-xl py-6 tracking-widest"
              />

              <Button
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify OTP & Login"
                )}
              </Button>

              <div className="text-center text-sm">
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-black hover:underline font-medium"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <p className="text-gray-500">
                    Resend available in {resendCountdown}s
                  </p>
                )}
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-black dark:text-white underline hover:no-underline"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}