"use client";

import { useState } from "react";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function ProfileTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const handleTestProfile = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await authService.getUserProfile();
      setResult(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile");
      console.error("Profile API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
    // window.location.href = "/login";
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={handleTestProfile} disabled={loading}>
              {loading ? "Testing..." : "Test Profile API"}
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="p-4 bg-success/10 border border-success text-success rounded-lg">
              <strong>Success:</strong>
              <pre className="mt-2 text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Token Information:</h3>
            <div className="text-sm space-y-1">
              <p>
                <strong>Access Token:</strong>{" "}
                {authService.getAccessToken()
                  ? `${authService.getAccessToken()?.substring(0, 20)}...`
                  : "Not found"}
              </p>
              <p>
                <strong>Refresh Token:</strong>{" "}
                {authService.getRefreshToken()
                  ? `${authService.getRefreshToken()?.substring(0, 20)}...`
                  : "Not found"}
              </p>
              <p>
                <strong>Is Authenticated:</strong>{" "}
                {authService.isAuthenticated() ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
