import React, { useState, useEffect, useRef } from 'react'
import QRCode from 'react-qr-code'
import AreaList from './components/AreaList'
import StreamTitle from './components/StreamTitle'
import StartStream from './components/StartStream'
import UpdateStream from './components/UpdateStream'
import EndStream from './components/EndStream'
import TableComponent from './components/TableComponent'

function App() {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [roomId, setRoomId] = useState(null)

  const [qrStatus, setQRStatus] = useState('')
  const [sessdata, setSessdata] = useState(localStorage.getItem('SESSDATA') || '')
  const [csrf, setCSRF] = useState(localStorage.getItem('bili_jct') || '')
  const [mid, setMid] = useState(localStorage.getItem('MID') || '')
  const [username, setUsername] = useState('')

  const [platform, setPlatform] = useState('pc_link')
  const [selectedArea, setSelectedArea] = useState(() => {
    const storedArea = localStorage.getItem('SELECTED_AREA')
    return storedArea ? JSON.parse(storedArea) : null
  })

  const [streamTitle, setStreamTitle] = useState(() => {
    return localStorage.getItem('STREAM_TITLE') || ''
  })
  const [streamAddress, setStreamAddress] = useState('')
  const [streamKey, setStreamKey] = useState('')
  const [liveStreamArea, setLiveStreamArea] = useState(null)
  const [liveStreamTitle, setLiveStreamTitle] = useState('')
  const [liveStreamStatus, setLiveStreamStatus] = useState('')
  const [faceRecognitionAddress, setFaceRecognitionAddress] = useState('')

  const intervalRef = useRef(null)

  const saveCredentials = (sessdata, csrf, mid) => {
    if (sessdata) {
      localStorage.setItem('SESSDATA', sessdata)
      setSessdata(sessdata)
    }
    if (csrf) {
      localStorage.setItem('bili_jct', csrf)
      setCSRF(csrf)
    }
    if (mid) {
      localStorage.setItem('MID', mid)
      setMid(mid)
    }
  }

  const clearCredentials = () => {
    localStorage.removeItem('SESSDATA')
    localStorage.removeItem('bili_jct')
    localStorage.removeItem('MID')
    setSessdata('')
    setCSRF('')
    setMid('')
    setRoomId(null)
    setUsername('')
    setLiveStreamArea(null)
    setLiveStreamTitle('')
    setLiveStreamStatus('未知')
    setFaceRecognitionAddress('')
    setStreamAddress('')
    setStreamKey('')
  }

  const getLoginQRCode = async () => {
    setLoading(true)

    try {
      const data = await window.api.getLoginQRCode()
      setQrData(data)
      setIsLoggedIn(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const pollLogin = async (qrcodeKey) => {
    try {
      const response = await window.api.pollLoginStatus(qrcodeKey)

      switch (response.data.code) {
        case 0:
          clearInterval(intervalRef.current)
          saveCredentials(response.data.sessdata, response.data.csrf)
          setQRStatus(response.data.message)
          verifyLoginStatus(response.data.sessdata)
          break
        case 86038:
          clearInterval(intervalRef.current)
          setQRStatus(response.data.message)
          break
        case 86090:
          setQRStatus(response.data.message)
          break
        case 86101:
          setQRStatus(response.data.message)
          break
        default:
          setQRStatus(response.data.message)
      }
    } catch (error) {
      console.error(error)
      clearInterval(intervalRef.current)
    }
  }

  const verifyLoginStatus = async (sess) => {
    try {
      const response = await window.api.verifyLogin(sess)
      if (response?.code === 0 && response.data?.isLogin) {
        setIsLoggedIn(true)
        setUsername(response.data.uname)
        if (!mid) saveCredentials(sessdata, csrf, response.data.mid)
      } else {
        throw new Error('Invalid session')
      }
    } catch (error) {
      console.error(error)
      setIsLoggedIn(false)
      clearCredentials()
    }
  }

  const getRoomIdByUID = async (uid) => {
    try {
      const response = await window.api.getRoomIdByUID(uid)
      setRoomId(response.data.room_id)
    } catch (error) {
      console.error(error)
    }
  }

  const handleLogout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setQrData(null)
    setIsLoggedIn(false)
    clearCredentials()
  }

  const handleAreaChange = ({ id, name }) => {
    const area = { id, name }
    setSelectedArea(area)
    localStorage.setItem('SELECTED_AREA', JSON.stringify(area))
  }

  const handleStreamTitleChange = (newTitle) => {
    setStreamTitle(newTitle)
    localStorage.setItem('STREAM_TITLE', newTitle)
  }

  const getRoomInfo = async (room_id) => {
    try {
      const response = await window.api.getRoomInfo(room_id)
      console.log(response.data)
      setLiveStreamArea({ id: response.data.area_id, name: response.data.area_name })
      setLiveStreamTitle(response.data.title)

      switch (response.data.live_status) {
        case 0:
          setLiveStreamStatus('未开播')
          break
        case 1:
          setLiveStreamStatus('直播中')
          break
        case 2:
          setLiveStreamStatus('轮播中')
          break
        default:
          setLiveStreamStatus('未知')
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Auto verify on session load
  useEffect(() => {
    if (sessdata && csrf && !isLoggedIn) {
      verifyLoginStatus(sessdata)
    }
  }, [sessdata, csrf])

  // Poll QR login
  useEffect(() => {
    if (!qrData?.data?.qrcode_key || isLoggedIn) return
    intervalRef.current = setInterval(() => pollLogin(qrData.data.qrcode_key), 2000) // poll every 2 seconds
    return () => clearInterval(intervalRef.current)
  }, [qrData, isLoggedIn])

  // Fetch room_id when UID (mid) is available
  useEffect(() => {
    if (mid && isLoggedIn) getRoomIdByUID(mid)
  }, [mid, isLoggedIn])

  useEffect(() => {
    if (roomId) getRoomInfo(roomId)
  }, [roomId])

  return (
    <div className="flex flex-col items-start justify-start min-h-screen bg-gray-100 p-6">
      <div className="flex items-center space-x-2">
        <AreaList selectedArea={selectedArea} onAreaChange={handleAreaChange} />
        <StreamTitle title={streamTitle} onTitleChange={handleStreamTitleChange} />
        <UpdateStream
          room_id={roomId}
          title={streamTitle}
          area_name={selectedArea?.name}
          area_id={selectedArea?.id}
          sessdata={sessdata}
          csrf={csrf}
          setLiveStreamArea={setLiveStreamArea}
          setLiveStreamTitle={setLiveStreamTitle}
        />
        <StartStream
          room_id={roomId}
          area_v2={selectedArea?.id}
          platform={platform}
          sessdata={sessdata}
          csrf={csrf}
          setStreamAddress={setStreamAddress}
          setStreamKey={setStreamKey}
          setLiveStreamStatus={setLiveStreamStatus}
          setFaceRecognitionAddress={setFaceRecognitionAddress}
        />

        <EndStream
          room_id={roomId}
          platform={platform}
          sessdata={sessdata}
          csrf={csrf}
          setStreamAddress={setStreamAddress}
          setStreamKey={setStreamKey}
          setLiveStreamStatus={setLiveStreamStatus}
        />
      </div>

      <TableComponent
        qr_status={qrStatus}
        sessdata={sessdata}
        csrf={csrf}
        uid={mid}
        username={username}
        isLoggedIn={isLoggedIn}
        room_id={roomId}
        title={liveStreamTitle}
        area_name={liveStreamArea?.name}
        area_id={liveStreamArea?.id}
        platform={platform}
        stream_address={streamAddress}
        stream_key={streamKey}
        live_status={liveStreamStatus}
        faceRecognitionAddress={faceRecognitionAddress}
      />

      {!isLoggedIn ? (
        <button
          onClick={getLoginQRCode}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : '二维码登录'}
        </button>
      ) : (
        <button
          onClick={handleLogout}
          className="mt-4 px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
        >
          退出登录
        </button>
      )}

      {qrData?.data?.url && !isLoggedIn && (
        <div className="mt-4 bg-white rounded shadow">
          <QRCode value={qrData.data.url} size={256} />
        </div>
      )}
    </div>
  )
}

export default App
