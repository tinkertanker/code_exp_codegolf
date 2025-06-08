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
    const { code, language } = await req.json()

    let output = ''
    let isValid = false

    if (language === 'javascript') {
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
    } else if (language === 'python') {
      // Execute Python code using subprocess
      try {
        const tempFile = await Deno.makeTempFile({ suffix: '.py' })
        await Deno.writeTextFile(tempFile, code)
        
        const process = new Deno.Command('python3', {
          args: [tempFile],
          stdout: 'piped',
          stderr: 'piped',
        })
        
        const { stdout, stderr, success } = await process.output()
        
        await Deno.remove(tempFile)
        
        if (!success) {
          const errorText = new TextDecoder().decode(stderr)
          return new Response(
            JSON.stringify({ success: false, error: errorText }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        output = new TextDecoder().decode(stdout)
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Validate Fizz Buzz output
    const expectedOutput = generateFizzBuzz()
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