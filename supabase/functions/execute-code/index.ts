import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code } = await req.json()

    let output = ''
    let isValid = false

    // Execute JavaScript code
    try {
      // Capture console.log output
      const logs: string[] = []
      const originalLog = console.log
      console.log = (...args) => {
        logs.push(args.join(' '))
      }

      // Create a safe eval environment
      const func = new Function(code)
      func()

      // Restore console.log
      console.log = originalLog
      output = logs.join('\n')
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate prime numbers output
    const expectedOutput = generatePrimes()
    isValid = output.trim() === expectedOutput.trim()

    return new Response(
      JSON.stringify({ 
        success: true, 
        output: output.substring(0, 500), // Limit output for safety
        isValid 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generatePrimes(): string {
  const primes: number[] = []
  
  for (let num = 2; num <= 100; num++) {
    let isPrime = true
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        isPrime = false
        break
      }
    }
    if (isPrime) {
      primes.push(num)
    }
  }
  
  return primes.map(p => p.toString()).join('\n')
}

// Keep FizzBuzz for testing purposes
function generateFizzBuzz(): string {
  const result: string[] = []
  for (let i = 1; i <= 100; i++) {
    if (i % 15 === 0) {
      result.push('FizzBuzz')
    } else if (i % 3 === 0) {
      result.push('Fizz')
    } else if (i % 5 === 0) {
      result.push('Buzz')
    } else {
      result.push(i.toString())
    }
  }
  return result.join('\n')
}