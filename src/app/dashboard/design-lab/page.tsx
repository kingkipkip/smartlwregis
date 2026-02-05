'use client'

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Activity, BarChart, FileText, CheckCircle, Clock } from "lucide-react"

export default function DesignLabPage() {
    return (
        <div className="space-y-8 p-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">UI Design Concepts (Live Preview)</h1>
                <p className="text-muted-foreground">เปรียบเทียบรูปแบบดีไซน์ 3 คอนเซปต์ (สามารถกดเล่นได้จริง)</p>
            </div>

            <Tabs defaultValue="concept-1" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-14">
                    <TabsTrigger value="concept-1" className="text-base">Concept 1: Neo-Glass</TabsTrigger>
                    <TabsTrigger value="concept-2" className="text-base">Concept 2: Cyber-Tech</TabsTrigger>
                    <TabsTrigger value="concept-3" className="text-base">Concept 3: Minimalist</TabsTrigger>
                </TabsList>

                {/* Concept 1: Neo-Glass */}
                <TabsContent value="concept-1" className="mt-6 p-8 rounded-3xl bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center min-h-[600px] border">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
                        {/* Sidebar (Mock) */}
                        <div className="hidden md:flex md:col-span-3 flex-col gap-4 p-4 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-xl text-slate-800">
                            <div className="h-10 w-10 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-xl mb-6 shadow-lg"></div>
                            <div className="space-y-2 font-medium">
                                <div className="p-3 bg-white/60 rounded-2xl shadow-sm text-blue-700">Dashboard</div>
                                <div className="p-3 hover:bg-white/30 rounded-2xl transition-colors">Requests</div>
                                <div className="p-3 hover:bg-white/30 rounded-2xl transition-colors">History</div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="md:col-span-9 space-y-6">
                            {/* Header Card */}
                            <div className="p-6 rounded-3xl bg-white/60 backdrop-blur-md border border-white/50 shadow-lg">
                                <h2 className="text-2xl font-bold text-slate-800">Welcome Back, Teacher</h2>
                                <p className="text-slate-600">You have 3 pending requests today.</p>
                            </div>

                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-lg border border-white/60 shadow-xl transition-transform hover:scale-[1.02]">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-12 w-12 rounded-2xl bg-blue-100/50 flex items-center justify-center text-blue-600">
                                            <Activity />
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 text-xs font-bold border border-blue-200">New</span>
                                    </div>
                                    <div className="text-4xl font-bold text-slate-800 mb-1">24</div>
                                    <p className="text-slate-600 font-medium">Pending Requests</p>
                                </div>

                                <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-white/60 shadow-xl">
                                    <div className="text-lg font-bold text-slate-800 mb-4">Quick Actions</div>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30 transition-shadow font-medium">
                                            Approve All
                                        </button>
                                        <button className="px-4 py-2 rounded-xl bg-white/50 text-slate-700 hover:bg-white/80 transition-colors font-medium">
                                            Filter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Concept 2: Cyber-Tech */}
                <TabsContent value="concept-2" className="mt-6 p-8 rounded-xl bg-slate-950 min-h-[600px] border border-slate-800 relative overflow-hidden font-mono">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-70"></div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full relative z-10">
                        {/* Sidebar */}
                        <div className="hidden md:flex md:col-span-3 flex-col gap-4 p-4 border-r border-slate-800/50 text-slate-400">
                            <div className="h-8 w-8 bg-cyan-500 animate-pulse rounded-sm mb-6 box-shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                            <div className="space-y-1 text-sm tracking-wider">
                                <div className="p-3 border-l-2 border-cyan-500 bg-cyan-950/30 text-cyan-400">DASHBOARD_V2</div>
                                <div className="p-3 hover:text-cyan-200 transition-colors">MONITORING</div>
                                <div className="p-3 hover:text-cyan-200 transition-colors">LOGS</div>
                            </div>
                        </div>

                        <div className="md:col-span-9 space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-slate-900 border border-slate-800 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.5)] relative group">
                                    <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t border-r border-cyan-500"></div>
                                    <h3 className="text-slate-500 text-xs uppercase tracking-widest mb-2">System Status</h3>
                                    <div className="text-2xl text-cyan-400 font-bold mb-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">ONLINE</div>
                                    <div className="h-1 w-full bg-slate-800 mt-2 overflow-hidden">
                                        <div className="h-full bg-cyan-500 w-[85%]"></div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-900 border border-slate-800 rounded-sm relative">
                                    <h3 className="text-slate-500 text-xs uppercase tracking-widest mb-2">Pending Jobs</h3>
                                    <div className="text-2xl text-pink-500 font-bold mb-1 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">12</div>
                                    <div className="text-xs text-pink-500/70 border border-pink-500/30 inline-block px-1 mt-1">URGENT</div>
                                </div>

                                <div className="p-6 bg-slate-900 border border-slate-800 rounded-sm relative">
                                    <h3 className="text-slate-500 text-xs uppercase tracking-widest mb-2">Total Processed</h3>
                                    <div className="text-2xl text-green-400 font-bold mb-1 font-mono">1,024</div>
                                </div>
                            </div>

                            {/* Table Mock */}
                            <div className="border border-slate-800 bg-slate-900/50 p-4 rounded-sm">
                                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                                    <h3 className="text-cyan-400 text-sm uppercase">Recent Data Stream</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between p-2 bg-slate-800/50 border-l-2 border-green-500">
                                        <span className="text-slate-300">REQ-2024-001</span>
                                        <span className="text-green-400">COMPLETED</span>
                                    </div>
                                    <div className="flex justify-between p-2 bg-slate-800/30 border-l-2 border-yellow-500">
                                        <span className="text-slate-300">REQ-2024-002</span>
                                        <span className="text-yellow-400">PROCESSING</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Concept 3: Minimalist (Clean) */}
                <TabsContent value="concept-3" className="mt-6 p-8 rounded-xl bg-[#F5F5F7] min-h-[600px] border border-gray-200 text-gray-900">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 h-full">
                        {/* Sidebar */}
                        <div className="hidden md:flex md:col-span-2 flex-col gap-8 pt-4 ">
                            <div className="h-6 w-6 bg-gray-900 rounded-md"></div>
                            <div className="space-y-4 text-[15px] font-medium text-gray-500">
                                <div className="text-gray-900">Overview</div>
                                <div className="hover:text-gray-900 cursor-pointer">Requests</div>
                                <div className="hover:text-gray-900 cursor-pointer">Students</div>
                                <div className="hover:text-gray-900 cursor-pointer">Settings</div>
                            </div>
                        </div>

                        <div className="md:col-span-10 space-y-8">
                            <div>
                                <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">Dashboard</h2>
                                <p className="text-gray-500 text-lg font-light">Overview of your activity.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white p-8 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300">
                                    <div className="text-gray-500 text-sm font-medium mb-4">Total Requests</div>
                                    <div className="text-4xl font-semibold text-gray-900 tracking-tight">142</div>
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300">
                                    <div className="text-gray-500 text-sm font-medium mb-4">Pending</div>
                                    <div className="text-4xl font-semibold text-orange-500 tracking-tight">8</div>
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 flex items-center justify-center border-2 border-dashed border-gray-200 cursor-pointer group">
                                    <div className="text-center">
                                        <div className="mx-auto h-8 w-8 mb-2 text-gray-400 group-hover:text-gray-600 transition-colors">+</div>
                                        <span className="text-gray-500 font-medium group-hover:text-gray-700">New Request</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                                <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
                                <div className="space-y-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                            <div className="flex gap-4 items-center">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">Grade Correction #{i}492</div>
                                                    <div className="text-sm text-gray-500">Submitted 2 hours ago</div>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">Completed</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
