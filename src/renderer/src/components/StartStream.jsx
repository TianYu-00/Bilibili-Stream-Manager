import React, { useEffect } from 'react'
import { toast } from 'react-toastify'

export default function StartStream({
  room_id,
  area_v2,
  platform,
  sessdata,
  csrf,
  setStreamAddress,
  setStreamKey,
  setLiveStreamStatus,
  setFaceRecognitionAddress,
  setShowFaceQRModal,
  liveStreamStatus
}) {
  const getZBJVerionInfo = async () => {
    try {
      const response = await window.api.zbjVersionInfo()
      return response.data
    } catch (error) {
      toast.error(error)
    }
  }

  const handleStartClick = async () => {
    if (!room_id || !area_v2 || !platform || !sessdata || !csrf) {
      toast.error('缺少必要的参数，无法开始直播')
      return
    }

    try {
      const zbjVersionInfo = await getZBJVerionInfo()

      const response = await window.api.startLiveStream({
        room_id,
        area_v2,
        platform,
        sessdata,
        csrf,
        zbj_version: zbjVersionInfo.curr_version,
        zbj_build: zbjVersionInfo.build
      })

      if (response.code === 0) {
        setStreamAddress(response.data?.rtmp?.addr)
        setStreamKey(response.data?.rtmp?.code)
        setLiveStreamStatus('直播中')
        toast.success('开播成功')
      } else {
        switch (response.code) {
          case 1:
            toast.error('错误')
            break
          case 60037:
            toast.error('Web 在线开播已下线')
            break
          case 60024:
            setFaceRecognitionAddress(response.data?.qr)
            setShowFaceQRModal(true)
            toast.error('目标分区需要人脸认证')
            break
          case 60013:
            toast.error('非常抱歉，您所在的地区受实名认证限制无法开播')
            break
          case 60009:
            toast.error('分区已下线')
            break
          case 65530:
            toast.error('Token错误（登录错误）')
            break
          case -400:
            toast.error('请求错误')
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
        onClick={handleStartClick}
        disabled={liveStreamStatus !== '未开播'}
        className="w-24 p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm whitespace-nowrap truncate"
      >
        开始直播
      </button>
    </div>
  )
}
