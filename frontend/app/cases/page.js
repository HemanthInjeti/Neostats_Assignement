"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { caseStatuses } from "@/lib/constants";
import { statusColors } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";

function formatDate(date) {
  if (!date) return "Not available";
  return new Date(date).toLocaleDateString();
}

function formatDateTime(date) {
  if (!date) return "Not available";
  return new Date(date).toLocaleString();
}

function getDisplayStatus(item, role) {
  if (role === "secretariat") {
    return item.assignedTo ? "Assigned" : "Not Assigned";
  }
  return item.status;
}

function getStatusBadge(role, item) {
  if (role === "secretariat") {
    return item.assignedTo ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700";
  }
  return statusColors[item.status];
}

function CaseActions({ item, managers, onRefresh }) {
  const { user, token } = useAuth();
  const [managerId, setManagerId] = useState(item.assignedTo?._id || "");
  const [assignmentState, setAssignmentState] = useState(item.assignedTo ? "Assigned" : "Not Assigned");
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState("");
  const [actionTaken, setActionTaken] = useState(item.actionTaken || "");
  const [changeOutcome, setChangeOutcome] = useState(item.changeOutcome || "");

  const assign = async () => {
    if (assignmentState === "Not Assigned") {
      await api.assignCase(item._id, { assignedTo: null }, token);
      setManagerId("");
      onRefresh();
      return;
    }

    await api.assignCase(item._id, { assignedTo: managerId }, token);
    onRefresh();
  };

  const update = async () => {
    await api.updateCase(item._id, { status, note, actionTaken, changeOutcome }, token);
    setNote("");
    onRefresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Open</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item.trackingId}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Case Summary</p>
            <div className="mt-3 space-y-2 text-sm">
              <p><span className="font-medium">Category:</span> {item.category}</p>
              <p><span className="font-medium">Department:</span> {item.department}</p>
              <p><span className="font-medium">Status:</span> {getDisplayStatus(item, user.role)}</p>
              <p><span className="font-medium">Assigned to:</span> {item.assignedTo?.name || "Unassigned"}</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Case Dates</p>
            <div className="mt-3 space-y-2 text-sm">
              <p><span className="font-medium">Submitted:</span> {formatDateTime(item.createdAt)}</p>
              <p><span className="font-medium">Assigned:</span> {formatDateTime(item.assignedAt)}</p>
              <p><span className="font-medium">First response:</span> {formatDateTime(item.firstResponseAt)}</p>
              <p><span className="font-medium">Closed:</span> {formatDateTime(item.closedAt)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Case Details</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <p className="text-sm"><span className="font-medium">Severity:</span> {item.severity}</p>
            <p className="text-sm"><span className="font-medium">Location:</span> {item.location}</p>
            <p className="text-sm"><span className="font-medium">Anonymous:</span> {item.anonymous ? "Yes" : "No"}</p>
            <p className="text-sm"><span className="font-medium">Reminder sent:</span> {formatDate(item.reminderSentAt)}</p>
            <p className="text-sm md:col-span-2"><span className="font-medium">Action taken:</span> {item.actionTaken || "Not added"}</p>
            <p className="text-sm md:col-span-2"><span className="font-medium">What changed:</span> {item.changeOutcome || "Not added"}</p>
            <p className="text-sm md:col-span-2"><span className="font-medium">Attachment:</span> {item.attachment?.originalName || "No attachment"}</p>
          </div>
        </div>

        {user.role === "secretariat" ? (
          <div className="space-y-2">
            <Label>Assignment</Label>
            <div className="grid gap-2 md:grid-cols-[180px_1fr_auto]">
              <Select value={assignmentState} onValueChange={setAssignmentState}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Assigned">Not Assigned</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={managerId}
                onValueChange={setManagerId}
                disabled={assignmentState !== "Assigned"}
              >
                <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={assign} disabled={assignmentState === "Assigned" && !managerId}>
                Save
              </Button>
            </div>
          </div>
        ) : null}

        {user.role === "case_manager" ? (
          <>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {caseStatuses.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Internal/Public note</Label>
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add the latest action, response, or note." />
            </div>
            <div className="space-y-2">
              <Label>Action taken</Label>
              <Input value={actionTaken} onChange={(event) => setActionTaken(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>What changed</Label>
              <Input value={changeOutcome} onChange={(event) => setChangeOutcome(event.target.value)} />
            </div>
            <Button onClick={update}>Save updates</Button>
          </>
        ) : null}

        <div className="space-y-2">
          <Label>Timeline</Label>
          <div className="max-h-56 space-y-2 overflow-auto rounded-lg bg-slate-50 p-3">
            {item.notes.length ? item.notes.map((caseNote) => (
              <div key={caseNote._id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{caseNote.author?.name || "System"}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(caseNote.createdAt)}</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">{caseNote.message}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No notes yet.</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CasesPage() {
  const { token, user } = useAuth();
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");

  const load = async () => {
    const caseData = await api.getCases(token);
    setCases(caseData);
    if (user?.role === "secretariat") {
      const userData = await api.listCaseManagers(token);
      setUsers(userData);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token, user]);

  const filteredCases = useMemo(
    () => cases.filter((item) => [item.trackingId, item.department, item.category, item.status, item.description, item.actionTaken, item.changeOutcome].join(" ").toLowerCase().includes(query.toLowerCase())),
    [cases, query]
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Case Management</h1>
            <p className="text-slate-600">Track, assign, and resolve staff complaints with role-based controls.</p>
          </div>
          <div className="w-full md:w-72">
            <Input placeholder="Search by tracking ID, summary, department, status..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Visible Cases</CardTitle>
            <CardDescription>
              Staff see their own items, case managers see assigned work, and secretariat can assign case managers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Case Summary</TableHead>
                  <TableHead>Case Dates</TableHead>
                  <TableHead>Case Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action Taken</TableHead>
                  <TableHead>What Changed</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.trackingId}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{item.category}</p>
                        <p className="max-w-xs text-sm text-slate-500">{item.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>Submitted: {formatDate(item.createdAt)}</p>
                        <p>Updated: {formatDate(item.updatedAt)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>{item.department}</p>
                        <p>{item.location}</p>
                        <p>Severity: {item.severity}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(user?.role, item)}>{getDisplayStatus(item, user?.role)}</Badge>
                    </TableCell>
                    <TableCell>{item.actionTaken || "Not added"}</TableCell>
                    <TableCell>{item.changeOutcome || "Not added"}</TableCell>
                    <TableCell>{item.assignedTo?.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <CaseActions item={item} managers={users} onRefresh={load} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredCases.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                {user?.role === "case_manager"
                  ? "No assigned cases yet. Ask secretariat to assign staff-submitted cases to your account."
                  : "No cases found."}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
