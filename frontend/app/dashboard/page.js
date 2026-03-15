"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ClipboardCheck, Clock3, LogOut, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreatePollForm } from "@/components/forms/create-poll-form";
import { UploadMinutesForm } from "@/components/forms/upload-minutes-form";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";
import { statusColors } from "@/lib/utils";

const icons = [ClipboardCheck, Clock3, AlertTriangle, Shield];

export default function DashboardPage() {
  const { token, user, logout } = useAuth();
  const [cases, setCases] = useState([]);
  const [polls, setPolls] = useState([]);
  const [users, setUsers] = useState([]);
  const [minutes, setMinutes] = useState([]);

  const load = async () => {
    const [caseData, pollData, minuteData] = await Promise.all([
      api.getCases(token),
      api.getPolls(token),
      api.getMinutes(token)
    ]);
    setCases(caseData);
    setPolls(pollData);
    setMinutes(minuteData);

    if (user?.role === "admin") {
      const userData = await api.listUsers(token);
      setUsers(userData);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const stats = [
    { label: "Total cases", value: cases.length },
    { label: "Open cases", value: cases.filter((item) => item.status !== "Resolved").length },
    { label: "Escalated", value: cases.filter((item) => item.status === "Escalated").length },
    { label: "Resolved", value: cases.filter((item) => item.status === "Resolved").length }
  ];

  const updateUserStatus = async (selectedUser, isActive) => {
    await api.updateUser(selectedUser.id, { ...selectedUser, isActive }, token);
    await load();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-teal-700">Control center</p>
            <h1 className="text-3xl font-semibold">Hello, {user?.name}</h1>
            <p className="text-slate-600">
              {user?.role === "staff" && "Submit feedback or complaints, vote in polls, and read company updates and announcements."}
              {user?.role === "secretariat" && "View all cases, assign them to a case manager, create polls, and upload meeting minutes."}
              {user?.role === "case_manager" && "View cases assigned to you, update case status, add responses, and close cases."}
              {user?.role === "admin" && "Manage user accounts and handle system security settings."}
            </p>
          </div>
          <Button variant="outline" className="bg-white" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = icons[index];
            return (
              <Card key={stat.label} className="border-0 bg-slate-950 text-white">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-slate-300">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                  </div>
                  <Icon className="h-9 w-9 text-emerald-300" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>{user?.role === "case_manager" ? "Assigned Case Activity" : "Recent Case Activity"}</CardTitle>
              <CardDescription>
                {user?.role === "case_manager"
                  ? "Only cases assigned to you are shown here."
                  : "Newest complaints and feedback items flowing through the lifecycle."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {cases.slice(0, 6).map((item) => (
                <div key={item._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{item.trackingId}</p>
                      <Badge className={statusColors[item.status]}>{item.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  </div>
                  <div className="text-sm text-slate-500">
                    <p>{item.department}</p>
                    <p>{item.category}</p>
                  </div>
                </div>
              ))}
              {cases.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {user?.role === "case_manager"
                    ? "No assigned cases yet. Staff cases will appear after secretariat assigns them to you."
                    : "No cases yet."}
                </p>
              ) : null}
            </CardContent>
          </Card>

          {(user?.role === "staff" || user?.role === "secretariat") ? (
            <Card>
              <CardHeader>
                <CardTitle>Live Polls</CardTitle>
                <CardDescription>{polls.length} polls available right now.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {polls.slice(0, 4).map((poll) => (
                  <div key={poll._id} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-medium">{poll.question}</p>
                    <p className="mt-2 text-sm text-slate-500">{poll.options.length} options</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        {user?.role === "secretariat" ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <CreatePollForm onCreated={load} />
            <UploadMinutesForm onUploaded={load} />
          </div>
        ) : null}

        {user?.role === "admin" ? (
          <Card>
            <CardHeader>
              <CardTitle>Admin User Controls</CardTitle>
              <CardDescription>Enable or disable accounts and review role assignments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.map((listedUser) => (
                <div key={listedUser.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{listedUser.name}</p>
                    <p className="text-sm text-slate-500">{listedUser.email} - {listedUser.role}</p>
                  </div>
                  <Button variant={listedUser.isActive ? "destructive" : "outline"} onClick={() => updateUserStatus(listedUser, !listedUser.isActive)}>
                    {listedUser.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {(user?.role === "staff" || user?.role === "secretariat") ? (
          <Card>
            <CardHeader>
              <CardTitle>Minutes Archive Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {minutes.slice(0, 3).map((minute) => (
                <div key={minute._id} className="rounded-lg bg-slate-100 p-4">
                  <p className="font-medium">{minute.title}</p>
                  <p className="text-sm text-slate-500">{minute.summary || "No summary provided."}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
