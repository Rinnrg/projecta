import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    sintaks: string
  }>
}

export default async function SintaksPage({ params }: PageProps) {
  const { sintaks } = await params
  
  // Redirect to main projects page or show 404
  // This is a placeholder for syntax/project type pages
  notFound()
}
