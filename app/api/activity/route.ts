import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActivityType } from '@/lib/activity-logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId dan role diperlukan' },
        { status: 400 }
      )
    }

    // Fetch activities from the Activity model
    const activities = await prisma.activity.findMany({
      where: { userId },
      select: {
        id: true,
        action: true,
        description: true,
        metadata: true,
        createdAt: true,
        courseId: true,
        asesmenId: true,
        proyekId: true,
        materiId: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Transform to frontend format
    const transformedActivities = activities.map(activity => ({
      action: activity.action,
      item: activity.description,
      course: (activity.metadata as any)?.courseName,
      time: activity.createdAt.toISOString(),
      type: getActivityType(activity.action),
      score: (activity.metadata as any)?.score,
      group: (activity.metadata as any)?.group,
      progress: (activity.metadata as any)?.progress,
    }))

    return NextResponse.json({ activities: transformedActivities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil aktivitas' },
      { status: 500 }
    )
  }
}
