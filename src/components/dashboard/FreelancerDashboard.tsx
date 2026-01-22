"use client";

import React from "react";
import {
    CheckCircle2,
    Wallet,
    Star,
    Search,
    History,
    TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    color?: "teal" | "blue" | "indigo";
}

const StatCard = ({ title, value, icon: Icon, trend, color = "teal" }: StatCardProps) => {
    const colorClasses = {
        teal: "bg-teal-50 text-teal-600",
        blue: "bg-blue-50 text-blue-600",
        indigo: "bg-indigo-50 text-indigo-600",
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    {trend && (
                        <p className="text-xs font-medium text-green-600 mt-2 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> {trend}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export function FreelancerDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Freelancer Dashboard</h1>
                    <p className="text-slate-600 font-medium">View your earnings and browse new opportunities.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm">
                        <History className="w-4 h-4 mr-2" />
                        View History
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all hover:shadow-lg">
                        <Search className="w-4 h-4 mr-2" />
                        Browse Projects
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Completed Tasks"
                    value="48"
                    icon={CheckCircle2}
                    trend="85% success rate"
                    color="blue"
                />
                <StatCard
                    title="Earnings"
                    value="$12,850.00"
                    icon={Wallet}
                    trend="12% more than last month"
                    color="teal"
                />
                <StatCard
                    title="Average Rating"
                    value="4.9"
                    icon={Star}
                    color="indigo"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Available Projects Preview</h3>
                        <button className="text-sm text-indigo-600 font-semibold hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">E-commerce UI Refactor</h4>
                                    <span className="text-sm font-bold text-teal-600">$400 - $800</span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">Looking for an expert UI designer to modernize our checkout flow and product pages...</p>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-white border border-gray-100 rounded text-[10px] font-bold uppercase tracking-wider text-gray-400">React</span>
                                    <span className="px-2 py-1 bg-white border border-gray-100 rounded text-[10px] font-bold uppercase tracking-wider text-gray-400">Tailwind</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Star className="w-8 h-8 text-white fill-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
                    <p className="text-indigo-100/80 mb-6 text-sm">Get featured in searches and lower your project fees by 50%.</p>
                    <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-full font-bold w-full">
                        Learn More
                    </Button>
                </div>
            </div>
        </div>
    );
}
