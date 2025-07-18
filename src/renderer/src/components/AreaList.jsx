import React, { useEffect, useState } from 'react'

export default function AreaList({ selectedArea, onAreaChange }) {
  const [areaList, setAreaList] = useState([])

  useEffect(() => {
    const fetchAreaList = async () => {
      try {
        const response = await window.api.getAreaList()
        console.log('Area List:', response.data)
        setAreaList(response.data)
      } catch (error) {
        console.error('Failed to get area list:', error)
      }
    }

    fetchAreaList()
  }, [])

  const handleSelectChange = (e) => {
    const selectedId = e.target.value
    let selectedName = ''

    for (const area of areaList) {
      const found = area.list.find((child) => String(child.id) === selectedId)
      if (found) {
        selectedName = found.name
        break
      }
    }

    onAreaChange({ id: selectedId, name: selectedName })
  }

  return (
    <div className="flex items-center space-x-2">
      <label className="block text-sm">分区:</label>
      <select
        className="border border-gray-300 rounded px-2 py-1"
        onChange={handleSelectChange}
        value={selectedArea?.id || ''}
      >
        <option value="">保持原分区</option>
        {areaList.map((area) => (
          <React.Fragment key={area.id}>
            <option disabled className="text-green-500">
              -- {area.name} --
            </option>
            {area.list.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </React.Fragment>
        ))}
      </select>
    </div>
  )
}
