/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { UserRole } from "../../types";
import {
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  Building,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Gitlab,
  Github,
  Globe2,
  X
} from "lucide-react";

export const GoogleLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3A11.91 11.91 0 0 0 12 0C7.34 0 3.268 2.659 1.214 6.559l4.052 3.206z"
    />
    <path
      fill="#FBBC05"
      d="M1.214 6.559A11.956 11.956 0 0 0 0 12c0 1.936.46 3.764 1.277 5.39l4.05-3.21A7.014 7.014 0 0 1 4.91 12c0-1.89.47-3.664 1.296-5.227l-4.05-3.211z"
    />
    <path
      fill="#4285F4"
      d="M12 24c3.24 0 5.955-1.072 7.936-2.918l-3.855-2.991c-1.127.755-2.573 1.209-4.08 1.209-3.137 0-5.792-2.122-6.741-4.977l-4.05 3.21A11.928 11.928 0 0 0 12 24z"
    />
    <path
      fill="#34A853"
      d="M19.936 21.082C22.49 18.72 24 15.22 24 11.09c0-1.136-.104-2.227-.3-3.272H12v6.236h6.732a5.755 5.755 0 0 1-2.495 3.773l3.7 2.871z"
    />
  </svg>
);

export const AuthPages: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    login, 
    loginWithGoogle, 
    register, 
    requestPasswordReset, 
    resetPassword, 
    verifyOtp, 
    usersList 
  } = useApp();
  
  // Local states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [passStrength, setPassStrength] = useState(0);

  // Google OAuth simulator states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignInOpen = () => {
    setGoogleError("");
    setCustomGoogleEmail("");
    setCustomGoogleName("");
    setShowGoogleModal(true);
  };

  const handleGoogleSelect = async (gEmail: string, gName: string) => {
    setGoogleError("");
    setIsGoogleLoading(true);
    try {
      const roleToOnboard = activeTab === "register" ? selectedRole : UserRole.USER;
      await loginWithGoogle(gEmail, gName, roleToOnboard);
      setShowGoogleModal(false);
    } catch (err) {
      setGoogleError("OAuth verification handshake failed.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async () => {
    if (!customGoogleEmail.trim()) {
      setGoogleError("Please specify a Google account email.");
      return;
    }
    if (!customGoogleEmail.includes("@")) {
      setGoogleError("Invalid email parameters format.");
      return;
    }
    const calculatedName = customGoogleName.trim() || customGoogleEmail.split("@")[0].toUpperCase();
    await handleGoogleSelect(customGoogleEmail.trim().toLowerCase(), calculatedName);
  };

  // Password assessment helper
  const handlePasswordChange = (val: string) => {
    setPassword(val);
    let str = 0;
    if (val.length >= 6) str += 25;
    if (/[A-Z]/.test(val)) str += 25;
    if (/[0-9]/.test(val)) str += 25;
    if (/[^A-Za-z0-9]/.test(val)) str += 25;
    setPassStrength(str);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please provide your email address and password.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      // Find user role from usersList database
      const existingUser = usersList?.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      const roleToUse = existingUser ? existingUser.role : UserRole.USER;
      await login(email.trim(), roleToUse, rememberMe);
    } catch (err) {
      setErrorMsg("Authentication failed. Internal server clearing issue.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("All fields are mandatory.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      const companyVal = company.trim() || "Merchant Integration Ltd.";
      await register(name, email, selectedRole, companyVal);
    } catch (err) {
      setErrorMsg("Failed to complete sign up.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeStr = otpCode.join("");
    if (codeStr.length < 6) {
      setErrorMsg("Please fill in the 6-digit cryptographic security code.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    const valid = await verifyOtp(codeStr);
    setLoading(false);
    if (valid) {
      // Complete OTP Verification and login
      const targetEmail = email || "guest.merchant@saas.io";
      const existingUser = usersList?.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
      const roleToUse = existingUser ? existingUser.role : UserRole.USER;
      await login(targetEmail, roleToUse, rememberMe);
    } else {
      setErrorMsg("Dynamic security coordinate mismatch. Try again.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter email to receive recovery instructions.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setActiveTab("reset");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("Password strength criteria failed (minimum 6 indexes).");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    await resetPassword(password);
    setLoading(false);
  };

  const handleOtpInput = (val: string, index: number) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otpCode];
    newOtp[index] = val.slice(-1);
    setOtpCode(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const copyDemoCreds = (role: UserRole) => {
    if (role === UserRole.ADMIN) {
      setEmail("sakethteegala@gmail.com");
      setSelectedRole(UserRole.ADMIN);
    } else {
      setEmail("john.merchant@saas.io");
      setSelectedRole(UserRole.USER);
    }
    setPassword("SandboxDemoPass123!");
    setPassStrength(100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Visual Ambient Injections */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[130px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[110px] -z-10" />
      
      <div className="w-full max-w-md bg-slate-950/70 backdrop-blur-2xl border border-slate-800/80 rounded-2xl shadow-2xl p-8 relative">
        
        {/* Portal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-purple-600 shadow-xl shadow-purple-500/10 text-white mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans mt-1">
            {activeTab === "login" && "Sign In"}
            {activeTab === "register" && "Create Account"}
            {activeTab === "otp" && "Verification Code"}
            {activeTab === "forgot" && "Reset Password"}
            {activeTab === "reset" && "Update Password"}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-snug">
            {activeTab === "login" && "Enter your credentials to access your console"}
            {activeTab === "register" && "Get started by creating a new account"}
            {activeTab === "otp" && "Enter the 6-digit code sent to your email"}
            {activeTab === "forgot" && "Enter your email to seek recovery instructions"}
            {activeTab === "reset" && "Enter your updated console password"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs flex gap-2 items-center leading-normal animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ------------------------------------------------------------------
            VIEW 1: SIGN IN / LOGIN PAGE
            ------------------------------------------------------------------ */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-purple-500 pl-9 pr-4 py-2.5 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="block text-xs font-semibold text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={() => setActiveTab("forgot")}
                  className="text-[10px] text-purple-400 hover:text-purple-350 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-purple-500 pl-9 pr-10 py-2.5 rounded-xl text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-800 text-purple-600 focus:ring-0"
                />
                Remember Me
              </label>
            </div>

            {/* Submit Action (Sign In button) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-xs flex justify-center items-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800/80"></div></div>
              <span className="relative bg-slate-950 px-3 text-[10px] text-slate-500 font-mono font-semibold uppercase">Or Authenticate</span>
            </div>

            {/* Google Authentication Option */}
            <button
              type="button"
              onClick={handleGoogleSignInOpen}
              className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-semibold py-2.5 rounded-xl text-xs flex justify-center items-center gap-2.5 shadow transition-all duration-150 cursor-pointer text-center"
            >
              <GoogleLogo className="w-4 h-4" />
              <span>Continue with Google</span>
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-xs text-slate-400 mt-6 pt-2">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className="text-purple-400 hover:text-purple-350 font-bold hover:underline cursor-pointer font-sans"
              >
                Sign Up
              </button>
            </p>
          </form>
        )}

        {/* ------------------------------------------------------------------
            VIEW 2: SIGN UP / MULTI-MERCHANT REGISTRATION PAGE
            ------------------------------------------------------------------ */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Saketh Teegala"
                  className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-purple-500 pl-9 pr-4 py-2.5 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-purple-500 pl-9 pr-4 py-2.5 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-purple-500 px-3 py-2.5 rounded-xl text-xs text-slate-300"
              >
                <option value={UserRole.USER}>Standard User (Merchant)</option>
                <option value={UserRole.ADMIN}>Platform Administrator</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-purple-500 pl-9 pr-10 py-2.5 rounded-xl text-xs text-white"
                />
              </div>
              
              {/* Force password strength visual health indicator */}
              {password && (
                <div className="space-y-1 mt-1">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 font-semibold">
                    <span>Password Strength</span>
                    <span>{passStrength}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passStrength <= 25 ? "bg-red-500" : passStrength <= 50 ? "bg-amber-500" : passStrength <= 75 ? "bg-purple-400" : "bg-emerald-500"
                      }`}
                      style={{ width: `${passStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-xs flex justify-center items-center gap-2 shadow"
            >
              {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : "Sign Up"}
            </button>

            {/* Google Authentication Option for Onboarding */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800/80"></div></div>
              <span className="relative bg-slate-950 px-3 text-[10px] text-slate-500 font-mono font-semibold uppercase">Or Onboard</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignInOpen}
              className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-semibold py-2.5 rounded-xl text-xs flex justify-center items-center gap-2.5 shadow transition-all duration-150 cursor-pointer text-center"
            >
              <GoogleLogo className="w-4 h-4" />
              <span>Continue with Google</span>
            </button>

            <p className="text-center text-xs text-slate-400 mt-5">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="text-purple-400 hover:text-purple-350 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* ------------------------------------------------------------------
            VIEW 3: OTP VERIFICATION
            ------------------------------------------------------------------ */}
        {activeTab === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="text-center">
              <p className="text-xs text-slate-300">
                A simulated MFA secure transit coordinate code was dispatched to{" "}
                <span className="font-mono text-purple-400 font-semibold">{email || "your email"}</span>.
                Enter details below to clear local sandbox boundaries.
              </p>
            </div>

            <div className="flex justify-between gap-2">
              {otpCode.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpInput(e.target.value, i)}
                  className="w-12 h-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-bold text-lg focus:outline-none focus:border-purple-550 focus:ring-1 focus:ring-purple-500"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-xs flex justify-center items-center gap-2 shadow"
            >
              {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : "Verify Code"}
            </button>

            <div className="text-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setOtpCode(["0", "0", "0", "0", "0", "0"]);
                  setErrorMsg("");
                }}
                className="text-slate-400 hover:text-slate-300 font-mono text-[10px] uppercase font-semibold"
              >
                Generate Sandbox Key (000000)
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------------
            VIEW 4: FORGOT PASSWORD
            ------------------------------------------------------------------ */}
        {activeTab === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-purple-500 pl-9 pr-4 py-2.5 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className="w-full bg-slate-900 hover:bg-slate-850 text-slate-350 py-2.5 rounded-xl text-xs font-semibold border border-slate-800"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* ------------------------------------------------------------------
            VIEW 5: RESET PASSWORD
            ------------------------------------------------------------------ */}
        {activeTab === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-purple-500 px-3 py-2.5 rounded-xl text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow"
            >
              Reset Password
            </button>
          </form>
        )}

      </div>

      {/* ------------------------------------------------------------------
          GOOGLE SELECTION OVERLAY / AUTHENTICATOR
          ------------------------------------------------------------------ */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 font-sans text-slate-800">
            
            {/* Google Header */}
            <div className="p-6 text-center border-b border-slate-100 relative">
              <button 
                type="button"
                onClick={() => {
                  setShowGoogleModal(false);
                  setGoogleError("");
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex justify-center mb-2">
                <GoogleLogo className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Sign in with Google</h3>
              <p className="text-xs text-slate-500 mt-1">to continue to <span className="font-semibold text-purple-600">Gateway Prime</span></p>
            </div>

            {isGoogleLoading ? (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" strokeWidth={2.5} />
                <p className="text-xs font-semibold text-slate-700 font-mono tracking-tight animate-pulse">Connecting with accounts.google.com API...</p>
              </div>
            ) : (
              <div className="p-6 space-y-4 font-sans">
                
                {googleError && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex gap-2 items-center leading-normal border border-red-100">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{googleError}</span>
                  </div>
                )}

                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Choose an account</span>

                {/* Account List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {/* Default Account: Saketh Teegala (User's actual email in metadata) */}
                  <button
                    onClick={() => handleGoogleSelect("sakethteegala@gmail.com", "Saketh Teegala")}
                    type="button"
                    className="w-full p-3 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/20 text-left transition flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center uppercase group-hover:scale-105 duration-150">
                        ST
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-800 font-sans">Saketh Teegala</span>
                        <span className="block text-[11px] text-slate-500 truncate font-mono">sakethteegala@gmail.com</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                      Compliance L3
                    </div>
                  </button>

                  {/* Account Option 2: John Merchant */}
                  <button
                    onClick={() => handleGoogleSelect("john.merchant@saas.io", "John Merchant")}
                    type="button"
                    className="w-full p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 text-left transition flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center uppercase group-hover:scale-105 duration-150">
                        JM
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-800 font-sans">John Merchant</span>
                        <span className="block text-[11px] text-slate-500 truncate font-mono">john.merchant@saas.io</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
                      Merchant
                    </div>
                  </button>
                </div>

                <div className="relative py-1 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                  <span className="relative bg-white px-2.5 text-[10px] text-slate-400 font-semibold uppercase">Or Use Another Account</span>
                </div>

                {/* Custom add account details form */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500 px-3 py-2 rounded-lg text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Google Email</label>
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500 px-3 py-2 rounded-lg text-xs text-slate-800 font-medium"
                    />
                  </div>

                  {/* Onboarding info note */}
                  <div className="bg-purple-50 border border-purple-100 p-2.5 rounded-xl text-[10px] text-purple-800 leading-snug">
                    ℹ️ <span className="font-bold">Onboarding Identity Mapping</span>: Since this email doesn't exist on our live settlement ledger, we will auto-generate your API parameters and assign role: <span className="font-bold">{activeTab === "register" ? (selectedRole === "ADMIN" ? "Compliance Administrator" : "Merchant User") : "Merchant User" }</span> upon connection.
                  </div>

                  <button
                    onClick={handleCustomGoogleSubmit}
                    type="button"
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2 rounded-xl text-xs shadow-md transition cursor-pointer"
                  >
                    Authenticate Account via OAuth
                  </button>
                </div>

                <div className="text-center pt-1">
                  <p className="text-[9px] text-slate-400 leading-normal">
                    By continuing, Google shares your credentials and avatar profile picture with Gateway Prime. See our Compliance Guidelines and Privacy Shield regulations.
                  </p>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
