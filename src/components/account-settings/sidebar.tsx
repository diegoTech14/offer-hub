import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LayoutDashboard, Briefcase, DollarSign, HelpCircle, MessageSquare, Bell, Settings, LogOut } from "lucide-react"
import userImage from "../../../public/avatar_olivia.jpg"

interface SidebarProps {
    isSidebarOpen: boolean
    setIsSidebarOpen: (open: boolean) => void
    isUserActive: boolean
    setIsUserActive: (active: boolean) => void
}

export function Sidebar({ isSidebarOpen, isUserActive, setIsUserActive }: SidebarProps) {
    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:static lg:transform-none ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 lg:min-h-screen`}
        >
            <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={userImage.src} />
                            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">OR</AvatarFallback>
                        </Avatar>
                        <div
                            className={`w-3 h-3 absolute z-10 bottom-0 right-1 ${
                                isUserActive ? "bg-green-500" : "bg-slate-400"
                            } rounded-full`}
                        ></div>
                    </div>
                    <div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">Olivia Rhye</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">0x030rZ...0YeH</div>
                    </div>
                </div>
                <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Online for messages</span>
                    <Switch className="bg-green-600" checked={isUserActive} onCheckedChange={setIsUserActive} />
                </div>
                <nav className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <LayoutDashboard className="w-4 h-4 mr-3" />
                        Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <Briefcase className="w-4 h-4 mr-3" />
                        Discover Jobs
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <DollarSign className="w-4 h-4 mr-3" />
                        Manage Finance
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <HelpCircle className="w-4 h-4 mr-3" />
                        Help
                    </Button>
                </nav>
                <Separator className="my-6" />
                <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <MessageSquare className="w-4 h-4 mr-3" />
                        Messages
                        <div className="w-2 h-2 bg-red-500 rounded-full ml-auto"></div>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <Bell className="w-4 h-4 mr-3" />
                        Notifications
                        <div className="w-2 h-2 bg-red-500 rounded-full ml-auto"></div>
                    </Button>
                </div>
                <Separator className="my-6" />
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Theme</span>
                        <ThemeToggle />
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-800">
                        <Settings className="w-4 h-4 mr-3" />
                        Account Settings
                    </Button>
                </div>
                <div className="mt-8">
                    <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        Log out
                    </Button>
                </div>
            </div>
        </div>
    )
}

