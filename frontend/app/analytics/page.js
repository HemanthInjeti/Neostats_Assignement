"use client";

import { useEffect, useState } from "react";
import { AlertOctagon } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DepartmentChart, DistributionChart } from "@/components/charts/analytics-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState({
    openByDepartment: [],
    byStatus: [],
    byCategory: [],
    hotspots: []
  });

  useEffect(() => {
    if (token) {
      api.getAnalytics(token).then(setAnalytics);
    }
  }, [token]);

  return (
    <AppShell roles={["secretariat", "admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Analytics Dashboard</h1>
          <p className="text-slate-600">Spot operational pressure points and track case distribution across the organization.</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <DepartmentChart data={analytics.openByDepartment} />
          <DistributionChart title="Case Count by Status" data={analytics.byStatus} />
          <DistributionChart title="Case Count by Category" data={analytics.byCategory} />
          <Card>
            <CardHeader>
              <CardTitle>Hotspot Detection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.hotspots.length ? analytics.hotspots.map((hotspot) => (
                <div key={`${hotspot.department}-${hotspot.category}`} className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <AlertOctagon className="mt-0.5 h-5 w-5 text-rose-600" />
                  <div>
                    <p className="font-semibold text-rose-700">{hotspot.department} - {hotspot.category}</p>
                    <p className="text-sm text-rose-600">{hotspot.count} open cases crossed the hotspot threshold.</p>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-500">No department-category hotspots detected.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
