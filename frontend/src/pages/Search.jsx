
import React, { useState } from 'react'
import { Search as SearchIcon, Mic } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { serverUrl } from '../App'

function Search() {

  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const [recommendation, setRecommendation] = useState([])
  const [loading, setLoading] = useState(false)

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported")
      return
    }

    const recognition = new SpeechRecognition()

    recognition.lang = 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
    }

    recognition.onerror = () => {
      toast.error("Voice recognition failed")
    }

    recognition.start()
  }

  const handleSearch = async () => {

    if (!input.trim()) {
      toast.error("Please enter something")
      return
    }

    try {
      setLoading(true)

      const result = await axios.post(
        `${serverUrl}/api/course/search`,
        { input: input },
        { withCredentials: true }
      )

      setRecommendation(result.data.recommendation || [])

      toast.success("Search completed")

    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full flex flex-col justify-center items-center p-5'>

      <div className='w-full max-w-2xl flex items-center gap-2 border border-gray-300 rounded-xl px-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500'>

        <input
          type='text'
          name='search'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder='Search with AI...'
          className='w-full px-3 py-3 outline-none bg-transparent'
        />

        <button
          type='button'
          onClick={handleVoiceSearch}
          className='p-2 rounded-lg hover:bg-gray-100 text-gray-600'
        >
          <Mic size={22} />
        </button>

        <button
          type='button'
          onClick={handleSearch}
          disabled={loading}
          className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
        >
          <SearchIcon size={18} />
          <span>{loading ? 'Searching...' : 'Search'}</span>
        </button>

      </div>

      {/* Recommendation */}
      <div className='w-full max-w-2xl mt-5'>

        {recommendation.map((item, index) => (

          <div
            key={item._id || index}
            onClick={() => navigate(`/viewCourse/${item._id}`)}
            className='p-4 border rounded-lg mb-3 cursor-pointer hover:shadow-md transition-all'
          >
            <h2 className='font-semibold text-lg'>{item.title}</h2>

            <p className='text-gray-600 mt-1'>
              {item.description}
            </p>

          </div>

        ))}

      </div>

    </div>
  )
}

export default Search
