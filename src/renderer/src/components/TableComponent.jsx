import React, { useState, useMemo, useRef } from 'react'

export default function TableComponent({
  sessdata,
  csrf,
  uid,
  username,
  isLoggedIn,
  room_id,
  title,
  area_name,
  area_id,
  platform,
  stream_address,
  stream_key,
  live_status
}) {
  const [copiedLabels, setCopiedLabels] = useState({})
  const timeoutRefs = useRef({}) // to store timeouts per label

  const accountData = useMemo(
    () => [
      { label: '登录状态', value: isLoggedIn ? '已登录' : '未登录', sensitive: false },
      { label: '用户ID', value: uid, sensitive: false },
      { label: '用户名', value: username, sensitive: false },
      { label: 'SESSDATA', value: sessdata, sensitive: true },
      { label: 'CSRF', value: csrf, sensitive: true }
    ],
    [isLoggedIn, uid, username, sessdata, csrf]
  )

  const streamData = useMemo(
    () => [
      { label: '直播间状态', value: live_status, sensitive: false },
      { label: '直播间ID', value: room_id, sensitive: false },
      { label: '直播间标题', value: title, sensitive: false },
      { label: '分区名字', value: area_name, sensitive: false },
      { label: '分区ID', value: area_id, sensitive: false },
      { label: '平台', value: platform, sensitive: false },
      { label: '推流地址', value: stream_address, sensitive: true },
      { label: '推流码', value: stream_key, sensitive: true }
    ],
    [live_status, room_id, title, area_name, area_id, platform, stream_address, stream_key]
  )

  const initialVisibility = useMemo(() => {
    const visibilityState = {}
    ;[...accountData, ...streamData].forEach(({ label, sensitive }) => {
      visibilityState[label] = !sensitive
    })
    return visibilityState
  }, [accountData, streamData])

  const [visibility, setVisibility] = useState(initialVisibility)

  const toggleVisibility = (label) => {
    setVisibility((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const maskValue = (val) => {
    if (val == null) return ''
    if (typeof val === 'string') return '*'.repeat(val.length)
    return '***'
  }

  const copyValue = async (label, val) => {
    if (val == null) return
    try {
      await navigator.clipboard.writeText(val)
      setCopiedLabels((prev) => ({ ...prev, [label]: true }))

      if (timeoutRefs.current[label]) {
        clearTimeout(timeoutRefs.current[label])
      }

      timeoutRefs.current[label] = setTimeout(() => {
        setCopiedLabels((prev) => ({ ...prev, [label]: false }))
        delete timeoutRefs.current[label]
      }, 1000)
    } catch (error) {
      toast.error(error)
    }
  }

  const renderTable = (data, heading) => (
    <div className="overflow-x-auto mt-4 w-full">
      <h2 className="font-semibold text-lg mb-2">{heading}</h2>
      <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left w-40">Key</th>
            <th className="border px-4 py-2 text-left">Value</th>
            <th className="border px-4 py-2 text-center w-20">Toggle</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ label, value }) => {
            const isVisible = visibility[label]
            return (
              <tr key={label}>
                <td className="border px-4 py-2 font-medium">{label}</td>
                <td className="border px-4 py-2 break-all">
                  {isVisible ? value : maskValue(value)}
                </td>
                <td className="border px-4 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => toggleVisibility(label)}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 w-12"
                  >
                    {isVisible ? '隐藏' : '显示'}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyValue(label, value)}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 mt-1 w-12"
                  >
                    {copiedLabels[label] ? '✓' : '复制'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="w-full">
      {renderTable(accountData, '账号信息')}
      {renderTable(streamData, '直播信息')}
    </div>
  )
}
