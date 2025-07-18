import React, { useState } from 'react'

export default function EndStream({ room_id, platform, sessdata, csrf }) {
  const [status, setStatus] = useState('')

  const handleEnd = async () => {
    if (!room_id || !platform || !sessdata || !csrf) {
      setStatus('Please make sure all parameters are set.')
      return
    }
    setStatus('Ending stream...')

    try {
      const response = await window.api.endLiveStream({ room_id, platform, sessdata, csrf })
      console.log(response)
      if (response.code === 0) {
        setStatus('Live stream ended successfully')
      } else {
        setStatus(`Failed to end stream: ${response.message || response.msg}`)
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`)
    }
  }

  return (
    <div>
      <button
        onClick={handleEnd}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
      >
        结束直播
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  )
}
