import React from 'react'

export default function StreamTitle({ title, onTitleChange }) {
  const handleChange = (e) => {
    onTitleChange(e.target.value)
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="streamTitle" className="block text-sm">
        直播间标题:
      </label>
      <input
        id="streamTitle"
        type="text"
        value={title}
        onChange={handleChange}
        className="border border-gray-300 rounded px-2 py-1"
        placeholder="输入直播间标题"
      />
    </div>
  )
}
