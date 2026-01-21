"use client";

import React from "react";
import {
    Briefcase,
    DollarSign,
    Clock,
    Plus,
    Eye,
    ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
}

const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {trend && (
                    <p className="text-xs font-medium text-teal-600 mt-2 flex items-center">
                        {trend} <ArrowUpRight className="w-3 h-3 ml-1" />
                    </p>
                )}
            </div>
            <div className="p-3 bg-teal-50 rounded-xl">
                <Icon className="w-6 h-6 text-teal-600" />
            </div>
        </div>
    </div>
);

export function ClientDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Client Dashboard</h1>
                    <p className="text-slate-600 font-medium">Manage your projects and recruitment workflow.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View My Projects
                    </Button>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Project
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Active Projects"
                    value="12"
                    icon={Briefcase}
                    trend="+2 this month"
                />
                <StatCard
                    title="Total Spent"
                    value="$4,250.00"
                    icon={DollarSign}
                />
                <StatCard
                    title="Pending Tasks"
                    value="8"
                    icon={Clock}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Project Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                    {i}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Milestone completed for "Mobile App UI"</p>
                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Placeholder for other navigation/content */}
                <div className="bg-teal-900 rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-center">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Find the best talent</h3>
                        <p className="text-teal-100/80 mb-6 text-sm max-w-xs">Browse our curated list of experts ready to help you with your next big idea.</p>
                        <Button className="bg-white text-teal-900 hover:bg-teal-50 rounded-full font-bold px-6">
                            Browse Marketplace
                        </Button>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-teal-800 rounded-full blur-3xl opacity-50" />
                </div>
            </div>
        </div>
    );
}
