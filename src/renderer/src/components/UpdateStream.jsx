import React, { useState } from 'react'

export default function UpdateStream({ room_id, title, area_id, sessdata, csrf }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const handleUpdateClick = async () => {
    setLoading(true)
    setSuccess(null)

    try {
      const response = await window.api.updateStreamInfo({
        room_id,
        title,
        area_id,
        sessdata,
        csrf
      })
      if (response.code === 0) {
        setSuccess('Stream info updated successfully')
      } else {
        console.error('Update failed:', response.msg || response)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleUpdateClick}
        disabled={loading}
        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Update Stream Info'}
      </button>

      {success && <p className="mt-2">{success}</p>}
    </div>
  )
}
