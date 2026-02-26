"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, User, Mail, MessageSquare, CheckCircle2 } from "lucide-react";

export default function RegistrationForm() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="py-24 bg-transparent flex flex-col items-center justify-center text-center px-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-3xl bg-[#F1F3F7] shadow-raised flex items-center justify-center mb-8"
                >
                    <CheckCircle2 size={40} className="text-[#149A9B]" />
                </motion.div>
                <h2 className="text-3xl font-black text-[#19213D] tracking-tight mb-4">You're on the list!</h2>
                <p className="text-[#6D758F] max-w-sm font-medium">We'll reach out shortly to discuss your integration with Offer Hub.</p>
            </div>
        );
    }

    return (
        <section id="waitlist-form" className="py-32 bg-transparent relative">
            <div className="mx-auto max-w-2xl px-6">
                <div className="text-center mb-16">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#149A9B] mb-4">Join the ecosystem</p>
                    <h2 className="text-4xl font-black text-[#19213D] tracking-tighter sm:text-5xl leading-none">
                        Scale your <span className="text-[#149A9B]">Vision</span>
                    </h2>
                    <p className="mt-6 text-lg text-[#6D758F] font-medium leading-relaxed">
                        Ready to integrate? Leave your details and join the next wave of payments.
                    </p>
                </div>

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="p-10 rounded-[2.5rem] bg-[#F1F3F7] shadow-raised flex flex-col gap-8"
                >
                    {/* Name Field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#6D758F] ml-2">Full Name</label>
                        <div className="relative group">
                            <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6D758F]/40 group-focus-within:text-[#149A9B] transition-colors" />
                            <input
                                required
                                type="text"
                                placeholder="John Doe"
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-[#F1F3F7] shadow-sunken-subtle text-sm text-[#19213D] placeholder-[#6D758F]/30 focus:outline-none focus:shadow-sunken transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#6D758F] ml-2">Email Address</label>
                        <div className="relative group">
                            <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6D758F]/40 group-focus-within:text-[#149A9B] transition-colors" />
                            <input
                                required
                                type="email"
                                placeholder="john@example.com"
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-[#F1F3F7] shadow-sunken-subtle text-sm text-[#19213D] placeholder-[#6D758F]/30 focus:outline-none focus:shadow-sunken transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Purpose Field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#6D758F] ml-2">For what would you use Offer Hub?</label>
                        <div className="relative group">
                            <MessageSquare size={16} className="absolute left-5 top-6 text-[#6D758F]/40 group-focus-within:text-[#149A9B] transition-colors" />
                            <textarea
                                required
                                rows={3}
                                placeholder="Tell us about your marketplace or project..."
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-[#F1F3F7] shadow-sunken-subtle text-sm text-[#19213D] placeholder-[#6D758F]/30 focus:outline-none focus:shadow-sunken transition-all font-medium resize-none"
                            />
                        </div>
                    </div>

                    {/* Referral Field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#6D758F] ml-2">How did you hear about us?</label>
                        <div className="relative group">
                            <Send size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6D758F]/40 group-focus-within:text-[#149A9B] transition-colors" />
                            <input
                                required
                                type="text"
                                placeholder="X, Telegram, Friend, etc."
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-[#F1F3F7] shadow-sunken-subtle text-sm text-[#19213D] placeholder-[#6D758F]/30 focus:outline-none focus:shadow-sunken transition-all font-medium"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-4 w-full py-5 rounded-2xl bg-black text-white text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-black/20 hover:bg-[#149A9B] hover:shadow-[#149A9B]/30 transition-all flex items-center justify-center gap-3 group"
                    >
                        Submit Application
                        <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </motion.form>
            </div>
        </section>
    );
}
