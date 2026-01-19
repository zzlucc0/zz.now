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
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">Tools</h1>
        <p className="page-subtitle">
          A collection of useful tools and utilities. Each tool is a self-contained
          module that can be added independently.
        </p>
      </div>

      <div className="page-grid page-grid-3">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="page-card"
          >
            <div className="tool-card-icon">{tool.icon}</div>
            <h2 className="page-card-title">{tool.name}</h2>
            <p className="page-card-description">{tool.description}</p>
            <span className="page-card-tag">{tool.category}</span>
          </Link>
        ))}
      </div>

      <div className="page-callout">
        <h2 className="page-callout-title">Extensible Architecture</h2>
        <p className="page-callout-text">
          This tools system is designed to be easily extensible. Each tool is a
          standalone page under <code className="px-2 py-1 bg-card border border-border rounded">/tools/[toolSlug]</code>.
          Add new tools by creating a new page and updating the list above.
        </p>
      </div>
    </div>
  )
}
