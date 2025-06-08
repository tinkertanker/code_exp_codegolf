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

const PROBLEM_DESCRIPTION = `Print numbers from 1 to 100, but:
- For multiples of 3, print "Fizz"
- For multiples of 5, print "Buzz"
- For multiples of both 3 and 5, print "FizzBuzz"

Example output:
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
...`

const STARTER_CODE = '// Write your Fizz Buzz solution here\n'

function Challenge() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState

  const [code, setCode] = useState(STARTER_CODE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  useEffect(() => {
    if (!state) {
      navigate('/')
    }
  }, [state, navigate])

  if (!state) return null

  const getCharacterCount = (code: string) => {
    // Count characters excluding whitespace
    return code.replace(/\s/g, '').length
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Fizz Buzz Challenge</h1>
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
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Team {state.category}-{state.teamNumber}
            </p>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded">
            <h2 className="font-semibold mb-2">Problem Description:</h2>
            <pre className="whitespace-pre-wrap font-mono text-sm">{PROBLEM_DESCRIPTION}</pre>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Your Solution:</h2>
              <span className="text-sm font-mono">
                Characters: {getCharacterCount(code)}
              </span>
            </div>
            <div className="border rounded overflow-hidden">
              <Editor
                height="400px"
                language="javascript"
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14
                }}
              />
            </div>
          </div>

          {testResult && (
            <div className={`mb-4 p-3 rounded ${
              testResult.includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {testResult}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleTest}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Test Code
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Submit Solution
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Challenge