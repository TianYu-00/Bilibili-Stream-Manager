import React from 'react'

export default function StreamTitle({ title, onTitleChange }) {
  const handleChange = (e) => {
    onTitleChange(e.target.value)
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="streamTitle" className="block text-sm">
        标题:
      </label>
      <input
        id="streamTitle"
        type="text"
        value={title}
        onChange={handleChange}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        placeholder="输入直播间标题"
      />
    </div>
  )
}
