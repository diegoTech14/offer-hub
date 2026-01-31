"use client";

import { ReactNode, useMemo } from "react";
import PillTabs from "@/components/tabs/pill-tabs";
import { usePathname, useRouter } from "next/navigation";

export default function TabsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const current = useMemo(() => {
    if (pathname?.endsWith("/active")) return "active";
    if (pathname?.endsWith("/completed")) return "completed";
    if (pathname?.endsWith("/analytics")) return "analytics";
    if (pathname?.endsWith("/dispute")) return "dispute";
    return "active-project";
  }, [pathname]);

  const tabs = [
    { label: 'Active Projects', value: 'active', href: '/onboarding/dashboard/active', component: <div /> },
    { label: 'Completed', value: 'completed', href: '/onboarding/dashboard/completed', component: <div /> },
    { label: 'Analytics', value: 'analytics', href: '/onboarding/dashboard/analytics', component: <div /> },
    { label: 'Dispute', value: 'dispute', href: '/onboarding/dashboard/dispute', component: <div /> },
  ];

  const sectionTitle = useMemo(() => {
    switch (current) {
      case 'active':
        return 'Manage Projects';
      case 'completed':
        return 'Completed Projects';
      case 'analytics':
        return 'Analytics Overview';
      case 'dispute':
        return 'Dispute Management';
      default:
        return 'Projects';
    }
  }, [current]);

  return (
    <div className="space-y-4">
      <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{sectionTitle}</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 pt-4">
          <PillTabs
            tabs={tabs}
            value={current}
            onValueChange={(v) => {
              const target = tabs.find(t => t.value === v)?.href;
              if (target) router.push(target);
            }}
            renderContent={false}
            tabsListclassName="bg-gray-100 rounded-lg p-1"
            triggerClassName="text-gray-700 font-medium"
            activeTriggerClassName="data-[state=active]:bg-[#149A9B] data-[state=active]:text-white data-[state=active]:shadow-sm"
            inactiveTriggerClassName="data-[state=inactive]:text-gray-600 hover:text-gray-900"
          />
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}


