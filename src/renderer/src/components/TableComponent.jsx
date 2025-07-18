import React, { useState } from 'react'

export default function TableComponent({
  qr_status,
  sessdata,
  csrf,
  uid,
  username,
  isLoggedIn,
  room_id,
  title,
  area_name,
  area_id,
  platform
}) {
  const tableData = [
    { label: 'QR登录状态', value: qr_status, sensitive: false },
    { label: '登录状态', value: isLoggedIn ? '已登录' : '未登录', sensitive: false },
    { label: '用户ID', value: uid, sensitive: false },
    { label: '用户名', value: username, sensitive: false },
    { label: 'SESSDATA', value: sessdata, sensitive: true },
    { label: 'CSRF', value: csrf, sensitive: true },
    { label: '直播间ID', value: room_id, sensitive: false },
    { label: '直播间标题', value: title, sensitive: false },
    { label: '分区名字', value: area_name, sensitive: false },
    { label: '分区ID', value: area_id, sensitive: false },
    { label: '平台', value: platform, sensitive: false }
  ]

  const initialVisibility = {}
  tableData.forEach(({ label, sensitive }) => {
    if (sensitive === true) {
      initialVisibility[label] = false
    } else {
      initialVisibility[label] = true
    }
  })

  const [visibility, setVisibility] = useState(initialVisibility)

  const toggleVisibility = (label) => {
    setVisibility((prev) => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  const maskValue = (val) => {
    if (!val) return ''
    if (typeof val === 'string') return '*'.repeat(val.length)
    return '***'
  }

  return (
    <div className="overflow-x-auto mt-4 w-full">
      <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left w-32">Key</th>
            <th className="border px-4 py-2 text-left">Value</th>
            <th className="border px-4 py-2 text-center w-20">Toggle</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map(({ label, value }) => {
            const isVisible = visibility[label]

            return (
              <tr key={label}>
                <td className="border px-4 py-2 font-medium">{label}</td>
                <td className="border px-4 py-2 break-all">
                  {isVisible ? value : maskValue(value)}
                </td>
                <td className="border px-4 py-2 text-center w-20">
                  <button
                    onClick={() => toggleVisibility(label)}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                    type="button"
                  >
                    {isVisible ? '隐藏' : '显示'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
