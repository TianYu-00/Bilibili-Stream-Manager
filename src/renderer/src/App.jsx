import React, { useState, useEffect, useRef } from 'react'
import QRCode from 'react-qr-code'
import AreaList from './components/AreaList'

function App() {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [roomId, setRoomId] = useState(null)

  const [sessdata, setSessdata] = useState(localStorage.getItem('SESSDATA') || '')
  const [csrf, setCSRF] = useState(localStorage.getItem('bili_jct') || '')
  const [mid, setMid] = useState(localStorage.getItem('MID') || '')

  const [selectedAreaId, setSelectedAreaId] = useState(null)

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
  }

  const getLoginQRCode = async () => {
    setLoading(true)
    setStatusMessage('')
    try {
      const data = await window.api.getLoginQRCode()
      setQrData(data)
      setIsLoggedIn(false)
    } catch (error) {
      console.error('Failed to get QR code:', error)
      setStatusMessage('Failed to get QR code.')
    } finally {
      setLoading(false)
    }
  }

  const pollLogin = async (qrcodeKey) => {
    try {
      const response = await window.api.pollLoginStatus(qrcodeKey)
      console.log('Poll result:', response.data)

      switch (response.data.code) {
        case 0:
          clearInterval(intervalRef.current)
          saveCredentials(response.data.sessdata, response.data.csrf)
          setStatusMessage('Login successful!')
          verifyLoginStatus(response.data.sessdata)
          break
        case 86038:
          clearInterval(intervalRef.current)
          setStatusMessage('❌ QR code expired')
          break
        case 86090:
          setStatusMessage('📱 Scanned. Awaiting confirmation...')
          break
        case 86101:
          setStatusMessage('⌛ Waiting for scan...')
          break
        default:
          setStatusMessage(`${response.message || 'Unknown error'}`)
      }
    } catch (error) {
      clearInterval(intervalRef.current)
      setStatusMessage('Error checking login status')
    }
  }

  const verifyLoginStatus = async (sess) => {
    try {
      const response = await window.api.verifyLogin(sess)
      console.log('Login status:', response)
      if (response?.code === 0 && response.data?.isLogin) {
        setIsLoggedIn(true)
        setStatusMessage(`Logged in as ${response.data.uname}`)
        if (!mid) saveCredentials(sessdata, csrf, response.data.mid)
      } else {
        throw new Error('Invalid session')
      }
    } catch (error) {
      console.warn('Session invalid or expired')
      setIsLoggedIn(false)
      setStatusMessage('Session expired. Please log in again.')
      clearCredentials()
    }
  }

  const getRoomIdByUID = async (uid) => {
    try {
      const response = await window.api.getRoomIdByUID(uid)
      console.log('Room ID:', response.data.room_id)
      setRoomId(response.data.room_id)
    } catch (error) {
      console.error('Failed to get Room ID:', error)
    }
  }

  const handleLogout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setQrData(null)
    setStatusMessage('')
    setIsLoggedIn(false)
    clearCredentials()
  }

  const handleAreaChange = (id) => {
    console.log('Area selected in App.jsx:', id)
    setSelectedAreaId(id)
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {!isLoggedIn ? (
        <button
          onClick={getLoginQRCode}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Login QR Code'}
        </button>
      ) : (
        <button
          onClick={handleLogout}
          className="mt-4 px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      )}

      {qrData?.data?.url && !isLoggedIn && (
        <div className="mt-10 bg-white p-4 rounded shadow">
          <QRCode value={qrData.data.url} size={256} />
        </div>
      )}

      <div className="max-w-lg px-4">
        {statusMessage && <p className="mt-4 break-words">{statusMessage}</p>}
        {mid && <p className="mt-1 break-words">UID: {mid}</p>}
        {sessdata && <p className="mt-1 break-words">SESSDATA: {sessdata}</p>}
        {csrf && <p className="mt-1 break-words">CSRF: {csrf}</p>}
        {roomId && <p className="mt-1 break-words">Room ID: {roomId}</p>}
        <AreaList selectedAreaId={selectedAreaId} onAreaChange={handleAreaChange} />
      </div>
    </div>
  )
}

export default App
