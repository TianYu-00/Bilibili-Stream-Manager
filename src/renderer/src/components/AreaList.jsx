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
        toast.error(error)
      }
    }

    fetchAreaList()
  }, [])

  return (
    <div className="flex items-center space-x-2 w-full">
      <label htmlFor="" className="text-sm whitespace-nowrap">
        分区:
      </label>
      <div className="flex-1">
        <Select
          options={areaOptions}
          value={selectedArea ? areaOptions.find((opt) => opt.value.id === selectedArea.id) : null}
          onChange={(selected) => {
            onAreaChange(selected ? selected.value : null)
          }}
          placeholder="请选择分区"
          // isClearable
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
