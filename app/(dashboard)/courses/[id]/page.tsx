import { notFound } from "next/navigation"
import CourseDetailClient from "./course-detail-client"
import { prisma } from "@/lib/prisma"
import type { Course, Asesmen } from "@/lib/types"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params

  try {
    // Fetch course from database
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        guru: {
          select: {
            id: true,
            nama: true,
            email: true,
            foto: true,
          },
        },
        materi: {
          orderBy: {
            tgl_unggah: 'desc',
          },
        },
        asesmen: {
          include: {
            guru: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
          orderBy: {
            nama: 'asc',
          },
        },
      },
    })

    if (!course) {
      notFound()
    }

    // Transform data to match client component expectations
    const transformedCourse: Course = {
      id: course.id,
      judul: course.judul,
      gambar: course.gambar,
      kategori: course.kategori,
      guruId: course.guru?.id || '',
      guru: course.guru ? {
        id: course.guru.id,
        nama: course.guru.nama,
        email: course.guru.email,
        role: 'GURU' as const,
        foto: course.guru.foto || undefined,
        createdAt: new Date(),
      } : undefined,
      materi: course.materi.map((m) => ({
        id: m.id,
        judul: m.judul,
        deskripsi: m.deskripsi || undefined,
        tgl_unggah: m.tgl_unggah,
        lampiran: m.lampiran || undefined,
        courseId: course.id,
      })),
      asesmen: course.asesmen.map((a) => ({
        id: a.id,
        nama: a.nama,
        deskripsi: a.deskripsi || undefined,
        jml_soal: a.jml_soal,
        durasi: a.durasi,
        guruId: a.guruId,
        courseId: course.id,
      })),
    }

    // Transform assessments
    const assessments: Asesmen[] = course.asesmen.map((a) => ({
      id: a.id,
      nama: a.nama,
      deskripsi: a.deskripsi || undefined,
      jml_soal: a.jml_soal,
      durasi: a.durasi,
      guruId: a.guruId,
      courseId: course.id,
    }))

    return <CourseDetailClient course={transformedCourse} assessments={assessments} />
  } catch (error) {
    console.error("Error fetching course:", error)
    notFound()
  }
}
