"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";

export function UploadMinutesForm({ onUploaded }) {
  const { token } = useAuth();
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("summary", summary);
    formData.append("file", file);

    setLoading(true);
    try {
      await api.uploadMinutes(formData, token);
      setTitle("");
      setSummary("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      event.target.reset();
      onUploaded();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Meeting Minutes</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Summary</Label>
            <Textarea value={summary} onChange={(event) => setSummary(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>PDF file</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              required
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
              <span className="text-sm text-slate-500">{file ? file.name : "No file selected"}</span>
            </div>
          </div>
          <Button disabled={loading}>{loading ? "Uploading..." : "Upload Minutes"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
