"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PollChart } from "@/components/charts/analytics-charts";
import { CreatePollForm } from "@/components/forms/create-poll-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";

export default function PollsPage() {
  const { token, user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    const data = await api.getPolls(token);
    setPolls(data);
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const vote = async (pollId, optionId) => {
    setError("");
    try {
      await api.votePoll(pollId, { optionId }, token);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppShell roles={["staff", "secretariat"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Staff Polling</h1>
          <p className="text-slate-600">Create quick feedback loops and show results transparently.</p>
        </div>

        {user?.role === "secretariat" ? <CreatePollForm onCreated={load} /> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <div className="grid gap-6 xl:grid-cols-2">
          {polls.map((poll) => (
            <Card key={poll._id}>
              <CardHeader>
                <CardTitle>{poll.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  {poll.options.map((option) => (
                    <Button
                      key={option._id}
                      variant="outline"
                      className="justify-start"
                      onClick={() => vote(poll._id, option._id)}
                      disabled={user?.role !== "staff"}
                    >
                      {option.text}
                    </Button>
                  ))}
                </div>
                <PollChart data={poll.options} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
