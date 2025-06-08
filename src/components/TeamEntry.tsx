import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function TeamEntry() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<1 | 2>(1)
  const [teamNumber, setTeamNumber] = useState('')
  const language: 'javascript' = 'javascript'

  const handleStart = () => {
    if (!teamNumber) {
      alert('Please enter your team number')
      return
    }
    
    navigate('/challenge', {
      state: {
        category,
        teamNumber: parseInt(teamNumber),
        language,
        startTime: Date.now()
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-3xl font-bold mb-2 text-center">Code Golf Challenge</h1>
        <p className="text-lg text-gray-600 mb-6 text-center">JavaScript Fizz Buzz</p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Category</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value={1}
                checked={category === 1}
                onChange={() => setCategory(1)}
                className="mr-2"
              />
              Category 1
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value={2}
                checked={category === 2}
                onChange={() => setCategory(2)}
                className="mr-2"
              />
              Category 2
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Team Number</label>
          <input
            type="number"
            value={teamNumber}
            onChange={(e) => setTeamNumber(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your team number"
          />
        </div>


        <button
          onClick={handleStart}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Start Challenge
        </button>
      </div>
    </div>
  )
}

export default TeamEntry