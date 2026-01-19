import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | Personal Platform',
  description: 'Learn more about me and this platform',
}

export default function AboutPage() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">About Me</h1>
      </div>

      <section className="about-section">
        <h2 className="about-section-title">Who I Am</h2>
        <p className="about-text">
          Welcome to my personal platform! This is a self-hosted community website
          where I share my thoughts, projects, and tools with the world.
        </p>
        <p className="about-text">
          I'm passionate about building things, learning new technologies, and
          sharing knowledge with others. This platform serves as both my portfolio
          and a space for community interaction.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">What I Do</h2>
        <ul className="about-list list-disc list-inside">
          <li>Full-stack web development</li>
          <li>System architecture and DevOps</li>
          <li>Open source contributions</li>
          <li>Technical writing and documentation</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">Tech Stack</h2>
        <p className="about-text">This platform is built with modern technologies:</p>
        <div className="about-grid">
          <div className="page-card">
            <h3 className="page-card-title">Frontend</h3>
            <p className="about-text">Next.js 15, TypeScript, Tailwind CSS</p>
          </div>
          <div className="page-card">
            <h3 className="page-card-title">Backend</h3>
            <p className="about-text">Next.js API Routes, Prisma ORM</p>
          </div>
          <div className="page-card">
            <h3 className="page-card-title">Database</h3>
            <p className="about-text">PostgreSQL 16</p>
          </div>
          <div className="page-card">
            <h3 className="page-card-title">Authentication</h3>
            <p className="about-text">NextAuth v5, Argon2</p>
          </div>
          <div className="page-card">
            <h3 className="page-card-title">Storage</h3>
            <p className="about-text">MinIO (S3-compatible)</p>
          </div>
          <div className="page-card">
            <h3 className="page-card-title">Deployment</h3>
            <p className="about-text">Docker Compose, Self-hosted</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">Get in Touch</h2>
        <p className="about-text">Feel free to connect with me or explore the platform:</p>
        <div className="about-links">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="about-link"
          >
            GitHub
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="about-link"
          >
            Twitter
          </a>
          <a href="mailto:contact@example.com" className="about-link">
            Email Me
          </a>
        </div>
      </section>
    </div>
  )
}
