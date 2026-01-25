"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { skillCategories } from "@/data/skills-categories";
import { useProjects } from "@/hooks/use-projects";

const formSchema = z.object({
    title: z.string().min(5, {
        message: "Title must be at least 5 characters.",
    }).max(200, {
        message: "Title must not exceed 200 characters.",
    }),
    description: z.string().min(20, {
        message: "Description must be at least 20 characters.",
    }),
    category: z.string({
        required_error: "Please select a category.",
    }),
    budget_amount: z.coerce.number().positive({
        message: "Budget must be a positive number.",
    }),
    currency: z.string().default("XLM"),
    deadline: z.date({
        required_error: "A deadline is required.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateProjectForm() {
    const router = useRouter();
    const { createProject, loading } = useProjects({ autoFetch: false });
    const [txHash, setTxHash] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            category: "",
            budget_amount: 0,
            currency: "XLM",
        },
    });


    async function onSubmit(values: FormValues) {
        try {
            console.log('🚀 Starting project creation with values:', values);

            const projectData = {
                title: values.title,
                description: values.description,
                category: values.category,
                budget: values.budget_amount,
                currency: values.currency,
                budgetType: 'fixed' as const,
                projectType: 'on-time' as const,
                experienceLevel: 'entry' as const,
                visibility: 'public' as const,
                deadline: values.deadline.toISOString(),
            };

            console.log('📦 Project data prepared:', projectData);
            console.log('🔑 Token exists:', !!localStorage.getItem('token'));

            const result = await createProject(projectData);

            console.log('✅ Project created successfully:', result);

            toast.success("Project created successfully!");

            if (result.onChainTxHash) {
                setTxHash(result.onChainTxHash);
            }

            // Optimization: redirect after a small delay if txHash is shown
            setTimeout(() => {
                router.push("/projects/mine");
            }, 3000);

        } catch (error: any) {
            console.error("❌ Error creating project:", error);
            console.error("Error details:", {
                message: error.message,
                stack: error.stack,
                response: error.response
            });
            toast.error(error.message || "Failed to create project. Please try again.");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Project Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Build a decentralized marketplace" {...field} />
                            </FormControl>
                            <FormDescription>
                                A concise and descriptive title for your project.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe your project requirements, goals, and deliverables in detail..."
                                    className="min-h-[150px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {skillCategories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="deadline"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Deadline</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="budget_amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Budget Amount</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="XLM">XLM (Stellar)</SelectItem>
                                        <SelectItem value="USDC">USDC (Stellar)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {txHash && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium mb-1">On-chain Transaction Hash:</p>
                        <p className="text-xs text-green-700 break-all font-mono">{txHash}</p>
                    </div>
                )}

                <Button type="submit" className="w-full bg-[#149A9B] hover:bg-[#118283]" disabled={loading.creating}>
                    {loading.creating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Project...
                        </>
                    ) : (
                        "Create Project"
                    )}
                </Button>
            </form>
        </Form>
    );
}
