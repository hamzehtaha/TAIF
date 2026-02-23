"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, GraduationCap, Calendar } from "lucide-react";

export default function InstructorSignUp() {
  const t = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    yearsOfExperience: 0,
    agreeTerms: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) || 0 : value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.agreeTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    if (!formData.birthday) {
      setError("Please enter your date of birth");
      return;
    }

    setLoading(true);

    try {
      await authService.registerInstructor({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        birthday: formData.birthday,
        yearsOfExperience: formData.yearsOfExperience,
      });
      // Redirect to instructor portal
      router.push("/instructor");
    } catch (err) {
      setError("Failed to create instructor account. Please try again.");
      console.error("Sign up error:", err);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = {
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasLength: formData.password.length >= 8,
  };

  const passwordScore = Object.values(passwordStrength).filter(Boolean).length;

  return (
    <MainLayout>
      <section className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <Card>
            <CardHeader className="space-y-2 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">
                Become an Instructor
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create your instructor account and start teaching
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* First & Last Name Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium mb-2"
                    >
                      {t.auth.signup.firstName}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px] text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium mb-2"
                    >
                      {t.auth.signup.lastName}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px] text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    {t.auth.signup.email}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="instructor@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
                      required
                    />
                  </div>
                </div>

                {/* Birthday Input */}
                <div>
                  <label
                    htmlFor="birthday"
                    className="block text-sm font-medium mb-2"
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      type="date"
                      id="birthday"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
                      required
                    />
                  </div>
                </div>

                {/* Years of Experience */}
                <div>
                  <label
                    htmlFor="yearsOfExperience"
                    className="block text-sm font-medium mb-2"
                  >
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    min={0}
                    max={50}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px] text-sm"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-2"
                  >
                    {t.auth.signup.password}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {formData.password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-colors ${
                              passwordScore >= i
                                ? passwordScore <= 1
                                  ? "bg-destructive"
                                  : passwordScore <= 2
                                    ? "bg-warning"
                                    : "bg-success"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle
                            className={`w-3 h-3 ${
                              passwordStrength.hasLength
                                ? "text-success"
                                : "text-muted-foreground"
                            }`}
                          />
                          At least 8 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle
                            className={`w-3 h-3 ${
                              passwordStrength.hasUpper
                                ? "text-success"
                                : "text-muted-foreground"
                            }`}
                          />
                          One uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle
                            className={`w-3 h-3 ${
                              passwordStrength.hasLower
                                ? "text-success"
                                : "text-muted-foreground"
                            }`}
                          />
                          One lowercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle
                            className={`w-3 h-3 ${
                              passwordStrength.hasNumber
                                ? "text-success"
                                : "text-muted-foreground"
                            }`}
                          />
                          One number
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium mb-2"
                  >
                    {t.auth.signup.confirmPassword}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border border-border cursor-pointer mt-0.5"
                    required
                  />
                  <span className="text-sm text-muted-foreground">
                    {t.auth.signup.agreeTerms}
                  </span>
                </label>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px]"
                >
                  {loading ? t.common.loading : "Create Instructor Account"}
                </Button>

                {/* Sign In Link */}
                <p className="text-center text-sm text-muted-foreground">
                  Already an instructor?{" "}
                  <Link
                    href="/instructor/login"
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign In
                  </Link>
                </p>

                {/* Student Sign Up Link */}
                <p className="text-center text-sm text-muted-foreground">
                  Want to learn instead?{" "}
                  <Link
                    href="/signup"
                    className="text-primary font-semibold hover:underline"
                  >
                    Student Sign Up
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
