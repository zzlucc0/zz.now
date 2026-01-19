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
    <div className="page-shell">
      <div className="page-header">
        <div className="flex items-center flex-wrap gap-4 mb-4">
          <h1 className="page-title">{project.title}</h1>
          <span className="status-pill status-pill-active">{project.status}</span>
        </div>
        <p className="page-subtitle">{project.description}</p>
      </div>

      <div className="prose max-w-none">
        <section className="about-section">
          <h2 className="about-section-title">Overview</h2>
          <p className="about-text whitespace-pre-line">{project.longDescription}</p>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">Key Features</h2>
          <ul className="about-list">
            {project.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">Technologies Used</h2>
          <div className="flex flex-wrap gap-3">
            {project.technologies.map((tech: string) => (
              <span key={tech} className="tag-pill">
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="about-section-title">Links</h2>
          <div className="flex flex-wrap gap-4">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="home-action-btn btn-secondary"
              >
                View on GitHub
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="home-action-btn btn-primary"
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
