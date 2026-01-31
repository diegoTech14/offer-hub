"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Tab {
  key: string
  label: string
}

interface ProjectTabsProps {
  tabs: readonly Tab[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ProjectTabs({ tabs, activeTab, onTabChange }: ProjectTabsProps) {
  return (
    <div className="mx-auto w-full max-w-[680px]">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="flex items-center justify-evenly gap-2 rounded-none bg-slate-700 px-4 py-2 h-auto">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="rounded-none px-4 py-2 text-[15px] sm:text-base font-semibold transition data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-slate-100/90 data-[state=inactive]:hover:bg-slate-800"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}

