import { Loader2, X } from "lucide-react"

interface LoadingProps {
  onClose?: () => void;
}

export default function Loading({ onClose }: LoadingProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 text-center shadow-lg relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        )}
        <Loader2 className="h-8 w-8 animate-spin text-[#15949C] mx-auto mb-3" />
        <h3 className="text-base font-medium text-[#002333] dark:text-white">Setting up your project...</h3>
        <p className="text-sm text-[#002333]/70 dark:text-gray-400">Please wait while we prepare the project form</p>
      </div>
    </div>
  )
}
