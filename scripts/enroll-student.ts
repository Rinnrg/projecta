/**
 * Script untuk enroll student ke course
 * Usage: tsx scripts/enroll-student.ts <studentEmail> <courseId>
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function enrollStudent(studentEmail: string, courseId: string) {
  try {
    console.log(`\n🔍 Mencari siswa dengan email: ${studentEmail}`)
    
    // Find student
    const student = await prisma.user.findUnique({
      where: { email: studentEmail },
      select: { id: true, nama: true, email: true, role: true }
    })
    
    if (!student) {
      console.error(`❌ Siswa dengan email ${studentEmail} tidak ditemukan`)
      return
    }
    
    if (student.role !== 'SISWA') {
      console.error(`❌ User ${student.email} bukan siswa (role: ${student.role})`)
      return
    }
    
    console.log(`✓ Siswa ditemukan: ${student.nama} (${student.email})`)
    
    // Find course
    console.log(`\n🔍 Mencari course dengan ID: ${courseId}`)
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, judul: true, kategori: true }
    })
    
    if (!course) {
      console.error(`❌ Course dengan ID ${courseId} tidak ditemukan`)
      return
    }
    
    console.log(`✓ Course ditemukan: ${course.judul} (${course.kategori})`)
    
    // Check if already enrolled
    console.log(`\n🔍 Mengecek enrollment...`)
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_siswaId: {
          courseId: courseId,
          siswaId: student.id
        }
      }
    })
    
    if (existingEnrollment) {
      console.log(`⚠️  Siswa ${student.nama} sudah terdaftar di course ${course.judul}`)
      console.log(`   Enrolled at: ${existingEnrollment.enrolledAt}`)
      return
    }
    
    // Create enrollment
    console.log(`\n📝 Mendaftarkan siswa ke course...`)
    const enrollment = await prisma.enrollment.create({
      data: {
        siswaId: student.id,
        courseId: courseId,
        progress: 0
      }
    })
    
    console.log(`\n✅ BERHASIL!`)
    console.log(`   Siswa: ${student.nama} (${student.email})`)
    console.log(`   Course: ${course.judul}`)
    console.log(`   Enrolled at: ${enrollment.enrolledAt}`)
    console.log(`   Enrollment ID: ${enrollment.id}`)
    
  } catch (error) {
    console.error(`\n❌ Error:`, error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get arguments from command line
const args = process.argv.slice(2)

if (args.length < 2) {
  console.log(`
📚 Script Enrollment Siswa ke Course

Usage:
  tsx scripts/enroll-student.ts <studentEmail> <courseId>

Example:
  tsx scripts/enroll-student.ts rino@test.com clzx1234abc

Atau untuk enroll semua siswa ke semua course:
  tsx scripts/enroll-student.ts --all
  `)
  process.exit(1)
}

if (args[0] === '--all') {
  // Enroll all students to all courses
  async function enrollAll() {
    try {
      const students = await prisma.user.findMany({
        where: { role: 'SISWA' },
        select: { id: true, nama: true, email: true }
      })
      
      const courses = await prisma.course.findMany({
        select: { id: true, judul: true }
      })
      
      console.log(`\n📚 Enrolling ${students.length} students to ${courses.length} courses...`)
      
      for (const student of students) {
        for (const course of courses) {
          const existing = await prisma.enrollment.findUnique({
            where: {
              courseId_siswaId: {
                courseId: course.id,
                siswaId: student.id
              }
            }
          })
          
          if (!existing) {
            await prisma.enrollment.create({
              data: {
                siswaId: student.id,
                courseId: course.id,
                progress: 0
              }
            })
            console.log(`✓ ${student.nama} → ${course.judul}`)
          }
        }
      }
      
      console.log(`\n✅ Done!`)
    } catch (error) {
      console.error(`❌ Error:`, error)
    } finally {
      await prisma.$disconnect()
    }
  }
  
  enrollAll()
} else {
  const [studentEmail, courseId] = args
  enrollStudent(studentEmail, courseId)
}
