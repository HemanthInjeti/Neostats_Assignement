"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";

export function CreatePollForm({ onCreated }) {
  const { token } = useAuth();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);

  const updateOption = (index, value) => {
    setOptions((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const addOption = () => setOptions((current) => [...current, ""]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.createPoll(
        {
          question,
          options: options.filter(Boolean)
        },
        token
      );
      setQuestion("");
      setOptions(["", ""]);
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Poll</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Question</Label>
            <Input value={question} onChange={(event) => setQuestion(event.target.value)} required />
          </div>
          <div className="space-y-3">
            <Label>Options</Label>
            {options.map((option, index) => (
              <Input key={index} value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Option ${index + 1}`} required />
            ))}
            <Button type="button" variant="outline" onClick={addOption}>Add option</Button>
          </div>
          <Button disabled={submitting}>{submitting ? "Creating..." : "Create Poll"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
