import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AddStudentsClient from "./add-students-client"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AddStudentsPage({ params }: PageProps) {
  const {id: courseId} = await params
  const course = await prisma.course.findUnique({where: {id: courseId}, select: {id: true, judul: true}})
  if (!course) notFound()
  const allStudents = await prisma.user.findMany({where: {role: "SISWA"}, select: {id: true, nama: true, email: true, foto: true}, orderBy: {nama: 'asc'}})
  const enrolledStudents = await prisma.enrollment.findMany({where: {courseId}, select: {siswaId: true}})
  const enrolledIds = enrolledStudents.map((e) => e.siswaId)
  return <AddStudentsClient course={course} allStudents={allStudents} enrolledIds={enrolledIds} />
}