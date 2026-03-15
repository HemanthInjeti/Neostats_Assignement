"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { categories, severities } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";

export default function SubmitCasePage() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    category: "Safety",
    department: "",
    location: "",
    severity: "Low",
    description: "",
    anonymous: false,
    attachment: null
  });
  const [createdId, setCreatedId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value);
    });

    setLoading(true);
    try {
      const data = await api.createCase(formData, token);
      setCreatedId(data.trackingId);
      setForm({
        category: "Safety",
        department: "",
        location: "",
        severity: "Low",
        description: "",
        anonymous: false,
        attachment: null
      });
      event.target.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell roles={["staff"]}>
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Submit Complaint or Feedback</CardTitle>
            <CardDescription>Anonymous reporting is supported and every submission receives a tracking ID.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={form.severity} onValueChange={(value) => setForm((current) => ({ ...current, severity: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {severities.map((severity) => <SelectItem key={severity} value={severity}>{severity}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Attachment (photo or PDF)</Label>
                <Input type="file" accept="image/*,.pdf" onChange={(event) => setForm((current) => ({ ...current, attachment: event.target.files?.[0] || null }))} />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-100 p-4">
                <div>
                  <p className="font-medium">Submit anonymously</p>
                  <p className="text-sm text-slate-500">Management can still track the case lifecycle without exposing your identity.</p>
                </div>
                <Switch checked={form.anonymous} onCheckedChange={(checked) => setForm((current) => ({ ...current, anonymous: checked }))} />
              </div>
              {createdId ? <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Case created successfully. Tracking ID: {createdId}</p> : null}
              <Button disabled={loading}>{loading ? "Submitting..." : "Submit Case"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
