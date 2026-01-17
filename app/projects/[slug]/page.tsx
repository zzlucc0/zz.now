import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Project Details | Personal Platform',
}

// Sample project data - in a real app this would come from a database
const projects: Record<string, any> = {
  'personal-platform': {
    title: 'Personal Platform',
    description: 'A self-hosted personal website and community platform',
    longDescription: `
      This is a comprehensive personal platform built with modern technologies.
      It features user authentication, blog posts, comments, reactions, and custom emojis.
      The platform is designed to be self-hosted on your own server with Docker.
    `,
    features: [
      'User authentication with NextAuth',
      'Blog posts with markdown support',
      'Nested comments and reactions',
      'Custom emoji system',
      'Role-based access control',
      'S3-compatible storage with MinIO',
      'Comprehensive audit logging',
    ],
    technologies: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Prisma', 'Docker', 'MinIO', 'Tailwind CSS'],
    github: 'https://github.com',
    demo: null,
    status: 'Active Development',
  },
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = projects[slug]

  if (!project) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {project.title}
          </h1>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium rounded-full">
            {project.status}
          </span>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {project.description}
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
            {project.longDescription}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul className="space-y-2">
            {project.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Technologies Used</h2>
          <div className="flex flex-wrap gap-3">
            {project.technologies.map((tech: string) => (
              <span
                key={tech}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Links</h2>
          <div className="flex gap-4">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
              >
                View on GitHub
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Live Demo
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
