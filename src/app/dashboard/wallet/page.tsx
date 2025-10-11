"use client";

import Navbar from "@/components/layout/navbar";
import { ClientSidebar } from "@/components/client-dashboard/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Copy, ExternalLink, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function WalletPage() {
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const walletInfo = {
    address: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    balance: "1,250.50",
    currency: "XLM",
    type: "invisible",
  };

  const recentTransactions = [
    {
      id: 1,
      type: "received",
      amount: "+500 XLM",
      from: "Project Payment",
      date: "Dec 10, 2025",
    },
    {
      id: 2,
      type: "sent",
      amount: "-50 XLM",
      to: "Service Fee",
      date: "Dec 8, 2025",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar showAuth={true} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-64">
          <ClientSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
              <p className="text-gray-600 mt-1">Manage your crypto wallet and transactions</p>
            </div>

            {/* Balance Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-[#149A9B] to-[#0D6B6C] text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Total Balance</p>
                    <p className="text-4xl font-bold mt-2">{walletInfo.balance}</p>
                    <p className="text-lg text-white/90">{walletInfo.currency}</p>
                  </div>
                  <Wallet className="w-12 h-12 text-white/50" />
                </div>
                <p className="text-sm text-white/70 mt-3">≈ $1,250.50 USD</p>
              </CardHeader>
              <CardContent className="bg-white p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="border-[#149A9B] text-[#149A9B]">
                    {walletInfo.type === "invisible" ? "Invisible Wallet" : "External Wallet"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="bg-[#149A9B] hover:bg-[#128889] text-white">
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Receive
                  </Button>
                  <Button variant="outline" className="border-[#149A9B] text-[#149A9B] hover:bg-[#149A9B]/10">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wallet Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Public Address</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono break-all text-gray-700">
                      {walletInfo.address}
                    </code>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="border-[#149A9B] text-[#149A9B] hover:bg-[#149A9B]/10"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="border-[#149A9B] text-[#149A9B] hover:bg-[#149A9B]/10"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {walletInfo.type === "invisible" && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium text-gray-700">Private Key (Sensitive)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="text-[#149A9B] hover:text-[#128889] hover:bg-[#149A9B]/10"
                      >
                        {showPrivateKey ? (
                          <><EyeOff className="w-4 h-4 mr-2" />Hide</>
                        ) : (
                          <><Eye className="w-4 h-4 mr-2" />Show</>
                        )}
                      </Button>
                    </div>
                    {showPrivateKey && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="flex-1 p-3 bg-red-50 border border-red-300 rounded-lg text-sm font-mono break-all text-red-700">
                            S••••••••••••••••••••••••••••••••••••••••••••••••••
                          </code>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-red-600">
                            <strong>Warning:</strong> Never share your private key with anyone. Anyone with access to this key can control your funds.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Button variant="ghost" size="sm" className="text-[#149A9B] hover:text-[#128889]">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-full ${
                          tx.type === "received" ? "bg-green-100" : "bg-orange-100"
                        }`}>
                          {tx.type === "received" ? (
                            <ArrowDownLeft className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {tx.type === "received" ? tx.from : tx.to}
                          </p>
                          <p className="text-xs text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                      <p className={`font-semibold text-base ${
                        tx.type === "received" ? "text-green-600" : "text-orange-600"
                      }`}>
                        {tx.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

