import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AccessDenied } from "../auth/AccessDenied"

interface WalletSettingsProps {
    walletAddress: string
    setWalletAddress: (address: string) => void
    walletPlaceholder: string
    updateWallet: () => void
}

export function WalletSettings({ walletAddress, setWalletAddress, walletPlaceholder, updateWallet }: WalletSettingsProps) {
    function TabTitleComponent({ label }: { label: string }) {
        return <h3 className="text-[20px] text-[#002333] dark:text-white font-normal mb-4">{label}</h3>
    }

    return (
        <div>
            <TabTitleComponent label="Wallet & Payment Settings" />
            <div className="space-y-4">
                <div>
                    <Input
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder={walletPlaceholder}
                        className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-neutral-600 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </div>
                <Button
                    className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 text-white px-8 rounded-full"
                    onClick={updateWallet}
                >
                    Update Wallet
                </Button>
            </div>
        </div>
    )
}

