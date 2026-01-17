import Link from 'next/link'
import { auth } from '@/lib/auth/config'

export default async function HomePage() {
  const session = await auth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to My Personal Platform
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            A self-hosted space for thoughts, projects, and community
          </p>
          <div className="flex gap-4 justify-center">
            {session ? (
              <>
                <Link
                  href="/posts"
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Explore Posts
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/posts"
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Explore Posts
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">Blog & Posts</h3>
              <p className="text-gray-600">
                Write and share your thoughts with markdown support, custom emojis,
                and media attachments
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">Comments & Reactions</h3>
              <p className="text-gray-600">
                Engage with threaded comments, reactions, and a vibrant community
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">🛠️</div>
              <h3 className="text-xl font-bold mb-2">Custom Tools</h3>
              <p className="text-gray-600">
                Access unique tools and utilities built specifically for this
                platform
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">😀</div>
              <h3 className="text-xl font-bold mb-2">Custom Emojis</h3>
              <p className="text-gray-600">
                Create and use your own custom emojis throughout the platform
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Privacy Controls</h3>
              <p className="text-gray-600">
                Control visibility with public, unlisted, and private post options
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-bold mb-2">Self-Hosted</h3>
              <p className="text-gray-600">
                Fully self-hosted solution with Docker for complete data ownership
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Explore the Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/about"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold mb-2">About</h3>
              <p className="text-gray-600">
                Learn more about me, my background, and the tech stack
              </p>
            </Link>

            <Link
              href="/projects"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold mb-2">Projects</h3>
              <p className="text-gray-600">
                Explore my portfolio and see what I've been building
              </p>
            </Link>

            <Link
              href="/tools"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold mb-2">Tools</h3>
              <p className="text-gray-600">
                Access useful tools and utilities for various tasks
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!session && (
        <section className="bg-blue-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Create an account and become part of the community
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Sign Up Now
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
