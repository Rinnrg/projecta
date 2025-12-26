"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockProyek, mockUsers } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Calendar, Clock, LinkIcon, Upload, CheckCircle2, Users, Star, MessageSquare } from "lucide-react"
import Link from "next/link"
import { format, differenceInDays, isPast } from "date-fns"
import { redirect, notFound } from "next/navigation"
import { SINTAKS_MAP, type SintaksKey } from "@/lib/constants/project"

const mockGroups = [
  {
    id: "g1",
    nama: "Team Alpha",
    anggota: [mockUsers[0], mockUsers[3]],
    submitted: true,
    grade: 88,
    link: "https://github.com/team-alpha/project",
    catatan: "Completed all requirements including bonus features.",
  },
  {
    id: "g2",
    nama: "Team Beta",
    anggota: [mockUsers[4]],
    submitted: true,
    grade: null,
    link: "https://github.com/team-beta/project",
    catatan: "Implemented core features.",
  },
  {
    id: "g3",
    nama: "Team Gamma",
    anggota: [],
    submitted: false,
    grade: null,
    link: null,
    catatan: null,
  },
]

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (SINTAKS_MAP[id as SintaksKey]) {
    redirect(`/projects/${id}`)
  }

  // Check if it's an old project ID (p1, p2, etc.)
  const project = mockProyek.find((p) => p.id === id)
  if (!project) {
    notFound()
  }

  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("details")
  const [link, setLink] = useState("")
  const [catatan, setCatatan] = useState("")
  const [sourceCode, setSourceCode] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [gradingGroupId, setGradingGroupId] = useState<string | null>(null)
  const [grade, setGrade] = useState("")

  const isTeacher = user?.role === "GURU"
  const daysLeft = differenceInDays(project.tgl_selesai, new Date())
  const isEnded = isPast(project.tgl_selesai)

  const handleSubmit = () => {
    setIsSubmitted(true)
  }

  const handleGrade = (groupId: string) => {
    setGradingGroupId(null)
    setGrade("")
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/projects">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </Button>

      {/* Project Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={isEnded ? "secondary" : "default"}>{isEnded ? "Ended" : "In Progress"}</Badge>
            {!isEnded && daysLeft <= 3 && <Badge variant="destructive">{daysLeft} days left</Badge>}
          </div>
          <h1 className="text-2xl font-bold">{project.judul}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(project.tgl_mulai, "MMM d")} - {format(project.tgl_selesai, "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {mockGroups.length} Groups
            </span>
          </div>
        </div>
        {isTeacher && (
          <Button asChild>
            <Link href={`/projects/${id}/edit`}>Edit Project</Link>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          {user?.role === "SISWA" && <TabsTrigger value="submit">Submission</TabsTrigger>}
          {isTeacher && <TabsTrigger value="submissions">Submissions</TabsTrigger>}
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-line">{project.deskripsi}</p>

                <h4 className="mt-6 font-semibold">Requirements:</h4>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                    <span>Implement responsive design for all screen sizes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                    <span>Use proper state management patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                    <span>Include documentation and code comments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                    <span>Deploy to a live environment</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {isEnded ? "100%" : `${100 - Math.max(0, (daysLeft / 30) * 100).toFixed(0)}%`}
                      </span>
                    </div>
                    <Progress value={isEnded ? 100 : 100 - Math.max(0, (daysLeft / 30) * 100)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <Calendar className="mx-auto h-5 w-5 text-primary" />
                      <p className="mt-1 text-xs text-muted-foreground">Start Date</p>
                      <p className="font-medium">{format(project.tgl_mulai, "MMM d")}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <Clock className="mx-auto h-5 w-5 text-primary" />
                      <p className="mt-1 text-xs text-muted-foreground">End Date</p>
                      <p className="font-medium">{format(project.tgl_selesai, "MMM d")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {user?.role === "SISWA" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>TA</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Team Alpha</p>
                        <p className="text-sm text-muted-foreground">2 members</p>
                      </div>
                    </div>
                    <div className="mt-4 flex -space-x-2">
                      {mockGroups[0].anggota.map((member) => (
                        <Avatar key={member.id} className="border-2 border-background">
                          <AvatarFallback>
                            {member.nama
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Submission Tab (Students) */}
        {user?.role === "SISWA" && (
          <TabsContent value="submit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Work</CardTitle>
                <CardDescription>Submit your project before the deadline</CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h3 className="mt-4 text-xl font-semibold">Submitted Successfully!</h3>
                    <p className="mt-2 text-muted-foreground">Your project has been submitted for review.</p>
                    <Button className="mt-6 bg-transparent" variant="outline" onClick={() => setIsSubmitted(false)}>
                      Edit Submission
                    </Button>
                  </div>
                ) : (
                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSubmit()
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="link">Project Link</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="link"
                          placeholder="https://github.com/username/project"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">GitHub, GitLab, or live demo URL</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="catatan">Notes</Label>
                      <Textarea
                        id="catatan"
                        placeholder="Add any notes or comments about your submission..."
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sourceCode">Source Code (optional)</Label>
                      <Textarea
                        id="sourceCode"
                        placeholder="Paste your main source code here..."
                        value={sourceCode}
                        onChange={(e) => setSourceCode(e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={!link}>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Project
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Submissions Tab (Teachers) */}
        {isTeacher && (
          <TabsContent value="submissions" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">All Submissions</h2>
                <Badge variant="secondary">
                  {mockGroups.filter((g) => g.submitted).length} / {mockGroups.length} submitted
                </Badge>
              </div>

              <div className="space-y-4">
                {mockGroups.map((group) => (
                  <Card key={group.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{group.nama.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{group.nama}</h3>
                              <p className="text-sm text-muted-foreground">
                                {group.anggota.length} member{group.anggota.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                            {group.submitted ? (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Submitted
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </div>

                          {group.submitted && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                <a href={group.link || "#"} className="text-primary hover:underline">
                                  {group.link}
                                </a>
                              </div>
                              {group.catatan && (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                                  <p>{group.catatan}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {group.submitted && (
                            <>
                              {group.grade !== null ? (
                                <div className="rounded-lg bg-primary/10 px-4 py-2 text-center">
                                  <Star className="mx-auto h-5 w-5 text-primary" />
                                  <p className="mt-1 text-lg font-bold text-primary">{group.grade}</p>
                                </div>
                              ) : gradingGroupId === group.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="Score"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-20"
                                  />
                                  <Button size="sm" onClick={() => handleGrade(group.id)}>
                                    Save
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setGradingGroupId(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button onClick={() => setGradingGroupId(group.id)}>Grade</Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
