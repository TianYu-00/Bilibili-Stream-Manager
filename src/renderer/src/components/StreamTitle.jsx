import React, { useState, useEffect } from 'react'
import CreatableSelect from 'react-select/creatable'

export default function StreamTitle({ title, onTitleChange }) {
  const [options, setOptions] = useState([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('titleHistory') || '[]')
    setOptions(saved.map((t) => ({ label: t, value: t })))
  }, [])

  const handleChange = (newValue) => {
    const newTitle = newValue?.value || ''
    onTitleChange(newTitle)

    if (!newTitle.trim()) return

    setOptions((prev) => {
      const titles = [newTitle, ...prev.map((o) => o.value)]
      const uniqueTitles = [...new Set(titles)].slice(0, 10)
      const newOptions = uniqueTitles.map((t) => ({ label: t, value: t }))
      localStorage.setItem('titleHistory', JSON.stringify(uniqueTitles))
      return newOptions
    })
  }

  return (
    <div className="flex items-center space-x-2 w-full">
      <label htmlFor="streamTitle" className="text-sm whitespace-nowrap">
        标题:
      </label>
      <div className="flex-1">
        {/* https://react-select.com/creatable */}
        <CreatableSelect
          inputId="streamTitle"
          value={title ? { label: title, value: title } : null}
          onChange={handleChange}
          options={options}
          placeholder="输入直播间标题"
          isClearable
          className="text-sm w-full"
          styles={{
            input: (base) => ({
              ...base,
              width: '0px' // little bit of a cheaty way to prevent input field from expanding when typing long text
            })
          }}
        />
      </div>
    </div>
  )
}
