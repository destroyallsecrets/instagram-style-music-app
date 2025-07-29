import { useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AutoLogin() {
  const { signIn } = useAuthActions();
  const user = useQuery(api.auth.loggedInUser);

  useEffect(() => {
    // Auto-sign in as guest if no user is logged in
    if (user === null) {
      signIn("anonymous").catch((error) => {
        console.error("Auto guest login failed:", error);
      });
    }
  }, [user, signIn]);

  return null; // This component doesn't render anything
}