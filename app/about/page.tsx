import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | Personal Platform',
  description: 'Learn more about me and this platform',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
        About Me
      </h1>

      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Who I Am</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Welcome to my personal platform! This is a self-hosted community website
            where I share my thoughts, projects, and tools with the world.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            I'm passionate about building things, learning new technologies, and
            sharing knowledge with others. This platform serves as both my portfolio
            and a space for community interaction.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">What I Do</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Full-stack web development</li>
            <li>System architecture and DevOps</li>
            <li>Open source contributions</li>
            <li>Technical writing and documentation</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            This platform is built with modern technologies:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Frontend</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Next.js 15, TypeScript, Tailwind CSS
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Backend</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Next.js API Routes, Prisma ORM
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Database</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                PostgreSQL 16
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Authentication</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                NextAuth v5, Argon2
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Storage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                MinIO (S3-compatible)
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Deployment</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Docker Compose, Self-hosted
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Feel free to connect with me or explore the platform:
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Twitter
            </a>
            <a
              href="mailto:contact@example.com"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Email Me
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
