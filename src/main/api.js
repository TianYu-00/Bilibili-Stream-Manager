import axios from 'axios'
import { AppSign } from './appsign'
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

Update Stream
https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/live/manage.md#%E6%9B%B4%E6%96%B0%E7%9B%B4%E6%92%AD%E9%97%B4%E4%BF%A1%E6%81%AF

StartStream
https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/live/manage.md#%E5%BC%80%E5%A7%8B%E7%9B%B4%E6%92%AD

EndStream
https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/live/manage.md#%E5%85%B3%E9%97%AD%E7%9B%B4%E6%92%AD

Get Room Info
https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/live/info.md#%E8%8E%B7%E5%8F%96%E7%9B%B4%E6%92%AD%E9%97%B4%E4%BF%A1%E6%81%AF

Logout
https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/login/exit.md#%E9%80%80%E5%87%BA%E7%99%BB%E5%BD%95web%E7%AB%AF

Signing
https://socialsisteryi.github.io/bilibili-API-collect/docs/misc/sign/APP.html#app-api-%E7%AD%BE%E5%90%8D%E7%89%B9%E6%80%A7

APPKey list
https://socialsisteryi.github.io/bilibili-API-collect/docs/misc/sign/APPKey.html
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
    console.error(error)
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
    let dedeuserid = null

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

      const dedeuseridCookie = setCookies.find((cookie) => cookie.startsWith('DedeUserID='))
      if (csrfCookie) {
        dedeuserid = dedeuseridCookie.split(';')[0].split('=')[1]
        response.data.data.dedeuserid = dedeuserid
      }
    }

    // console.log(response.data)
    return response.data
  } catch (error) {
    console.error(error)
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

    // console.log(response.data)
    return response.data
  } catch (err) {
    console.error(error)
    throw error
  }
}

export async function GetRoomIdByUID(uid) {
  try {
    const response = await axios.get(`https://api.live.bilibili.com/room/v2/Room/room_id_by_uid`, {
      params: { uid }
    })

    // console.log(response.data)
    return response.data
  } catch (error) {
    throw error
  }
}

export async function GetAreaList() {
  try {
    const response = await axios.get(`https://api.live.bilibili.com/room/v1/Area/getList`)

    // console.log(response.data)
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function UpdateStreamInfo({ room_id, title, area_id, sessdata, csrf }) {
  try {
    const payload = new URLSearchParams({
      room_id,
      area_id,
      title,
      csrf,
      csrf_token: csrf
    })

    const response = await axios.post(
      'https://api.live.bilibili.com/room/v1/Room/update',
      payload.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: `SESSDATA=${sessdata}; bili_jct=${csrf}`
        }
      }
    )

    // console.log(response.data)
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function ZBJVersionInfo() {
  try {
    const response = await axios.get(
      `https://api.live.bilibili.com/xlive/app-blink/v1/liveVersionInfo/getHomePageLiveVersion`,
      {
        params: {
          system_version: 2,
          appKey: 'aae92bc66f3edfab',
          ts: '',
          sign: ''
        }
      }
    )

    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function StartLiveStream({
  room_id,
  area_v2,
  platform,
  sessdata,
  csrf,
  zbj_version,
  zbj_build
}) {
  try {
    /*
      NOTE: 20/07/2025 - Keeping just `room_id` `area_v2` `platform` `csrf` `build` in the formbody could already bypass face recognition.
            However, to make it more future proof its better to add `version` `ts` `appkey` and then sign it with {params, appkey, appsec} to get `sign` param
            params for signing include: `room_id` `area_v2` `platform` `csrf` `build` `version` `ts` `appkey`
            final params include: `room_id` `area_v2` `platform` `csrf` `build` `version` `ts` `appkey` `sign`
    */

    const currentTime = Math.floor(Date.now() / 1000)
    const appkey = 'aae92bc66f3edfab' // PC 投稿工具/直播姬 appkey
    const appsec = 'af125a0d5279fd576c1b4418a3e8276d' // PC 投稿工具/直播姬 appsec

    const params = {
      room_id, // room id
      area_v2, // area child id
      platform, // pc_link or android_link // web_link (deprecated)
      csrf, // bili_jct
      version: zbj_version, // 直播姬 version
      build: zbj_build, // 直播姬 build
      ts: currentTime.toString(), // current unix timestamp
      appkey // appkey
    }

    const sign = AppSign(params, appkey, appsec)
    params.sign = sign

    const formBody = new URLSearchParams(params).toString()
    // console.log(formBody)
    const response = await axios.post(
      'https://api.live.bilibili.com/room/v1/Room/startLive',
      formBody,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: `SESSDATA=${sessdata}; bili_jct=${csrf}`
        }
      }
    )

    // console.log(response.data)
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function EndLiveStream({ room_id, platform, sessdata, csrf }) {
  try {
    const formBody = new URLSearchParams({
      room_id, // live room id
      platform, // pc_link or android_link // web_link (deprecated)
      csrf // csrf
    }).toString()

    const response = await axios.post(
      'https://api.live.bilibili.com/room/v1/Room/stopLive',
      formBody,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: `SESSDATA=${sessdata}; bili_jct=${csrf}`
        }
      }
    )

    // console.log(response.data)
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function GetRoomInfo(room_id) {
  try {
    const response = await axios.get('https://api.live.bilibili.com/room/v1/Room/get_info', {
      params: { room_id }
    })

    // console.log(response.data)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function LogOut({ sessdata, csrf, dedeuserid }) {
  // mainly used to destroy the session token on bilibili's server side, the rest i have handled it through App.jsx
  try {
    const payload = new URLSearchParams({
      biliCSRF: csrf
    })

    const response = await axios.post(
      'https://passport.bilibili.com/login/exit/v2',
      payload.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: `SESSDATA=${sessdata}; bili_jct=${csrf}; DedeUserID=${dedeuserid} `
        }
      }
    )

    // console.log(response.data)
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}
