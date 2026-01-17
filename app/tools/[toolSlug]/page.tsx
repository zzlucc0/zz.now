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
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <Link
          href="/tools"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← Back to Tools
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {tool.name}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {tool.description}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
        {slug === 'example-tool' && <ExampleTool />}
        {slug === 'calculator' && <Calculator />}
      </div>

      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">How to Add New Tools</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>Add tool metadata to <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/app/tools/page.tsx</code></li>
          <li>Add tool configuration to <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/app/tools/[toolSlug]/page.tsx</code></li>
          <li>Create your tool component below</li>
          <li>Optionally add API routes under <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/app/api/tools/[toolSlug]/</code></li>
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
      <p className="text-gray-600 dark:text-gray-300">
        This is a template for building tools. Replace this with your own tool logic.
      </p>
      <div>
        <label className="block text-sm font-medium mb-2">Input</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Enter something..."
        />
      </div>
      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-300">Output: {input}</p>
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
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-right text-2xl font-mono">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {['7', '8', '9', '/'].map((btn) => (
          <button
            key={btn}
            onClick={() => (btn === '/' ? handleOperation(btn) : handleNumber(btn))}
            className="p-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold"
          >
            {btn}
          </button>
        ))}
        {['4', '5', '6', '*'].map((btn) => (
          <button
            key={btn}
            onClick={() => (btn === '*' ? handleOperation(btn) : handleNumber(btn))}
            className="p-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold"
          >
            {btn}
          </button>
        ))}
        {['1', '2', '3', '-'].map((btn) => (
          <button
            key={btn}
            onClick={() => (btn === '-' ? handleOperation(btn) : handleNumber(btn))}
            className="p-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold"
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
            className="p-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold"
          >
            {btn}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="col-span-4 p-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
