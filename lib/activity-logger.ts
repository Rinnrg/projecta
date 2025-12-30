import { prisma } from '@/lib/prisma'

export type ActivityAction = 
  | 'updated_profile'
  | 'changed_password'
  | 'updated_photo'
  | 'completed_quiz'
  | 'started_quiz'
  | 'submitted_task'
  | 'graded_task'
  | 'joined_course'
  | 'left_course'
  | 'created_course'
  | 'updated_course'
  | 'deleted_course'
  | 'created_assessment'
  | 'updated_assessment'
  | 'deleted_assessment'
  | 'created_project'
  | 'updated_project'
  | 'deleted_project'
  | 'uploaded_material'
  | 'updated_material'
  | 'deleted_material'
  | 'viewed_material'
  | 'created_showcase'
  | 'updated_showcase'
  | 'deleted_showcase'
  | 'logged_in'
  | 'logged_out'

interface LogActivityParams {
  userId: string
  action: ActivityAction
  description: string
  metadata?: Record<string, any>
  courseId?: string
  asesmenId?: string
  proyekId?: string
  materiId?: string
}

/**
 * Log user activity to the database
 */
export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.activity.create({
      data: {
        userId: params.userId,
        action: params.action,
        description: params.description,
        metadata: params.metadata || {},
        courseId: params.courseId,
        asesmenId: params.asesmenId,
        proyekId: params.proyekId,
        materiId: params.materiId,
      },
    })
  } catch (error) {
    console.error('Error logging activity:', error)
    // Don't throw - activity logging should not break the main flow
  }
}

/**
 * Get activity label for display
 */
export function getActivityLabel(action: string): string {
  const labels: Record<string, string> = {
    updated_profile: 'Memperbarui profil',
    changed_password: 'Mengubah kata sandi',
    updated_photo: 'Mengubah foto profil',
    completed_quiz: 'Menyelesaikan kuis',
    started_quiz: 'Memulai kuis',
    submitted_task: 'Mengumpulkan tugas',
    graded_task: 'Menilai tugas',
    joined_course: 'Bergabung dengan kursus',
    left_course: 'Keluar dari kursus',
    created_course: 'Membuat kursus',
    updated_course: 'Memperbarui kursus',
    deleted_course: 'Menghapus kursus',
    created_assessment: 'Membuat asesmen',
    updated_assessment: 'Memperbarui asesmen',
    deleted_assessment: 'Menghapus asesmen',
    created_project: 'Membuat proyek',
    updated_project: 'Memperbarui proyek',
    deleted_project: 'Menghapus proyek',
    uploaded_material: 'Mengunggah materi',
    updated_material: 'Memperbarui materi',
    deleted_material: 'Menghapus materi',
    viewed_material: 'Melihat materi',
    created_showcase: 'Membuat showcase',
    updated_showcase: 'Memperbarui showcase',
    deleted_showcase: 'Menghapus showcase',
    logged_in: 'Masuk',
    logged_out: 'Keluar',
  }
  return labels[action] || action
}

/**
 * Get activity type for categorization
 */
export function getActivityType(action: string): string {
  if (action.includes('quiz') || action.includes('assessment')) return 'quiz'
  if (action.includes('task') || action.includes('submitted') || action.includes('graded')) return 'assignment'
  if (action.includes('course') || action.includes('joined') || action.includes('left')) return 'course'
  if (action.includes('project')) return 'project'
  if (action.includes('material')) return 'material'
  if (action.includes('profile') || action.includes('photo') || action.includes('password')) return 'profile'
  if (action.includes('showcase')) return 'showcase'
  if (action.includes('logged')) return 'auth'
  return 'other'
}
