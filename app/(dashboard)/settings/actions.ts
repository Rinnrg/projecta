'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function uploadProfilePhoto(userId: string, formData: FormData) {
  try {
    const file = formData.get('photo') as File
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const photoUrl = `data:${mimeType};base64,${base64}`

    // Update user foto in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { foto: photoUrl }
    })

    revalidatePath('/settings')
    revalidatePath('/dashboard')
    
    return { success: true, url: photoUrl }
  } catch (error) {
    console.error('Error uploading photo:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo'
    return { success: false, error: errorMessage }
  }
}

export async function updateUserProfile(userId: string, data: {
  nama?: string
  email?: string
  username?: string
  bio?: string
}) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.nama && { nama: data.nama }),
        ...(data.email && { email: data.email }),
        ...(data.username && { username: data.username }),
      }
    })

    revalidatePath('/settings')
    revalidatePath('/dashboard')
    
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error updating profile:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
    return { success: false, error: errorMessage }
  }
}
