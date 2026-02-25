"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, FileText, ChevronRight, X } from "lucide-react";
import Fuse, { type FuseResult, type FuseResultMatch } from "fuse.js";
import { useRouter } from "next/navigation";
import docsIndex from "@/data/docs-index.json";

interface SearchResult {
    id: string;
    title: string;
    section: string;
    content: string;
    link: string;
}

export default function DocsSearchBar() {
    const [query, setQuery] = useState("");
    const [debounceQuery, setDebounceQuery] = useState("");
    const [results, setResults] = useState<FuseResult<SearchResult>[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fuse = useMemo(() => new Fuse(docsIndex as SearchResult[], {
        keys: ["title", "section", "content"],
        threshold: 0.3,
        includeMatches: true,
        minMatchCharLength: 2,
    }), []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounceQuery(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (debounceQuery.length > 1) {
            const searchResults = fuse.search(debounceQuery);
            setResults(searchResults.slice(0, 8));
            setIsOpen(true);
            setActiveIndex(-1);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [debounceQuery, fuse]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === "Enter") {
            if (activeIndex >= 0) {
                router.push(results[activeIndex].item.link);
                setIsOpen(false);
                setQuery("");
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    const highlightMatch = (text: string, matches: readonly FuseResultMatch[] | undefined, key: string) => {
        if (!matches) return text;
        const match = matches.find((m: FuseResultMatch) => m.key === key);
        if (!match) return text;

        const indices = match.indices;
        let lastIndex = 0;
        const parts: React.ReactNode[] = [];

        indices.forEach(([start, end]: [number, number], idx: number) => {
            parts.push(text.slice(lastIndex, start));
            parts.push(
                <span key={idx} className="bg-[rgba(20,154,155,0.15)] text-[#149A9B] rounded px-0.5">
                    {text.slice(start, end + 1)}
                </span>
            );
            lastIndex = end + 1;
        });
        parts.push(text.slice(lastIndex));

        return parts;
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search documentation..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-12 pr-12 py-4 rounded-xl shadow-raised bg-[#F1F3F7] border-none focus:ring-2 focus:ring-[#149A9B] text-gray-800 placeholder-gray-500 transition-all outline-none"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-3 w-full bg-white rounded-2xl shadow-raised border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[450px] overflow-y-auto">
                        {results.map((result, idx) => (
                            <div
                                key={result.item.id}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onClick={() => {
                                    router.push(result.item.link);
                                    setIsOpen(false);
                                    setQuery("");
                                }}
                                className={`
                  p-4 flex items-start gap-4 cursor-pointer transition-colors
                  ${activeIndex === idx ? "bg-gray-50 text-[#149A9B]" : "text-gray-600 hover:bg-gray-50"}
                `}
                            >
                                <div className={`mt-1 p-2 rounded-lg ${activeIndex === idx ? "bg-[#149A9B]/10" : "bg-gray-100"}`}>
                                    <FileText size={18} className={activeIndex === idx ? "text-[#149A9B]" : "text-gray-500"} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {highlightMatch(result.item.title, result.matches, "title")}
                                        </span>
                                        <ChevronRight size={14} className="text-gray-300" />
                                        <span className="text-sm font-medium text-gray-500">
                                            {highlightMatch(result.item.section, result.matches, "section")}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                        {highlightMatch(result.item.content, result.matches, "content")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                        <span>{results.length} results found</span>
                        <div className="flex gap-3">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded bg-white border border-gray-200">↑↓</kbd> Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded bg-white border border-gray-200">↵</kbd> Select
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {isOpen && query.length > 1 && results.length === 0 && (
                <div className="absolute top-full mt-3 w-full bg-white rounded-2xl shadow-raised p-8 text-center z-50 animate-in fade-in slide-in-from-top-2">
                    <p className="text-gray-500">No results found for &quot;<span className="font-semibold">{query}</span>&quot;</p>
                    <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                </div>
            )}
        </div>
    );
}
