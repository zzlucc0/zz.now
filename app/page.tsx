import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Personal Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            A self-hosted personal website and community platform
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
              Blog Posts
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Share your thoughts and ideas with the community
            </p>
            <Link
              href="/posts"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Posts →
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
              Community
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Engage with others through comments and reactions
            </p>
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Join Now →
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
              About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Learn more about this platform and its features
            </p>
            <Link
              href="/about"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Learn More →
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex gap-4">
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
