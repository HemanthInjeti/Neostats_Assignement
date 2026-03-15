"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { UploadMinutesForm } from "@/components/forms/upload-minutes-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";

export default function PublicHubPage() {
  const { token, user } = useAuth();
  const [digest, setDigest] = useState([]);
  const [minutes, setMinutes] = useState([]);
  const [search, setSearch] = useState("");

  const load = async (nextSearch = "") => {
    const [digestData, minuteData] = await Promise.all([api.getDigest(token), api.getMinutes(token, nextSearch)]);
    setDigest(digestData);
    setMinutes(minuteData);
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  return (
    <AppShell roles={["staff", "secretariat"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Public Hub</h1>
          <p className="text-slate-600">Surface trust-building updates, outcomes, and searchable meeting records for staff.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Digest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {digest.map((item) => (
                <article key={item._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-700">{item.trackingId} • {item.category}</p>
                  <h2 className="mt-2 text-lg font-semibold">{item.department} resolution summary</h2>
                  <p className="mt-2 text-slate-600">{item.description}</p>
                  <p className="mt-3 text-sm font-medium text-slate-800">Action taken: {item.actionTaken || "Pending publication"}</p>
                  <p className="text-sm text-slate-500">What changed: {item.changeOutcome || "Outcome details coming soon"}</p>
                </article>
              ))}
            </CardContent>
          </Card>

          {user?.role === "secretariat" ? <UploadMinutesForm onUploaded={() => load(search)} /> : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Impact Tracking Table</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue raised</TableHead>
                  <TableHead>Action taken</TableHead>
                  <TableHead>What changed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {digest.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.actionTaken || "Pending"}</TableCell>
                    <TableCell>{item.changeOutcome || "Pending"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minutes Archive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-10"
                  placeholder="Search minutes by title or summary"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <button
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                onClick={() => load(search)}
              >
                Search
              </button>
            </div>
            <div className="space-y-3">
              {minutes.map((item) => (
                <div key={item._id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.summary || "No summary"}</p>
                    </div>
                    <Link
                      href={`${process.env.NEXT_PUBLIC_SERVER_URL}${item.file.path}`}
                      className="text-sm font-medium text-teal-700 underline"
                      target="_blank"
                    >
                      Open PDF
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
