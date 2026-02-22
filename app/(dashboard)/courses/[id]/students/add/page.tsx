import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AddStudentsClient from "./add-students-client"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AddStudentsPage({ params }: PageProps) {
  const {id: courseId} = await params
  const course = await prisma.course.findUnique({where: {id: courseId}, select: {id: true, judul: true}})
  if (!course) notFound()
  
  // Get all students with their class information
  const allStudents = await prisma.user.findMany({
    where: {role: "SISWA", kelas: { not: null }}, 
    select: {id: true, kelas: true}, 
    orderBy: {nama: 'asc'}
  })
  
  const enrolledStudents = await prisma.enrollment.findMany({where: {courseId}, select: {siswaId: true}})
  const enrolledIds = new Set(enrolledStudents.map((e) => e.siswaId))
  
  // Group students by class
  const classMap: Record<string, { total: number; enrolled: number; available: number; studentIds: string[] }> = {}
  
  for (const student of allStudents) {
    const kelas = student.kelas!
    if (!classMap[kelas]) {
      classMap[kelas] = { total: 0, enrolled: 0, available: 0, studentIds: [] }
    }
    classMap[kelas].total++
    if (enrolledIds.has(student.id)) {
      classMap[kelas].enrolled++
    } else {
      classMap[kelas].available++
      classMap[kelas].studentIds.push(student.id)
    }
  }
  
  const classData = Object.entries(classMap)
    .map(([kelas, data]) => ({ kelas, ...data }))
    .sort((a, b) => a.kelas.localeCompare(b.kelas))
  
  const totalAvailable = classData.reduce((sum, c) => sum + c.available, 0)
  
  return <AddStudentsClient course={course} classData={classData} totalAvailable={totalAvailable} />
}