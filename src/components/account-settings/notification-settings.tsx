import { Switch } from "@/components/ui/switch"

interface NotificationSettingsProps {
    jobAlert: boolean
    setJobAlert: (alert: boolean) => void
    paymentAlert: boolean
    setPaymentAlert: (alert: boolean) => void
    messagesAlert: boolean
    setMessagesAlert: (alert: boolean) => void
    securityAlert: boolean
    setSecurityAlert: (alert: boolean) => void
}

export function NotificationSettings({
    jobAlert,
    setJobAlert,
    paymentAlert,
    setPaymentAlert,
    messagesAlert,
    setMessagesAlert,
    securityAlert,
    setSecurityAlert
}: NotificationSettingsProps) {
    function TabTitleComponent({ label }: { label: string }) {
        return <h3 className="text-[20px] text-[#002333] dark:text-white font-normal mb-4">{label}</h3>
    }

    return (
        <div>
            <TabTitleComponent label="Notification preferences" />
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#7F7E85]">
                    <span className="text-sm font-medium text-secondary-500 dark:text-gray-300">Job Alert</span>
                    <Switch
                        className={`${jobAlert ? "bg-[#12B76A]" : ""}`}
                        checked={jobAlert}
                        onCheckedChange={setJobAlert}
                    />
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-[#7F7E85] dark:border-gray-600">
                    <span className="text-sm font-medium text-secondary-500 dark:text-gray-300">Payment Alert</span>
                    <Switch
                        className={`${paymentAlert ? "bg-[#12B76A]" : ""}`}
                        checked={paymentAlert}
                        onCheckedChange={setPaymentAlert}
                    />
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-[#7F7E85] dark:border-gray-600">
                    <span className="text-sm font-medium text-secondary-500 dark:text-gray-300">Messages Alert</span>
                    <Switch
                        className={`${messagesAlert ? "bg-[#12B76A]" : ""}`}
                        checked={messagesAlert}
                        onCheckedChange={setMessagesAlert}
                    />
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-[#7F7E85] dark:border-gray-600">
                    <span className="text-sm font-medium text-secondary-500 dark:text-gray-300">Security Alert</span>
                    <Switch
                        className={`${securityAlert ? "bg-[#12B76A]" : ""}`}
                        checked={securityAlert}
                        onCheckedChange={setSecurityAlert}
                    />
                </div>
            </div>
        </div>
    )
}