import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { User, LogOut, LogIn } from "lucide-react";

export function AuthComponent() {
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.auth.loggedInUser);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSigningIn(true);
    try {
      await signIn("password", { 
        email: email.trim(), 
        password,
        flow: isSignUp ? "signUp" : "signIn"
      });
      toast.success(isSignUp ? "Account created successfully!" : "Signed in successfully!");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(isSignUp ? "Failed to create account" : "Failed to sign in");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn("anonymous");
      toast.success("Signed in anonymously!");
    } catch (error) {
      console.error("Anonymous auth error:", error);
      toast.error("Failed to sign in anonymously");
    } finally {
      setIsSigningIn(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-slate-300">
          <User className="w-4 h-4" />
          <span className="text-sm">
            {user.name || user.email || "Anonymous User"}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/40 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <form onSubmit={handleAuth} className="flex items-center space-x-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
          disabled={isSigningIn}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
          disabled={isSigningIn}
        />
        <button
          type="submit"
          disabled={isSigningIn}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogIn className="w-4 h-4" />
          <span>{isSigningIn ? "..." : (isSignUp ? "Sign Up" : "Sign In")}</span>
        </button>
      </form>
      
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
      >
        {isSignUp ? "Sign In" : "Sign Up"}
      </button>
      
      <button
        onClick={handleAnonymousSignIn}
        disabled={isSigningIn}
        className="text-sm text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50"
      >
        Guest
      </button>
    </div>
  );
}