import React, { useEffect, useState } from 'react'

export default function AreaList({ selectedAreaId, onAreaChange }) {
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
    onAreaChange(selectedId)
  }

  return (
    <div>
      <label className="block mb-2">Area list:</label>
      <select className="" onChange={handleSelectChange} value={selectedAreaId || ''}>
        <option value="" disabled>
          -- Please select an area --
        </option>
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
