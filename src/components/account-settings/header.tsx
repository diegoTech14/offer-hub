import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu, X } from "lucide-react"
import Image from "next/image"
import offerHubLogo from "../../../public/dark_logo.svg"

interface HeaderProps {
    isSidebarOpen: boolean
    setIsSidebarOpen: (open: boolean) => void
}

export function Header({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
    return (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-1 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden text-gray-600 dark:text-gray-300"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </Button>
                    <Image src={offerHubLogo} alt="OfferHub Logo" width={40} height={40} className="w-10 h-10" />
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">OfferHub</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                        <Input
                            placeholder="Search"
                            className="pl-10 w-20 sm:w-64 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}