'use client'

import { useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import Link from 'next/link'

// Tool templates - add logic for each tool here
const tools: Record<string, any> = {
  'example-tool': {
    name: 'Example Tool',
    description: 'A sample tool to demonstrate the extensible architecture',
  },
  'calculator': {
    name: 'Calculator',
    description: 'Simple calculator',
  },
}

export default function ToolPage() {
  const params = useParams()
  const slug = params?.toolSlug as string
  const tool = tools[slug]

  if (!tool) {
    notFound()
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <Link href="/tools" className="page-link mb-4 inline-block">
          ← Back to Tools
        </Link>
        <h1 className="page-title">{tool.name}</h1>
        <p className="page-subtitle">{tool.description}</p>
      </div>

      <div className="page-card page-card-lg">
        {slug === 'example-tool' && <ExampleTool />}
        {slug === 'calculator' && <Calculator />}
      </div>

      <div className="page-callout">
        <h2 className="page-callout-title">How to Add New Tools</h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>
            Add tool metadata to{' '}
            <code className="bg-card border border-border px-2 py-1 rounded">
              /app/tools/page.tsx
            </code>
          </li>
          <li>
            Add tool configuration to{' '}
            <code className="bg-card border border-border px-2 py-1 rounded">
              /app/tools/[toolSlug]/page.tsx
            </code>
          </li>
          <li>Create your tool component below</li>
          <li>
            Optionally add API routes under{' '}
            <code className="bg-card border border-border px-2 py-1 rounded">
              /app/api/tools/[toolSlug]/
            </code>
          </li>
        </ol>
      </div>
    </div>
  )
}

// Example tool components
function ExampleTool() {
  const [input, setInput] = useState('')

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Example Tool Interface</h2>
      <p className="text-muted-foreground">
        This is a template for building tools. Replace this with your own tool logic.
      </p>
      <div>
        <label className="block text-sm font-medium mb-2">Input</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Enter something..."
        />
      </div>
      <div className="p-4 bg-secondary border border-border rounded-lg">
        <p className="text-sm text-muted-foreground">Output: {input}</p>
      </div>
    </div>
  )
}

function Calculator() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)

  const handleNumber = (num: string) => {
    setDisplay(display === '0' ? num : display + num)
  }

  const handleOperation = (op: string) => {
    setPreviousValue(parseFloat(display))
    setOperation(op)
    setDisplay('0')
  }

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const current = parseFloat(display)
      let result = 0

      switch (operation) {
        case '+':
          result = previousValue + current
          break
        case '-':
          result = previousValue - current
          break
        case '*':
          result = previousValue * current
          break
        case '/':
          result = previousValue / current
          break
      }

      setDisplay(result.toString())
      setPreviousValue(null)
      setOperation(null)
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="mb-4 p-4 bg-secondary border border-border rounded-lg text-right text-2xl font-mono">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {['7', '8', '9', '/'].map((btn) => (
          <button
            key={btn}
            onClick={() => (btn === '/' ? handleOperation(btn) : handleNumber(btn))}
            className="p-4 bg-secondary border border-border hover:bg-secondary/80 rounded-lg font-semibold transition-colors"
          >
            {btn}
          </button>
        ))}
        {['4', '5', '6', '*'].map((btn) => (
          <button
            key={btn}
            onClick={() => (btn === '*' ? handleOperation(btn) : handleNumber(btn))}
            className="p-4 bg-secondary border border-border hover:bg-secondary/80 rounded-lg font-semibold transition-colors"
          >
            {btn}
          </button>
        ))}
        {['1', '2', '3', '-'].map((btn) => (
          <button
            key={btn}
            onClick={() => (btn === '-' ? handleOperation(btn) : handleNumber(btn))}
            className="p-4 bg-secondary border border-border hover:bg-secondary/80 rounded-lg font-semibold transition-colors"
          >
            {btn}
          </button>
        ))}
        {['0', '.', '=', '+'].map((btn) => (
          <button
            key={btn}
            onClick={() => {
              if (btn === '=') handleEquals()
              else if (btn === '+') handleOperation(btn)
              else handleNumber(btn)
            }}
            className="p-4 bg-secondary border border-border hover:bg-secondary/80 rounded-lg font-semibold transition-colors"
          >
            {btn}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="col-span-4 p-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg font-semibold transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
