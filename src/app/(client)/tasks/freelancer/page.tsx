"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";

interface TaskRecord {
  id: string;
  projectTitle: string;
  clientName: string;
  status: "completed" | "in_progress" | "pending";
  rating?: number;
  completedAt: string;
  transactionHash?: string;
}

export default function FreelancerTaskHistoryPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  type Pagination = {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
  const [pagination, setPagination] = useState<Pagination | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();
        qs.set("role", "freelancer");
        qs.set("page", String(page));
        qs.set("limit", "10");
        if (statusFilter && statusFilter !== "all") qs.set("status", statusFilter);
        if (user?.id) qs.set("userId", user.id);

        const res = await fetch(`/api/task-records?${qs.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load task history");
        type ApiTask = {
          id: string;
          projectTitle: string;
          clientName?: string;
          status: TaskRecord["status"];
          rating?: number;
          completedAt?: string;
          transactionHash?: string;
        };
        type ApiResponse = { data: ApiTask[]; pagination?: Pagination | null };

        const json = (await res.json()) as ApiResponse;

        setTasks(
          (json.data || []).map((t) => ({
            id: t.id,
            projectTitle: t.projectTitle,
            clientName: t.clientName || "Unknown",
            status: t.status,
            rating: t.rating,
            completedAt: t.completedAt || "",
            transactionHash: t.transactionHash,
          })),
        );
        setPagination(json.pagination ?? null);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Something went wrong");
        setTasks([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [page, statusFilter, user?.id]);

  const filteredTasks = tasks;

  const formatHash = (hash: string) =>
    hash.length > 14 ? `${hash.slice(0, 10)}…${hash.slice(-4)}` : hash;

  const getStatusBadge = (status: TaskRecord["status"]) => {
    const variants = {
      completed: "bg-green-100 text-green-800 border-green-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return (
      <Badge className={variants[status]}>{status.replace("_", " ")}</Badge>
    );
  };

  const renderRating = (rating?: number) => {
    if (!rating) return <span className="text-gray-400">Not rated</span>;
    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Task History</h1>
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Completed Date</TableHead>
                <TableHead>Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Loading task history...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="space-y-3">
                      <p className="text-sm text-red-600">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p)}
                      >
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-gray-500"
                  >
                    No tasks found matching your filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      {task.projectTitle}
                    </TableCell>
                    <TableCell>{task.clientName}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{renderRating(task.rating)}</TableCell>
                    <TableCell>
                      {task.completedAt
                        ? new Date(task.completedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {task.transactionHash ? (
                        <Link
                          href={`https://explorer.stellar.org/testnet/tx/${task.transactionHash}`}
                          target="_blank"
                          className="flex items-center gap-1 text-[#149A9B] hover:underline text-sm"
                        >
                          {formatHash(task.transactionHash)}{" "}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          Showing {filteredTasks.length} tasks
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination ? !pagination.has_prev_page : page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination ? !pagination.has_next_page : false}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
