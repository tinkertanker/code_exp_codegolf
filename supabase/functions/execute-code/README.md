# Execute Code Edge Function

This Edge Function executes Python and JavaScript code submissions for the Code Golf challenge.

## Deploy to Supabase

1. Install Supabase CLI:
   ```bash
   brew install supabase/tap/supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find your project ref in Supabase dashboard Settings > General)

4. Deploy the function:
   ```bash
   supabase functions deploy execute-code
   ```

## Testing Locally

1. Start Supabase locally:
   ```bash
   supabase start
   ```

2. Serve the function:
   ```bash
   supabase functions serve execute-code --no-verify-jwt
   ```

3. Test with curl:
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/execute-code' \
     --header 'Content-Type: application/json' \
     --data '{"code":"for(let i=1;i<=100;i++){console.log(i%15==0?\"FizzBuzz\":i%3==0?\"Fizz\":i%5==0?\"Buzz\":i)}","language":"javascript"}'
   ```

## Notes

- JavaScript execution uses sandboxed Function constructor
- Python execution requires Python 3 in the Supabase Edge Runtime
- Output is limited to 500 characters for safety
- Validates against expected Fizz Buzz output