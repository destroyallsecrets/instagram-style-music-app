import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Shield, LogIn, ArrowLeft } from "lucide-react";

const ADMIN_EMAIL = "owseshell@gmail.com";

export function AdminLogin() {
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.auth.loggedInUser);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (email.trim() !== ADMIN_EMAIL) {
      toast.error("Unauthorized: Admin access only");
      return;
    }

    setIsSigningIn(true);
    try {
      // First try to sign in
      await signIn("password", { 
        email: email.trim(), 
        password,
        flow: "signIn"
      });
      toast.success("Admin signed in successfully!");
      setEmail("");
      setPassword("");
    } catch (signInError) {
      console.log("Sign in failed, trying sign up...", signInError);
      
      // If sign in fails, try to create the admin account
      try {
        await signIn("password", { 
          email: email.trim(), 
          password,
          flow: "signUp"
        });
        toast.success("Admin account created and signed in successfully!");
        setEmail("");
        setPassword("");
      } catch (signUpError) {
        console.error("Admin auth error:", signUpError);
        toast.error("Failed to sign in as admin. Please check your password or try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Admin signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const goBack = () => {
    window.history.back();
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-md w-full mx-4">
          <div className="glass rounded-2xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Admin Access Granted</h2>
            <p className="text-slate-300 mb-6">
              Welcome, {user.email}. You have admin privileges.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={goBack}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Return to App
              </button>
              <button
                type="button"
                onClick={() => { void handleSignOut(); }}
                className="w-full py-2 px-4 text-slate-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md w-full mx-4">
        <div className="glass rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
            <p className="text-slate-400 mb-2">Authorized personnel only</p>
            <p className="text-xs text-slate-500">
              First time? Your admin account will be created automatically.
            </p>
          </div>

          <form onSubmit={(e) => { void handleAdminAuth(e); }} className="space-y-6">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-slate-300 mb-2">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                disabled={isSigningIn}
                required
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                disabled={isSigningIn}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-orange-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              {isSigningIn ? "Signing In..." : "Sign In as Admin"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={goBack}
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              ← Back to App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}