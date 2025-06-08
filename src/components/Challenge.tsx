import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { supabase } from '../lib/supabase'
import Timer from './Timer'

interface LocationState {
  category: 1 | 2
  teamNumber: number
  language: 'javascript'
  startTime: number
}

// Problem description is now inline in the JSX

const STARTER_CODE = '// Write your Fizz Buzz solution here\n'

function Challenge() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState

  const [code, setCode] = useState(STARTER_CODE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [consoleOutput, setConsoleOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [lastRunTime, setLastRunTime] = useState<number>(0)

  useEffect(() => {
    if (!state) {
      navigate('/')
    }
  }, [state, navigate])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input/textarea and not in Monaco editor
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Check if focus is in Monaco editor
      const activeElement = document.activeElement
      if (activeElement?.closest('.monaco-editor')) {
        // Only handle Ctrl/Cmd combinations in editor
        if (e.ctrlKey || e.metaKey) {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleRun()
          } else if (e.key === 't') {
            e.preventDefault()
            handleTest()
          } else if (e.key === 's') {
            e.preventDefault()
            handleSubmit()
          }
        }
        return
      }

      // Global shortcuts when not in editor
      if (e.key === 'F5') {
        e.preventDefault()
        handleRun()
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'Enter') {
          e.preventDefault()
          handleRun()
        } else if (e.key === 't') {
          e.preventDefault()
          handleTest()
        } else if (e.key === 's') {
          e.preventDefault()
          handleSubmit()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, isSubmitting, lastRunTime, code, state]) // Dependencies to ensure latest state

  if (!state) return null

  const getCharacterCount = (code: string) => {
    // Count characters excluding whitespace
    return code.replace(/\s/g, '').length
  }

  const handleRun = async () => {
    const now = Date.now()
    const timeSinceLastRun = now - lastRunTime
    const cooldownPeriod = 10000 // 10 seconds

    if (timeSinceLastRun < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastRun) / 1000)
      setConsoleOutput(`⏳ Please wait ${remainingTime} seconds before running again...`)
      return
    }

    setIsRunning(true)
    setConsoleOutput('🚀 Running your code...')
    setLastRunTime(now)

    try {
      const { data, error } = await supabase.functions.invoke('execute-code', {
        body: { code }
      })

      if (error) throw error

      if (data.success) {
        setConsoleOutput(data.output || '(no output)')
      } else {
        setConsoleOutput(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setConsoleOutput('❌ Failed to run code. Please try again.')
    } finally {
      setIsRunning(false)
    }
  }

  const handleTest = async () => {
    setIsSubmitting(true)
    setTestResult(null)

    try {
      const { data, error } = await supabase.functions.invoke('execute-code', {
        body: { code }
      })

      if (error) throw error

      if (data.success) {
        setTestResult(data.isValid ? '✓ Solution is correct!' : '✗ Solution is incorrect')
      } else {
        setTestResult(`Error: ${data.error}`)
      }
    } catch (error) {
      setTestResult('Failed to test code. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // First test the code
      const { data: testData, error: testError } = await supabase.functions.invoke('execute-code', {
        body: { code }
      })

      if (testError) throw testError

      if (!testData.success) {
        alert(`Error: ${testData.error}`)
        setIsSubmitting(false)
        return
      }

      if (!testData.isValid) {
        alert('Your solution is incorrect. Please fix it before submitting.')
        setIsSubmitting(false)
        return
      }

      // Calculate solve time
      const solveTimeSeconds = Math.floor((Date.now() - state.startTime) / 1000)

      // Submit to database
      const { error: submitError } = await supabase
        .from('submissions')
        .insert({
          category: state.category,
          team_number: state.teamNumber,
          language: 'javascript',
          code,
          character_count: getCharacterCount(code),
          is_valid: true,
          solve_time_seconds: solveTimeSeconds
        })

      if (submitError) throw submitError

      alert('Solution submitted successfully!')
      navigate('/')
    } catch (error) {
      alert('Failed to submit solution. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Fizz Buzz Challenge</h1>
              <p className="text-sm text-gray-600">cat-{state.category}-team-{state.teamNumber}</p>
            </div>
            <div className="flex items-center gap-4">
              <Timer startTime={state.startTime} />
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                New Team
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Side by Side */}
        <div className="flex gap-4 h-[calc(100vh-200px)]">
          {/* Code Editor - Left Side (5/8 width) */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col" style={{ flex: '5' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Your Solution:</h2>
              <span className="text-sm font-mono text-gray-600">
                Characters: {getCharacterCount(code)}
              </span>
            </div>
            
            {/* Code Editor */}
            <div className="border rounded overflow-hidden flex-1 mb-4">
              <Editor
                height="100%"
                language="javascript"
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false
                }}
              />
            </div>

            {/* Console Output */}
            <div className="border rounded bg-gray-900 text-green-400 font-mono text-sm h-32 overflow-y-auto mb-4">
              <div className="bg-gray-800 px-3 py-1 text-gray-300 text-xs border-b border-gray-700 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="ml-2">Console</span>
              </div>
              <div className="p-3 whitespace-pre-wrap">
                {consoleOutput || '> Ready to run your code...'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
                title="Run code (Ctrl+Enter or F5)"
              >
                {isRunning ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>▶️</span>
                )}
                <span>{isRunning ? 'Running...' : 'Run'}</span>
                <span className="text-xs opacity-75 ml-1">F5</span>
              </button>
              
              <button
                onClick={handleTest}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                title="Test solution correctness (Ctrl+T)"
              >
                <span>🧪</span>
                <span>Test Solution</span>
                <span className="text-xs opacity-75 ml-1">Ctrl+T</span>
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                title="Submit final solution (Ctrl+S)"
              >
                <span>✅</span>
                <span>Submit Solution</span>
                <span className="text-xs opacity-75 ml-1">Ctrl+S</span>
              </button>
            </div>

            {testResult && (
              <div className={`mt-4 p-3 rounded ${
                testResult.includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {testResult}
              </div>
            )}
          </div>

          {/* Instructions - Right Side (3/8 width) */}
          <div className="bg-white rounded-lg shadow-md p-4" style={{ flex: '3' }}>
            <h2 className="font-semibold mb-4">Problem Description</h2>
            <div className="text-sm space-y-4">
              <div>
                <p className="font-medium mb-2">Print numbers from 1 to 100, but:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>For multiples of 3, print "Fizz"</li>
                  <li>For multiples of 5, print "Buzz"</li>
                  <li>For multiples of both 3 and 5, print "FizzBuzz"</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium mb-2">Example output:</p>
                <div className="bg-gray-50 p-3 rounded font-mono text-xs overflow-y-auto max-h-96">
                  <div>1</div>
                  <div>2</div>
                  <div>Fizz</div>
                  <div>4</div>
                  <div>Buzz</div>
                  <div>Fizz</div>
                  <div>7</div>
                  <div>8</div>
                  <div>Fizz</div>
                  <div>Buzz</div>
                  <div>11</div>
                  <div>Fizz</div>
                  <div>13</div>
                  <div>14</div>
                  <div>FizzBuzz</div>
                  <div className="text-gray-400">...</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-xs">
                  <li>Language: <strong>JavaScript</strong></li>
                  <li>Use <code className="bg-gray-100 px-1 rounded">console.log()</code> to print output</li>
                  <li>Use the modulo operator <code className="bg-gray-100 px-1 rounded">%</code> to check divisibility</li>
                  <li>Shorter code = better score!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Challenge