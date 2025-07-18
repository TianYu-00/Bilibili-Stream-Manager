import React, { useState } from 'react'

export default function StartStream({ room_id, area_v2, platform, sessdata, csrf }) {
  const [status, setStatus] = useState('')

  const handleStart = async () => {
    if (!room_id || !area_v2 || !platform || !sessdata || !csrf) {
      setStatus('Please make sure all parameters are set.')
      return
    }
    setStatus('Starting stream...')

    try {
      const response = await window.api.startLiveStream({
        room_id,
        area_v2,
        platform,
        csrf,
        sessdata
      })
      console.log(response)
      if (response.code === 0) {
        setStatus('Stream started successfully')
        console.log('Stream start response:', response.data)
      } else if (response.code === 60024) {
        // Handle this situation better with maybe ui for user to copy and paste, but ill do that later on.
        setStatus(
          'Face recognition is required, please open this link in your mobile browser to complete face recognition:',
          response.data.qr
        )
      } else {
        setStatus(`Failed to start stream: ${response.message || response.msg}`)
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`)
    }
  }

  return (
    <div>
      <button
        onClick={handleStart}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
      >
        开启直播
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  )
}
