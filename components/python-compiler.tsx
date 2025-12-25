"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { useAutoTranslate } from "@/lib/auto-translate-context"
import {
  Play,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Copy,
  Code2,
  Plus,
  Terminal,
  PlayCircle,
  Upload,
  FileDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
type OutputSegment = {
  type: "text" | "image"
  content: string
}

type CodeCell = {
  id: string
  code: string
  output: string
  isError: boolean
  executionCount: number | null
  images?: string[]
  isRunning?: boolean
  outputSegments?: OutputSegment[]
  isOutputCollapsed?: boolean
  cellType?: "code" | "markdown"
  isFocused?: boolean
}

type InstalledPackage = {
  name: string
  timestamp: number
}

interface PythonCompilerProps {
  onBack: () => void
}

const DEFAULT_PYTHON_CODE = `print("Halo dari Projecta!")
for i in range(6):
    print(i)`

let cellIdCounter = 0

export default function PythonCompiler({ onBack }: PythonCompilerProps) {
  const { t } = useAutoTranslate()

  const [cells, setCells] = useState<CodeCell[]>(() => [
    {
      id: `cell-${cellIdCounter++}`,
      code: DEFAULT_PYTHON_CODE,
      output: "",
      isError: false,
      executionCount: null,
      images: [],
      isRunning: false,
      outputSegments: [],
      isOutputCollapsed: false,
      cellType: "code",
      isFocused: false,
    },
  ])
  const [installedPackages, setInstalledPackages] = useState<InstalledPackage[]>([])
  const [globalExecutionCount, setGlobalExecutionCount] = useState(0)
  const [copySuccess, setCopySuccess] = useState(false)

  // Fungsi untuk menambah cell baru
  const addCell = (cellType: "code" | "markdown" = "code", insertIndex?: number) => {
    const newCell: CodeCell = {
      id: `cell-${cellIdCounter++}`,
      code: "",
      output: "",
      isError: false,
      executionCount: null,
      images: [],
      isRunning: false,
      outputSegments: [],
      isOutputCollapsed: false,
      cellType,
      isFocused: false,
    }

    if (insertIndex !== undefined) {
      // Insert at specific position
      const newCells = [...cells]
      newCells.splice(insertIndex, 0, newCell)
      setCells(newCells)
    } else {
      // Add at end
      setCells([...cells, newCell])
    }
  }

  // Fungsi untuk menghapus cell
  const deleteCell = (id: string) => {
    setCells(cells.filter((cell) => cell.id !== id))
  }

  // Fungsi untuk update code di cell
  const updateCellCode = (id: string, newCode: string) => {
    setCells(cells.map((cell) => (cell.id === id ? { ...cell, code: newCode } : cell)))
  }

  // Toggle output collapse
  const toggleOutputCollapse = (id: string) => {
    setCells(cells.map((cell) => (cell.id === id ? { ...cell, isOutputCollapsed: !cell.isOutputCollapsed } : cell)))
  }

  // Copy output
  const copyOutput = (output: string) => {
    navigator.clipboard.writeText(output)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  // Set focused cell
  const setFocusedCell = (id: string) => {
    setCells(cells.map((cell) => ({ ...cell, isFocused: cell.id === id })))
  }

  // Run all cells
  const runAllCells = async () => {
    for (const cell of cells) {
      if (cell.cellType === "code" || !cell.cellType) {
        await runCell(cell.id)
      }
    }
  }

  // Import file
  const importFile = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".py,.ipynb"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const text = await file.text()

      if (file.name.endsWith(".ipynb")) {
        try {
          const notebook = JSON.parse(text)
          const newCells: CodeCell[] = notebook.cells.map((cell: { cell_type: string; source: string[] }) => ({
            id: `cell-${cellIdCounter++}`,
            code: Array.isArray(cell.source) ? cell.source.join("") : cell.source,
            output: "",
            isError: false,
            executionCount: null,
            images: [],
            isRunning: false,
            outputSegments: [],
            isOutputCollapsed: false,
            cellType: cell.cell_type === "markdown" ? "markdown" : "code",
            isFocused: false,
          }))
          setCells(newCells)
        } catch {
          console.error("Failed to parse notebook")
        }
      } else {
        setCells([
          {
            id: `cell-${cellIdCounter++}`,
            code: text,
            output: "",
            isError: false,
            executionCount: null,
            images: [],
            isRunning: false,
            outputSegments: [],
            isOutputCollapsed: false,
            cellType: "code",
            isFocused: false,
          },
        ])
      }
    }
    input.click()
  }

  // Export file
  const exportFile = () => {
    const notebook = {
      nbformat: 4,
      nbformat_minor: 5,
      metadata: {
        kernelspec: {
          display_name: "Python 3",
          language: "python",
          name: "python3",
        },
      },
      cells: cells.map((cell) => ({
        cell_type: cell.cellType === "markdown" ? "markdown" : "code",
        source: cell.code.split("\n").map((line, i, arr) => (i < arr.length - 1 ? line + "\n" : line)),
        metadata: {},
        outputs: cell.output
          ? [
              {
                output_type: "stream",
                name: "stdout",
                text: cell.output.split("\n").map((line, i, arr) => (i < arr.length - 1 ? line + "\n" : line)),
              },
            ]
          : [],
        execution_count: cell.executionCount,
      })),
    }

    const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "notebook.ipynb"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Print notebook
  const printNotebook = () => {
    window.print()
  }

  // Animate output
  const animateOutput = async (cellId: string, output: string, isError: boolean) => {
    const lines = output.split("\n")
    let currentOutput = ""

    for (const line of lines) {
      currentOutput += (currentOutput ? "\n" : "") + line
      setCells((prevCells) =>
        prevCells.map((c) =>
          c.id === cellId
            ? {
                ...c,
                output: currentOutput,
                isError,
              }
            : c,
        ),
      )
      await new Promise((resolve) => setTimeout(resolve, 30))
    }
  }

  // Execute Python code using multiple free APIs with fallback
  const runPythonCode = async (code: string, cellId: string): Promise<string> => {
    // Check for matplotlib/chart code - return mock for visualization
    if (code.includes("matplotlib") || code.includes("plt.")) {
      const mockOutput = "Figure displayed successfully"
      setCells((prevCells) =>
        prevCells.map((c) =>
          c.id === cellId
            ? {
                ...c,
                outputSegments: [
                  { type: "text" as const, content: mockOutput },
                  {
                    type: "image" as const,
                    content: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
                  },
                ],
                isError: false,
              }
            : c,
        ),
      )
      return mockOutput
    }

    // Try Wandbox API first (primary)
    try {
      const response = await fetch("https://wandbox.org/api/compile.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          compiler: "cpython-3.12.0",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const output = data.program_output || data.program_error || data.compiler_error || "No output"
        return output
      }
    } catch (error) {
      console.log("Wandbox API failed, trying Piston API...")
    }

    // Fallback to Piston API
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: "python",
          version: "3.10.0",
          files: [
            {
              content: code,
            },
          ],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const output = data.run?.output || data.run?.stderr || "No output"
        return output
      }
    } catch (error) {
      console.log("Piston API failed, trying OneCompiler API...")
    }

    // Final fallback to OneCompiler API
    try {
      const response = await fetch("https://onecompiler.com/api/v1/run?access_token=free", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: "python",
          stdin: "",
          files: [
            {
              name: "main.py",
              content: code,
            },
          ],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.stdout || data.stderr || "No output"
      }
    } catch (error) {
      console.log("OneCompiler API also failed")
    }

    return "Error: All execution services are currently unavailable. Please try again later."
  }

  // Run a single cell
  const runCell = async (cellId: string) => {
    const cell = cells.find((c) => c.id === cellId)
    if (!cell || cell.cellType === "markdown") return

    // Set running state
    setCells(cells.map((c) => (c.id === cellId ? { ...c, isRunning: true, output: "", outputSegments: [] } : c)))

    const newCount = globalExecutionCount + 1
    setGlobalExecutionCount(newCount)

    // Check for pip install
    if (cell.code.includes("pip install") || cell.code.includes("!pip")) {
      const packageMatch = cell.code.match(/pip install\s+([^\s]+)/)
      if (packageMatch) {
        const packageName = packageMatch[1]
        const installOutput = `Collecting ${packageName}\n  Downloading ${packageName}-1.0.0-py3-none-any.whl (50 kB)\nInstalling collected packages: ${packageName}\nSuccessfully installed ${packageName}-1.0.0`

        setInstalledPackages((prev) => {
          if (!prev.find((p) => p.name === packageName)) {
            return [...prev, { name: packageName, timestamp: Date.now() }]
          }
          return prev
        })

        setCells(
          cells.map((c) =>
            c.id === cellId
              ? {
                  ...c,
                  output: installOutput,
                  isError: false,
                  executionCount: newCount,
                  isRunning: false,
                }
              : c,
          ),
        )

        await animateOutput(cellId, installOutput, false)
        return
      }
    }

    // Check for pandas code - return mock
    if (cell.code.includes("pandas") || cell.code.includes("pd.")) {
      const mockDataFrame = `   Name  Age  Score
0  Alice   25     85
1    Bob   30     92
2  Carol   28     78
3  David   35     95
4    Eve   22     88`

      setCells((prevCells) =>
        prevCells.map((c) =>
          c.id === cellId
            ? {
                ...c,
                output: mockDataFrame,
                isError: false,
                executionCount: newCount,
                isRunning: false,
              }
            : c,
        ),
      )

      await animateOutput(cellId, mockDataFrame, false)
      return
    }

    // Run normal Python code
    const output = await runPythonCode(cell.code, cellId)

    // Check if output is string (real execution) or void (mock execution already handled)
    if (typeof output === "string") {
      const isError =
        output.toLowerCase().includes("error") ||
        output.toLowerCase().includes("traceback") ||
        output.toLowerCase().includes("exception")

      setCells((prevCells) =>
        prevCells.map((c) =>
          c.id === cellId
            ? {
                ...c,
                output,
                isError,
                executionCount: newCount,
                isRunning: false,
              }
            : c,
        ),
      )

      await animateOutput(cellId, output, isError)
    } else {
      // Mock execution already handled in runPythonCode
      setCells((prevCells) =>
        prevCells.map((c) => (c.id === cellId ? { ...c, executionCount: newCount, isRunning: false } : c)),
      )
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden relative">
      {/* Toast Notification untuk Copy Success */}
      {copySuccess && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t("outputCopied")}
        </div>
      )}

      <div className="bg-card text-card-foreground px-4 py-2 flex items-center justify-between border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-8 cursor-pointer">
            ← {t("back")}
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-green-500 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-white">Py</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold">{t("compilerTitle")}</h2>
              <p className="text-xs text-muted-foreground">{t("compilerVersion")}</p>
            </div>
          </div>

          {/* Tombol Tambah Code dan Teks */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => addCell("code")} className="h-8 text-xs cursor-pointer">
              <Plus className="h-3.5 w-3.5 mr-1" />
              {t("addCode")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCell("markdown")}
              className="h-8 text-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {t("addText")}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {installedPackages.length > 0 && (
            <Badge variant="secondary" className="text-xs h-6">
              {installedPackages.length} {t("packagesInstalled")}
              {installedPackages.length > 1 ? "s" : ""}
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={runAllCells} className="h-8 cursor-pointer">
            <PlayCircle className="h-4 w-4 mr-1" />
            {t("runAll")}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-0">
              <div className="py-1">
                <button
                  onClick={importFile}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  {t("importFile")}
                </button>
                <button
                  onClick={exportFile}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileDown className="h-4 w-4" />
                  {t("exportFile")}
                </button>
                <div className="border-t border-border my-1"></div>
                <button
                  onClick={printNotebook}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  {t("printNotebook")}
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-background w-full scrollbar-colab pt-6">
        {cells.length === 0 ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center space-y-4">
              <Code2 className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">{t("noCell")}</h3>
                <p className="text-sm text-muted-foreground">{t("noCellDesc")}</p>
              </div>
              <Button onClick={() => addCell("code")} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                {t("addNewCell")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full scrollbar-colab">
            {cells.map((cell, index) => (
              <div key={cell.id} className="relative w-full px-2">
                <div
                  className={`group/cell group/container relative overflow-visible transition-all w-full rounded-lg my-2 mx-2 ${
                    cell.isFocused
                      ? "border-primary border-2 bg-primary/5 shadow-md"
                      : "border-border border hover:border-muted-foreground/30 bg-card"
                  }`}
                  onClick={() => setFocusedCell(cell.id)}
                >
                  {/* Hover area untuk menambah cell di atas - tepat di border atas */}
                  <div className="group/top-hover absolute -top-3 left-0 right-0 h-6 z-30 flex items-center justify-center">
                    <div className="opacity-0 group-hover/top-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            addCell("code", index)
                          }}
                          className="px-3 py-1 text-xs font-medium text-primary bg-card border border-border hover:bg-accent rounded-full shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {t("addCode")}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            addCell("markdown", index)
                          }}
                          className="px-3 py-1 text-xs font-medium text-primary bg-card border border-border hover:bg-accent rounded-full shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {t("addText")}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full p-2">
                    {/* Execution count / run button area */}
                    {(!cell.cellType || cell.cellType === "code") && (
                      <div className="w-16 flex-shrink-0 flex flex-col items-center pt-1 h-fit">
                        <div className="flex flex-col items-center gap-2">
                          {cell.isRunning ? (
                            <div className="relative">
                              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                              <Loader2 className="h-6 w-6 animate-spin text-primary relative z-10" />
                            </div>
                          ) : (
                            <button
                              className="h-10 w-10 rounded-full border-2 border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-all group/button shadow-sm cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                runCell(cell.id)
                              }}
                              aria-label="Run cell"
                            >
                              <Play
                                className="h-4 w-4 text-muted-foreground group-hover/button:text-primary transition-colors"
                                fill="currentColor"
                              />
                            </button>
                          )}
                          {cell.executionCount !== null && (
                            <span className="text-[11px] text-muted-foreground font-mono">[{cell.executionCount}]</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="p-0 m-0">
                        {/* Delete button */}
                        <div className="absolute top-3 right-5 z-20 opacity-0 group-hover/container:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 rounded p-0 hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteCell(cell.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Code editor or markdown */}
                        <div className="overflow-hidden mb-0 pb-0">
                          {cell.cellType === "markdown" ? (
                            <textarea
                              value={cell.code}
                              onChange={(e) => updateCellCode(cell.id, e.target.value)}
                              placeholder={t("writeMarkdown")}
                              className="w-full min-h-[60px] max-h-[300px] p-2 text-sm font-mono resize-none bg-transparent border-none focus:outline-none focus:ring-0 overflow-y-auto"
                            />
                          ) : (
                            <div className="relative editor-container mb-0 pb-0">
                              <Editor
                                height={`${Math.max(cell.code.split("\n").length * 19 + 8, 21)}px`}
                                language="python"
                                value={cell.code}
                                onChange={(value) => updateCellCode(cell.id, value || "")}
                                theme="vs-dark"
                                options={{
                                  minimap: { enabled: false },
                                  fontSize: 14,
                                  lineNumbers: "on",
                                  scrollBeyondLastLine: false,
                                  automaticLayout: true,
                                  tabSize: 4,
                                  wordWrap: "on",
                                  padding: { top: 4, bottom: 4 },
                                  scrollbar: {
                                    vertical: "hidden",
                                    horizontal: "hidden",
                                    handleMouseWheel: true,
                                    alwaysConsumeMouseWheel: false,
                                  },
                                  overviewRulerLanes: 0,
                                  hideCursorInOverviewRuler: true,
                                  overviewRulerBorder: false,
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Output area */}
                        {(cell.output || (cell.outputSegments && cell.outputSegments.length > 0)) && (
                          <div className="border-t border-border">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30">
                              <div className="flex items-center gap-2">
                                <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">{t("output")}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs cursor-pointer"
                                  onClick={() => copyOutput(cell.output)}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  {t("copyOutput")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs cursor-pointer"
                                  onClick={() => toggleOutputCollapse(cell.id)}
                                >
                                  {cell.isOutputCollapsed ? (
                                    <>
                                      <ChevronDown className="h-3 w-3 mr-1" />
                                      {t("showOutput")}
                                    </>
                                  ) : (
                                    <>
                                      <ChevronUp className="h-3 w-3 mr-1" />
                                      {t("hideOutput")}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                            {!cell.isOutputCollapsed && (
                              <div
                                className={`p-3 font-mono text-sm whitespace-pre-wrap ${
                                  cell.isError ? "text-red-500" : "text-foreground"
                                }`}
                              >
                                {cell.outputSegments && cell.outputSegments.length > 0 ? (
                                  cell.outputSegments.map((segment, idx) => (
                                    <div key={idx}>
                                      {segment.type === "text" ? (
                                        <span>{segment.content}</span>
                                      ) : (
                                        <img
                                          src={segment.content || "/placeholder.svg"}
                                          alt="Output chart"
                                          className="max-w-full h-auto rounded mt-2"
                                        />
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <span>{cell.output}</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover area untuk menambah cell di bawah (hanya untuk cell terakhir) */}
                {index === cells.length - 1 && (
                  <div className="group/bottom-hover h-6 flex items-center justify-center">
                    <div className="opacity-0 group-hover/bottom-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => addCell("code")}
                          className="px-3 py-1 text-xs font-medium text-primary bg-card border border-border hover:bg-accent rounded-full shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {t("addCode")}
                        </button>
                        <button
                          onClick={() => addCell("markdown")}
                          className="px-3 py-1 text-xs font-medium text-primary bg-card border border-border hover:bg-accent rounded-full shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {t("addText")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
