import React, { useState } from 'react'

export default function UpdateStream({
  room_id,
  title,
  area_id,
  area_name,
  sessdata,
  csrf,
  setLiveStreamArea,
  setLiveStreamTitle
}) {
  const [status, setStatus] = useState('idle') // idle | loading | success

  const handleUpdateClick = async () => {
    setStatus('loading')

    try {
      const response = await window.api.updateStreamInfo({
        room_id,
        title,
        area_id,
        sessdata,
        csrf
      })

      console.log(response.data)

      if (response.code === 0) {
        setStatus('success')
        setLiveStreamArea({ id: area_id, name: area_name })
        setLiveStreamTitle(title)
        setTimeout(() => setStatus('idle'), 2000)
      } else {
        console.error('Update failed:', response.msg || response)
        setStatus('idle')
      }
    } catch (error) {
      console.error(error)
      setStatus('idle')
    }
  }

  const getButtonText = () => {
    if (status === 'loading') return '正在更新...'
    if (status === 'success') return '更新成功'
    return '更新直播间信息'
  }

  return (
    <div>
      <button
        onClick={handleUpdateClick}
        disabled={status === 'loading' || status === 'success'}
        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
      >
        {getButtonText()}
      </button>
    </div>
  )
}
