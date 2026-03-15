"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { roles } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("staff");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setEmail("");
    setPassword("");
    if (nextMode === "signup") {
      setName("");
      setDepartment("");
      setRole("staff");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ name, department, role, email, password });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#dff2ff_0%,#eef8ff_45%,#f7fbff_100%)] px-6 py-12">
      <div className="w-full max-w-md">
        <Card className="border-sky-100 bg-white/95 shadow-xl shadow-sky-100/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-3xl text-sky-900">NeoConnect</CardTitle>
            <div className="flex rounded-xl bg-sky-50 p-1">
              <button
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${mode === "login" ? "bg-white text-sky-900 shadow-sm" : "text-sky-700"}`}
                onClick={() => switchMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${mode === "signup" ? "bg-white text-sky-900 shadow-sm" : "text-sky-700"}`}
                onClick={() => switchMode("signup")}
                type="button"
              >
                Sign Up
              </button>
            </div>
            <CardTitle className="text-center text-slate-900">{mode === "login" ? "Login" : "Sign Up"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "signup" ? (
                <>
                  <div className="space-y-2">
                    <Label>Full name</Label>
                    <Input value={name} onChange={(event) => setName(event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={department} onChange={(event) => setDepartment(event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.value === "case_manager" ? "Manager" : item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : null}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>
              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
              <Button className="w-full bg-sky-600 hover:bg-sky-700" disabled={loading}>
                {loading ? (mode === "login" ? "Signing in..." : "Creating account...") : (mode === "login" ? "Login" : "Sign Up")}
              </Button>
            </form>
            {mode === "login" ? (
              <p className="mt-4 text-center text-sm text-slate-600">
                Create account{" "}
                <button className="font-medium text-sky-700 underline" type="button" onClick={() => switchMode("signup")}>
                  Sign Up
                </button>
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
