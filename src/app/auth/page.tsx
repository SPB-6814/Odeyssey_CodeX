"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  // Validation logic
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  
  const isValidSignup = hasMinLength && hasUppercase && hasNumber && hasSpecial && passwordsMatch && email.includes("@") && name.length > 0;
  const isValidLogin = email.includes("@") && password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin && isValidLogin) {
      const mockName = email.split('@')[0] || "Analyst";
      localStorage.setItem("userName", mockName);
      localStorage.setItem("userEmail", email);
      router.push("/");
    } else if (!isLogin && isValidSignup) {
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", email);
      router.push("/");
    }
  };

  const handleGoogleAuth = () => {
    // Mock Google auth success
    localStorage.setItem("userName", "Google User");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] opacity-30"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-inter text-[11px] font-bold uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Dashboard
        </Link>

        {/* Auth Panel */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-2xl">shield_person</span>
            </div>
            <h1 className="font-h2 text-2xl font-bold text-white mb-2">
              {isLogin ? "Welcome Back" : "Create Profile"}
            </h1>
            <p className="text-slate-400 text-sm font-body-sm">
              {isLogin ? "Sign in to access your digital watchtower." : "Register to start monitoring digital assets."}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex p-1 bg-black/40 rounded-lg mb-8 border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-all ${isLogin ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-all ${!isLogin ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">person</span>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-body-sm"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">mail</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-body-sm"
                  placeholder="analyst@sentinel.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">lock</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-body-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Confirm Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">lock_reset</span>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full bg-black/40 border rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-all font-body-sm ${confirmPassword.length > 0 ? (passwordsMatch ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/50' : 'border-error/50 focus:border-error/50 focus:ring-error/50') : 'border-white/10 focus:border-primary/50 focus:ring-primary/50'}`}
                      placeholder="••••••••"
                      required={!isLogin}
                    />
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-black/20 rounded-lg p-4 border border-white/5 space-y-2 mt-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Security Requirements</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`flex items-center gap-2 text-[11px] ${hasMinLength ? 'text-green-400' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[14px]">{hasMinLength ? 'check_circle' : 'radio_button_unchecked'}</span>
                      8+ Characters
                    </div>
                    <div className={`flex items-center gap-2 text-[11px] ${hasUppercase ? 'text-green-400' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[14px]">{hasUppercase ? 'check_circle' : 'radio_button_unchecked'}</span>
                      Uppercase Letter
                    </div>
                    <div className={`flex items-center gap-2 text-[11px] ${hasNumber ? 'text-green-400' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[14px]">{hasNumber ? 'check_circle' : 'radio_button_unchecked'}</span>
                      Number
                    </div>
                    <div className={`flex items-center gap-2 text-[11px] ${hasSpecial ? 'text-green-400' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[14px]">{hasSpecial ? 'check_circle' : 'radio_button_unchecked'}</span>
                      Special Character
                    </div>
                  </div>
                </div>
              </>
            )}

            {isLogin && (
              <div className="flex justify-end pt-1">
                <a href="#" className="text-[11px] font-semibold text-primary hover:text-primary-fixed transition-colors">Forgot Password?</a>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLogin ? !isValidLogin : !isValidSignup}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[12px] transition-all shadow-lg mt-4 ${
                (isLogin ? isValidLogin : isValidSignup) 
                  ? 'bg-primary hover:bg-primary-fixed text-on-primary shadow-primary/20 cursor-pointer' 
                  : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              {isLogin ? "Authenticate" : "Initialize Profile"}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-slate-900 px-4 text-slate-500">Secure Link</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleAuth}
            className="w-full mt-6 bg-white hover:bg-slate-100 text-black py-3.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-3 transition-colors shadow-lg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
        
        <p className="text-center text-slate-500 text-[10px] mt-6 tracking-widest uppercase font-bold">
          Protected by Sentinel Security
        </p>
      </div>
    </div>
  );
}
