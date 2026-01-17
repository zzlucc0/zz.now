import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Projects | Personal Platform',
  description: 'Explore my projects and work',
}

// Sample projects data - in a real app this would come from a database
const projects = [
  {
    slug: 'personal-platform',
    title: 'Personal Platform',
    description: 'A self-hosted personal website and community platform built with Next.js, TypeScript, and PostgreSQL.',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    status: 'Active',
    link: 'https://github.com',
  },
  {
    slug: 'example-project',
    title: 'Example Project',
    description: 'A sample project to demonstrate the projects feature. Replace with your own projects.',
    tags: ['React', 'Node.js'],
    status: 'Completed',
    link: 'https://github.com',
  },
]

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Projects
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          A collection of projects I've worked on. Each project showcases different
          technologies and approaches to solving problems.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <div
            key={project.slug}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {project.title}
              </h2>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  project.status === 'Active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                }`}
              >
                {project.status}
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-4">
              <Link
                href={`/projects/${project.slug}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Details →
              </Link>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:underline"
                >
                  GitHub →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
