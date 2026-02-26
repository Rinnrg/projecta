import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get all students enrolled in a course (simplified for selectors)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            email: true,
            foto: true,
            kelas: true,
          },
        },
      },
      orderBy: {
        siswa: { nama: 'asc' },
      },
    })

    const students = enrollments.map((e) => e.siswa)

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}
