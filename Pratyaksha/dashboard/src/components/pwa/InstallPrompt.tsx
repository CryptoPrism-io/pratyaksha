import { X, Download, Smartphone, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePWAInstall, isIOSDevice, isSafari } from "@/hooks/usePWAInstall"
import { cn } from "@/lib/utils"

export function InstallPrompt() {
  const { isInstallable, isInstalled, showPrompt, install, dismiss } = usePWAInstall()

  // Don't show if already installed or not installable
  if (isInstalled || !showPrompt) {
    return null
  }

  const isIOS = isIOSDevice()
  const isSafariBrowser = isSafari()
  const showIOSInstructions = isIOS && isSafariBrowser

  const handleInstall = async () => {
    if (showIOSInstructions) {
      // Can't programmatically install on iOS, just dismiss
      dismiss()
      return
    }
    await install()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-white/10",
          "bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95",
          "p-6 shadow-2xl backdrop-blur-xl",
          "animate-in slide-in-from-bottom-4 fade-in duration-300"
        )}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 shadow-lg shadow-indigo-500/25">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-white">
            Add Pratyaksha to Home Screen
          </h2>
          <p className="mb-6 text-sm text-slate-300">
            Install the app for quick access, offline support, and a better experience.
          </p>

          {showIOSInstructions ? (
            // iOS Safari instructions
            <div className="mb-6 rounded-xl bg-slate-800/50 p-4 text-left">
              <p className="mb-3 text-sm font-medium text-slate-200">
                To install on iOS:
              </p>
              <ol className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-medium text-indigo-400">
                    1
                  </span>
                  <span>
                    Tap the <Share className="inline h-4 w-4 text-indigo-400" /> Share button in Safari
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-medium text-indigo-400">
                    2
                  </span>
                  <span>Scroll down and tap "Add to Home Screen"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-medium text-indigo-400">
                    3
                  </span>
                  <span>Tap "Add" to confirm</span>
                </li>
              </ol>
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {!showIOSInstructions && isInstallable && (
              <Button
                onClick={handleInstall}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3"
              >
                <Download className="mr-2 h-4 w-4" />
                Install App
              </Button>
            )}
            <Button
              onClick={dismiss}
              variant="ghost"
              className="w-full text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              {showIOSInstructions ? "Got it" : "Maybe later"}
            </Button>
          </div>

          {/* Benefits */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-slate-800/30 p-2">
              <div className="text-lg font-bold text-indigo-400">Fast</div>
              <div className="text-xs text-slate-400">Instant launch</div>
            </div>
            <div className="rounded-lg bg-slate-800/30 p-2">
              <div className="text-lg font-bold text-purple-400">Offline</div>
              <div className="text-xs text-slate-400">Works anywhere</div>
            </div>
            <div className="rounded-lg bg-slate-800/30 p-2">
              <div className="text-lg font-bold text-pink-400">Native</div>
              <div className="text-xs text-slate-400">Full screen</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
