import React from 'react'

export default function StreamTitle({ title, onTitleChange }) {
  const handleChange = (e) => {
    onTitleChange(e.target.value)
  }

  return (
    <div>
      <label htmlFor="streamTitle" className="block mb-1">
        Stream title:
      </label>
      <input
        id="streamTitle"
        type="text"
        value={title}
        onChange={handleChange}
        className=""
        placeholder="Enter stream title"
      />
    </div>
  )
}
