import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tools | Personal Platform',
  description: 'Useful tools and utilities',
}

// Tools configuration - add new tools here
const tools = [
  {
    slug: 'example-tool',
    name: 'Example Tool',
    description: 'A sample tool to demonstrate the extensible tools architecture.',
    icon: '🛠️',
    category: 'Utility',
  },
  {
    slug: 'calculator',
    name: 'Calculator',
    description: 'Simple calculator for quick calculations.',
    icon: '🧮',
    category: 'Math',
  },
  // Add more tools here as you build them
]

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Tools
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          A collection of useful tools and utilities. Each tool is a self-contained
          module that can be added independently.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition"
          >
            <div className="text-4xl mb-4">{tool.icon}</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {tool.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {tool.description}
            </p>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {tool.category}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Extensible Architecture
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          This tools system is designed to be easily extensible. Each tool is a
          standalone page under <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">/tools/[toolSlug]</code>.
          Add new tools by creating a new page and updating the tools list above.
        </p>
      </div>
    </div>
  )
}
