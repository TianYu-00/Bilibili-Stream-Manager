import React, { useEffect } from 'react'
import { toast } from 'react-toastify'

export default function EndStream({
  room_id,
  platform,
  sessdata,
  csrf,
  setStreamAddress,
  setStreamKey,
  setLiveStreamStatus,
  liveStreamStatus
}) {
  const handleEndClick = async () => {
    if (!room_id || !platform || !sessdata || !csrf) {
      toast.error('缺少必要的参数，无法结束直播')
      return
    }

    try {
      const response = await window.api.endLiveStream({ room_id, platform, sessdata, csrf })
      if (response.code === 0) {
        setStreamAddress('')
        setStreamKey('')
        setLiveStreamStatus('未开播')
        toast.success('关播成功')
      } else {
        switch (response.code) {
          case -400:
            toast.error('没有权限')
            break
          case 65530:
            toast.error('Token错误（登录错误）')
            break
          default:
            toast.error('未知错误')
        }
      }
    } catch (error) {
      toast.error(error)
    }
  }

  useEffect(() => {
    console.log(liveStreamStatus)
  }, [liveStreamStatus])

  return (
    <div>
      <button
        onClick={handleEndClick}
        disabled={liveStreamStatus !== '直播中'}
        className="w-24 p-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm whitespace-nowrap truncate"
      >
        结束直播
      </button>
    </div>
  )
}
