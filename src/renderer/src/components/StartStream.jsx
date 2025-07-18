import React, { useState } from 'react'

export default function StartStream({
  room_id,
  area_v2,
  platform,
  sessdata,
  csrf,
  setStreamAddress,
  setStreamKey
}) {
  const [status, setStatus] = useState('idle') // idle | loading | success

  const handleStartClick = async () => {
    // Validate required parameters
    if (!room_id || !area_v2 || !platform || !sessdata || !csrf) {
      alert('缺少必要的参数，无法开始直播')
      return
    }

    setStatus('loading')

    try {
      const response = await window.api.startLiveStream({
        room_id,
        area_v2,
        platform,
        sessdata,
        csrf
      })

      if (response.code === 0) {
        setStatus('success')
        setStreamAddress(response.data?.rtmp?.addr)
        setStreamKey(response.data?.rtmp?.code)
        setTimeout(() => setStatus('idle'), 2000)
      } else {
        console.error('Start failed:', response.msg || response)
        setStatus('idle')
      }
    } catch (error) {
      console.error(error)
      setStatus('idle')
    }
  }

  const getButtonText = () => {
    if (status === 'loading') return '正在开始直播...'
    if (status === 'success') return '直播已开始'
    return '开始直播'
  }

  return (
    <div>
      <button
        onClick={handleStartClick}
        disabled={status === 'loading' || status === 'success'}
        className="p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
      >
        {getButtonText()}
      </button>
    </div>
  )
}
