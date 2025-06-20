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

const STARTER_CODE = '// Write your prime numbers solution here\n'

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
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0)

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

      // Use safe keyboard shortcuts that don't conflict with browser
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      } else if (e.altKey && e.key === 't') {
        e.preventDefault()
        handleTest()
      } else if (e.altKey && e.key === 's') {
        e.preventDefault()
        handleSubmit()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, isSubmitting, lastRunTime, code, state]) // Dependencies to ensure latest state

  // Cooldown timer effect
  useEffect(() => {
    if (lastRunTime === 0) return

    const updateCooldown = () => {
      const now = Date.now()
      const timeSinceLastRun = now - lastRunTime
      const cooldownPeriod = 10000 // 10 seconds
      const remaining = Math.max(0, cooldownPeriod - timeSinceLastRun)
      
      setCooldownRemaining(Math.ceil(remaining / 1000))
      
      if (remaining > 0) {
        setTimeout(updateCooldown, 100) // Update every 100ms for smooth countdown
      }
    }

    updateCooldown()
  }, [lastRunTime])

  if (!state) return null

  const getCharacterCount = (code: string) => {
    // Count characters excluding whitespace
    return code.replace(/\s/g, '').length
  }

  const handleRunWithCode = async (codeToRun: string) => {
    // Check if still in cooldown
    if (cooldownRemaining > 0) {
      return
    }

    const now = Date.now()
    setIsRunning(true)
    setConsoleOutput('🚀 Running your code...')
    setLastRunTime(now)

    try {
      const { data, error } = await supabase.functions.invoke('execute-code', {
        body: { code: codeToRun }
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

  const handleRun = async () => {
    handleRunWithCode(code)
  }

  const handleTestWithCode = async (codeToTest: string) => {
    setIsSubmitting(true)
    setTestResult(null)

    try {
      const { data, error } = await supabase.functions.invoke('execute-code', {
        body: { code: codeToTest }
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

  const handleTest = async () => {
    handleTestWithCode(code)
  }

  const handleSubmitWithCode = async (codeToSubmit: string) => {
    setIsSubmitting(true)

    try {
      // First test the code
      const { data: testData, error: testError } = await supabase.functions.invoke('execute-code', {
        body: { code: codeToSubmit }
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
          code: codeToSubmit,
          character_count: getCharacterCount(codeToSubmit),
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

  const handleSubmit = async () => {
    handleSubmitWithCode(code)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Prime Numbers Challenge</h1>
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
                onMount={(editor, monaco) => {
                  // Add keyboard shortcuts directly to Monaco editor
                  editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                    // Get current code value directly from editor to avoid stale closure
                    const currentCode = editor.getValue()
                    handleRunWithCode(currentCode)
                  })
                  
                  editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyT, () => {
                    const currentCode = editor.getValue()
                    handleTestWithCode(currentCode)
                  })
                  
                  editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyS, () => {
                    const currentCode = editor.getValue()
                    handleSubmitWithCode(currentCode)
                  })
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
                disabled={isRunning || cooldownRemaining > 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
                title="Run code (Shift+Enter)"
              >
                {isRunning ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : cooldownRemaining > 0 ? (
                  <span>⏳</span>
                ) : (
                  <span>▶️</span>
                )}
                <span>
                  {isRunning 
                    ? 'Running...' 
                    : cooldownRemaining > 0 
                      ? `Wait ${cooldownRemaining}s` 
                      : 'Run'
                  }
                </span>
                <span className="text-xs opacity-75 ml-1">Shift+Enter</span>
              </button>
              
              <button
                onClick={handleTest}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                title="Test solution correctness (Alt+T)"
              >
                <span>🧪</span>
                <span>Test Solution</span>
                <span className="text-xs opacity-75 ml-1">Alt+T</span>
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                title="Submit final solution (Alt+S)"
              >
                <span>✅</span>
                <span>Submit Solution</span>
                <span className="text-xs opacity-75 ml-1">Alt+S</span>
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
                <p className="font-medium mb-2">Find and print all prime numbers from 1 to 100</p>
                <p className="text-gray-700">A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.</p>
              </div>
              
              <div>
                <p className="font-medium mb-2">Expected output:</p>
                <div className="bg-gray-50 p-3 rounded font-mono text-xs overflow-y-auto max-h-96">
                  <div>2</div>
                  <div>3</div>
                  <div>5</div>
                  <div>7</div>
                  <div>11</div>
                  <div>13</div>
                  <div>17</div>
                  <div>19</div>
                  <div>23</div>
                  <div>29</div>
                  <div>31</div>
                  <div>37</div>
                  <div>41</div>
                  <div>43</div>
                  <div>47</div>
                  <div className="text-gray-400">... (25 total)</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-xs">
                  <li>Language: <strong>JavaScript</strong></li>
                  <li>Use <code className="bg-gray-100 px-1 rounded">console.log()</code> to print each prime</li>
                  <li>Print one prime per line</li>
                  <li>Multiple algorithms possible: trial division, sieve, etc.</li>
                  <li>Test as many times as you'd like</li>
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