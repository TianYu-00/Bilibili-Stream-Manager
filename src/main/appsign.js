import { createHash } from 'node:crypto'

/*
为请求参数进行 APP 签名
Signing Demo - THANKS A LOT FOR THIS!
https://socialsisteryi.github.io/bilibili-API-collect/docs/misc/sign/APP.html#typescript-javascript

params - params are the list of params that are needed for the request
appkey - appkey
appsec - appsec

APPKey List
https://socialsisteryi.github.io/bilibili-API-collect/docs/misc/sign/APPKey.html
*/

const md5 = (str) => createHash('md5').update(str).digest('hex')

export function AppSign(params, appkey, appsec) {
  params.appkey = appkey
  const searchParams = new URLSearchParams(params)
  searchParams.sort()
  return md5(searchParams.toString() + appsec)
}
