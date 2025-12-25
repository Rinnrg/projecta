"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Copy, Check, FileX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Helper function to detect programming language
function detectLanguage(code: string): string {
  if (code.includes("import React") || code.includes("useState") || code.includes("useEffect")) return "TypeScript"
  if (code.includes("def ") || (code.includes("import ") && code.includes(":"))) return "Python"
  if (code.includes("public class") || code.includes("public static void")) return "Java"
  if (code.includes("func ") && code.includes("->")) return "Swift"
  if (code.includes("fn ") && code.includes("->")) return "Rust"
  return "JavaScript"
}

interface CodeViewerProps {
  sourceCode: string | null | undefined
  link: string | null | undefined
}

export function CodeViewer({ sourceCode, link }: CodeViewerProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopyCode = async () => {
    if (sourceCode) {
      await navigator.clipboard.writeText(sourceCode)
      setCopied(true)
      toast({
        title: "Berhasil disalin!",
        description: "Kode telah disalin ke clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (sourceCode) {
    return (
      <div className="overflow-hidden rounded-lg border bg-slate-950">
        {/* Editor Header - Mac-style window */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
          {/* Left: Traffic lights + filename */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <span className="ml-3 font-mono text-sm text-slate-400">main.tsx</span>
          </div>

          {/* Right: Language badge + Copy button */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {detectLanguage(sourceCode)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-100"
              onClick={handleCopyCode}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Code Content */}
        <div className="max-h-96 overflow-auto p-4">
          <pre className="font-mono text-sm leading-relaxed text-slate-100">
            <code>{sourceCode}</code>
          </pre>
        </div>
      </div>
    )
  }

  if (!link) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center">
        <FileX className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">Tidak ada kode sumber yang tersedia</p>
      </Card>
    )
  }

  return null
}
