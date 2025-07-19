import React, { useState } from 'react'

export default function EndStream({
  room_id,
  platform,
  sessdata,
  csrf,
  setStreamAddress,
  setStreamKey,
  setLiveStreamStatus
}) {
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
        setStreamAddress('')
        setStreamKey('')
        setLiveStreamStatus('未开播')
        setTimeout(() => setStatus('idle'), 2000)
      } else {
        console.error('End failed:', response.message || response.msg || response)
        switch (response.code) {
          case -400:
            alert('没有权限')
            break
          case 65530:
            alert('Token错误（登录错误）')
            break
          default:
            alert('未知错误')
        }
        setStatus('idle')
      }
    } catch (error) {
      console.error(error)
      setStatus('idle')
    }
  }

  const getButtonText = () => {
    if (status === 'loading') return '加载...'
    if (status === 'success') return '关播成功'
    return '结束直播'
  }

  return (
    <div>
      <button
        onClick={handleEndClick}
        disabled={status === 'loading' || status === 'success'}
        className="w-24 p-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm whitespace-nowrap truncate"
      >
        {getButtonText()}
      </button>
    </div>
  )
}
