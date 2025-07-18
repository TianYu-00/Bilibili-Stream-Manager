import React, { useState } from 'react'

export default function EndStream({ room_id, platform, sessdata, csrf }) {
  const [status, setStatus] = useState('idle') // idle | loading | success

  const handleEndClick = async () => {
    if (!room_id || !platform || !sessdata || !csrf) {
      alert('缺少必要的参数，无法结束直播')
      return
    }

    setStatus('loading')

    try {
      const response = await window.api.endLiveStream({ room_id, platform, sessdata, csrf })
      console.log(response)
      if (response.code === 0) {
        setStatus('success')
        setTimeout(() => setStatus('idle'), 2000)
      } else {
        console.error('End failed:', response.message || response.msg || response)
        setStatus('idle')
      }
    } catch (error) {
      console.error(error)
      setStatus('idle')
    }
  }

  const getButtonText = () => {
    if (status === 'loading') return '正在结束直播...'
    if (status === 'success') return '直播已结束'
    return '结束直播'
  }

  return (
    <div>
      <button
        onClick={handleEndClick}
        disabled={status === 'loading' || status === 'success'}
        className="p-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
      >
        {getButtonText()}
      </button>
    </div>
  )
}
