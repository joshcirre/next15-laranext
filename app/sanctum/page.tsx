"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SanctumPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("john@example.com");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulate login with user info
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/external-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            email: email,
            name: email.split('@')[0],  // Simple name from email
          }),
        },
      );

      if (!res.ok) {
        throw new Error(`Login failed with status: ${res.status}`);
      }

      const data = await res.json();

      if (data.token) {
        // Set token as a cookie with proper attributes for cross-domain API access
        document.cookie = `apiToken=${data.token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`; // 30 days

        // Add a small delay to ensure cookie is set before redirecting
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);
      } else {
        setError("Invalid response - no token received");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-full min-h-screen py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">External Auth Portal</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  placeholder="john@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value="password" // Prefilled for demo purposes
                  disabled
                />
                <p className="text-xs text-gray-500">
                  (Password is pre-filled for this demo)
                </p>
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center w-full text-gray-500">
              This is a simulated external authentication service
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
