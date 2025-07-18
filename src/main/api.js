import axios from 'axios'
/*
Generate Login QR Code:
https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/login/login_action/QR.md#web%E7%AB%AF%E6%89%AB%E7%A0%81%E7%99%BB%E5%BD%95

Poll QR Code Login Status
https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/login/login_action/QR.md#web%E7%AB%AF%E6%89%AB%E7%A0%81%E7%99%BB%E5%BD%95

Verify Login
https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/login/login_info.md#%E5%AF%BC%E8%88%AA%E6%A0%8F%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF

Get Room ID By UID
https://github.com/SocialSisterYi/bilibili-API-collect/issues/1143

Get Area List
https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/live/live_area.md#%E8%8E%B7%E5%8F%96%E5%85%A8%E9%83%A8%E7%9B%B4%E6%92%AD%E9%97%B4%E5%88%86%E5%8C%BA%E5%88%97%E8%A1%A8
*/

// Get Login QR Code
export async function GetLoginQRCode() {
  try {
    const response = await axios.get(
      'https://passport.bilibili.com/x/passport-login/web/qrcode/generate'
    )
    // console.log(response.data)
    return response.data
  } catch (error) {
    throw error
  }
}

export async function PollLoginStatus(qrcode_key) {
  try {
    const response = await axios.get(
      'https://passport.bilibili.com/x/passport-login/web/qrcode/poll',
      {
        params: { qrcode_key },
        withCredentials: true,
        maxRedirects: 0,
        validateStatus: null
      }
    )

    const setCookies = response.headers['set-cookie']
    // console.log('Set-Cookie Headers:', setCookies)
    let sessdata = null
    let csrf = null

    if (setCookies) {
      const sessCookie = setCookies.find((cookie) => cookie.startsWith('SESSDATA='))
      if (sessCookie) {
        sessdata = sessCookie.split(';')[0].split('=')[1]
        response.data.data.sessdata = sessdata
      }

      const csrfCookie = setCookies.find((cookie) => cookie.startsWith('bili_jct='))
      if (csrfCookie) {
        csrf = csrfCookie.split(';')[0].split('=')[1]
        response.data.data.csrf = csrf
      }
    }

    // console.log('LOGIN DATA:', response.data)
    return response.data
  } catch (error) {
    throw error
  }
}

export async function VerifyLogin(sessdata) {
  try {
    const response = await axios.get('https://api.bilibili.com/x/web-interface/nav', {
      headers: {
        Cookie: `SESSDATA=${sessdata}`
      }
    })

    return response.data
  } catch (err) {
    console.error('Login verification failed:', err)
    throw error
  }
}

export async function GetRoomIdByUID(uid) {
  try {
    const response = await axios.get(`https://api.live.bilibili.com/room/v2/Room/room_id_by_uid`, {
      params: { uid }
    })

    return response.data
  } catch (error) {
    throw error
  }
}

export async function GetAreaList() {
  try {
    const response = await axios.get(`https://api.live.bilibili.com/room/v1/Area/getList`)
    return response.data
  } catch (error) {
    throw error
  }
}
