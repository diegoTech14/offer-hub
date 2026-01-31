"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Search, Filter, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketplacePage() {
    return (
        <RoleGuard allowedRole="freelancer">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
                    <p className="text-gray-500">Find your next project and start earning.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold flex items-center gap-2 mb-4">
                                <Filter className="w-4 h-4" /> Filters
                            </h3>
                            {/* Placeholder for filters */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                                    <div className="mt-2 space-y-2">
                                        {["Design", "Development", "Writing"].map(cat => (
                                            <div key={cat} className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded border-gray-300" />
                                                <span className="text-sm text-gray-600">{cat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-3 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            Full Stack Developer for DeFi Dashboard
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> Fixed Price</span>
                                            <span>Budget: $2k - $5k</span>
                                            <span>Posted 3h ago</span>
                                        </div>
                                    </div>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-full">Apply Now</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
