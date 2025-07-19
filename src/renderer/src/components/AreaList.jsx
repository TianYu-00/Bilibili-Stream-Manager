import { useEffect, useState } from 'react'
import Select from 'react-select'

export default function AreaList({ selectedArea, onAreaChange }) {
  const [areaOptions, setAreaOptions] = useState([])

  useEffect(() => {
    const fetchAreaList = async () => {
      try {
        const response = await window.api.getAreaList()
        const formatted = response.data.flatMap((group) =>
          group.list.map((child) => ({
            label: `${group.name} / ${child.name}`,
            value: { id: child.id, name: child.name }
          }))
        )
        setAreaOptions(formatted)
      } catch (error) {
        console.error(error)
      }
    }

    fetchAreaList()
  }, [])

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="" className="block text-sm">
        分区:
      </label>
      <Select
        options={areaOptions}
        value={selectedArea ? areaOptions.find((opt) => opt.value.id === selectedArea.id) : null}
        onChange={(selected) => {
          onAreaChange(selected ? selected.value : null)
        }}
        placeholder="请选择分区"
        isClearable
        className="text-sm w-56"
      />
    </div>
  )
}
