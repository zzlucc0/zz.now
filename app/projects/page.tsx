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
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <p className="page-subtitle">
          A collection of projects I've worked on. Each project showcases different
          technologies and approaches to solving problems.
        </p>
      </div>

      <div className="page-grid page-grid-2">
        {projects.map((project) => (
          <article
            key={project.slug}
            className="page-card"
          >
            <div className="page-card-header">
              <h2 className="page-card-title">{project.title}</h2>
              <span
                className={`status-pill ${
                  project.status === 'Active' ? 'status-pill-active' : 'status-pill-complete'
                }`}
              >
                {project.status}
              </span>
            </div>

            <p className="page-card-description">{project.description}</p>

            <div className="page-card-tags">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="page-card-tag"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="page-card-links">
              <Link
                href={`/projects/${project.slug}`}
                className="page-link"
              >
                View Details →
              </Link>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="page-link"
                >
                  GitHub →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
