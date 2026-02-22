import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get all students enrolled in a course
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
        enrolledAt: 'desc',
      },
    })

    // Get grades for each student
    const enrollmentsWithGrades = await Promise.all(
      enrollments.map(async (enrollment) => {
        const grades = await prisma.nilai.findMany({
          where: {
            siswaId: enrollment.siswaId,
            asesmen: {
              courseId,
            },
          },
        })

        const averageGrade = grades.length > 0
          ? grades.reduce((sum, grade) => sum + grade.skor, 0) / grades.length
          : 0

        return {
          ...enrollment,
          averageGrade: Math.round(averageGrade),
        }
      })
    )

    return NextResponse.json(enrollmentsWithGrades)
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    )
  }
}

// POST - Enroll students in a course
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    const { studentIds } = await request.json()

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "studentIds must be a non-empty array" },
        { status: 400 }
      )
    }

    // Create enrollments, ignore duplicates
    const enrollments = await Promise.all(
      studentIds.map((siswaId) =>
        prisma.enrollment.upsert({
          where: {
            courseId_siswaId: {
              courseId,
              siswaId,
            },
          },
          update: {},
          create: {
            courseId,
            siswaId,
          },
        })
      )
    )

    return NextResponse.json(
      { message: "Students enrolled successfully", count: enrollments.length },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error enrolling students:", error)
    return NextResponse.json(
      { error: "Failed to enroll students" },
      { status: 500 }
    )
  }
}

// DELETE - Remove a student from a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get("siswaId")

    if (!siswaId) {
      return NextResponse.json(
        { error: "siswaId is required" },
        { status: 400 }
      )
    }

    await prisma.enrollment.delete({
      where: {
        courseId_siswaId: {
          courseId,
          siswaId,
        },
      },
    })

    return NextResponse.json(
      { message: "Student removed successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error removing student:", error)
    return NextResponse.json(
      { error: "Failed to remove student" },
      { status: 500 }
    )
  }
}
