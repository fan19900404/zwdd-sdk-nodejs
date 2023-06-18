# zwdd-sdk-nodejs
专有钉钉（浙政钉）node版本的SDK

本sdk,无任何依赖

## 使用要求
* node >= 18

> 应为sdk中使用了fetch方法用来请求，此方法要在node17中加参数使用，node18中才能正常使用。如果要求更低版本的node使用，可以引入`got`|`axios`|`alova`等库实现改造

## demo使用方法
该库的使用案例，以[AccessToken](https://openplatform-portal.dg-work.cn/portal/#/helpdoc?apiType=DEV_GUIDE&docKey=3355045)方法为例

```ts
import ExecutableClient from "./zwdd-sdk-nodejs";

/**
 * 获取token
 * @param  request 请求
 */
const getAccessToken = (
  request: ExecutableClient["fetch"],
  data: {
    /** 应用的唯一标识key */ appkey: string;
    /** 应用的密钥 */ appsecret: string;
  }
) => {
  return request("/gettoken.json", data, "GET");
};

const accessKey = "应用的唯一标识key"
const secretKey = "应用的密钥"
const domainName = "https://openplatform.dg-work.cn"


const http = new ExecutableClient({
  accessKey,
  secretKey,
  domainName,
}).fetch;

const main = async ()=>{
    const token = await getAccessToken(http,{appkey:accessKey,appsecret:secretKey})
    console.log(token)
}

main()
```

## PostMan版本的SDK
在接口测试的时候，使用postman工具更加多，所以在提供一个postman版本的`zwdd-sdk-postman.js`

### 使用方法说明
环境文件`zwdd-message.postman_environment.json`
```json
{
	"id": "61bdd03a-87c3-4b95-8098-b52a3fe53d16",
	"name": "zwdd-message",
	"values": [
		{
			"key": "accessKey",
			"value": "你的应用的accessKey",
			"type": "default",
			"enabled": true
		},
		{
			"key": "secretKey",
			"value": "你的应用的secretKey",
			"type": "default",
			"enabled": true
		},
		{
			"key": "domainName",
			"value": "https://openplatform.dg-work.cn",
			"type": "default",
			"enabled": true
		}
	],
	"_postman_variable_scope": "environment",
	"_postman_exported_at": "2023-06-18T04:37:06.516Z",
	"_postman_exported_using": "Postman/10.15.0"
}
```
两个扫码示例文件`/home/fan/Documents/zwdd/专有钉钉测试.postman_collection.json`
```json
{
	"info": {
		"_postman_id": "4591bbbb-e094-466a-a23e-f17b1f186a42",
		"name": "专有钉钉测试",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"item": [
		{
			"name": "getAccessToken",
			"event": [
				{
					"listen": "prerequest",
					"script": {
						"exec": [
							"require(\"crypto-js\");",
							"",
							"/**",
							" * 签名",
							" * @param {'GET'|'POST'} method 请求方式",
							" * @param {string} timestamp header中的时间戳",
							" * @param {string} nonce header中的nonce",
							" * @param {string} url 请求的地址",
							" * @param {string} params 请求参数",
							" * @returns {string} 签名字段",
							" */",
							"const getSignature = (method, timestamp, nonce, url, params) => {",
							"    /** 获取签名字符串的字节数组：请求Method+'\\n'+请求Header中的Timestamp+'\\n'+请求Header中的Nonce+'\\n'+请求的的URL(不带域名)+'\\n'+请求参数 */",
							"    const bytesToSign = `${method}\\n${timestamp}\\n${nonce}\\n${url}\\n${params}`;",
							"",
							"    // HmacSha256(SecretKey,签名字符串字节数组)",
							"    // const hmac = crypto.createHmac(\"sha256\", this.API_SECRET_KEY);",
							"    // hmac.update(bytesToSign);",
							"    // let Hmac = hmac.digest(\"bytes\");",
							"    var hash = CryptoJS.HmacSHA256(bytesToSign, pm.environment.get('secretKey'));",
							"    // 对第二步结果使用Base64，得到签名结果",
							"    // return Hmac.toString(\"base64\");",
							"    return CryptoJS.enc.Base64.stringify(hash);",
							"}",
							"",
							"/**",
							" * 获取mac地址",
							" * @returns {string} 随机的mac地址",
							" */",
							"const getMacAddress = () => {",
							"    return new Array(6)",
							"        .fill(0x100)",
							"        .map((v) => ((Math.random() * v) << 0).toString(16).padStart(2, \"0\"))",
							"        .join(\":\");",
							"}",
							"",
							"const paramStr = (() => {",
							"    let param = ''",
							"    if (pm.request.method === 'GET') {",
							"        param = pm.request.url.getQueryString()",
							"    } else {",
							"        param = pm.request.body.toString()",
							"    }",
							"",
							"    return param.replace(/{{(.*?)}}/g, (all, key) => {",
							"        return pm.environment.get(key)",
							"    })",
							"})()",
							"",
							"/** 当前时间 */",
							"const now = new Date();",
							"/** 请求发出时间，使用UTC时间，ISO8601格式为\"yyyy-MM-ddTHH:mm:ss.sss+08:00\" */",
							"const timestamp = now.toISOString();",
							"/** API的nonce，建议使用13位时间毫秒数 + 4位随机数 */",
							"const nonce = `${now.getTime()}${String(",
							"    (Math.random() * 1000) << 0",
							").padStart(4, \"0\")}`;",
							"const signature = getSignature(",
							"    pm.request.method,",
							"    timestamp,",
							"    nonce,",
							"    pm.request.url.getPath(),",
							"    paramStr",
							");",
							"pm.request.headers.add(\"application/x-www-form-urlencoded\", \"Content-Type\")",
							"pm.request.headers.add(timestamp, 'X-Hmac-Auth-Timestamp')",
							"pm.request.headers.add('1.0', 'X-Hmac-Auth-Version')",
							"pm.request.headers.add(nonce, 'X-Hmac-Auth-Nonce')",
							"pm.request.headers.add(pm.environment.get('accessKey'), 'apiKey')",
							"pm.request.headers.add(signature, 'X-Hmac-Auth-Signature')",
							"pm.request.headers.add('127.0.0.1', 'X-Hmac-Auth-IP')",
							"pm.request.headers.add(getMacAddress(), 'X-Hmac-Auth-MAC')"
						],
						"type": "text/javascript"
					}
				}
			],
			"protocolProfileBehavior": {
				"disableBodyPruning": true
			},
			"request": {
				"method": "GET",
				"header": [],
				"body": {
					"mode": "urlencoded",
					"urlencoded": []
				},
				"url": {
					"raw": "{{domainName}}/gettoken.json?appkey={{accessKey}}&appsecret={{secretKey}}",
					"host": [
						"{{domainName}}"
					],
					"path": [
						"gettoken.json"
					],
					"query": [
						{
							"key": "appkey",
							"value": "{{accessKey}}",
							"description": "你的应用的access_key"
						},
						{
							"key": "appsecret",
							"value": "{{secretKey}}",
							"description": "你的应用的secret_key"
						}
					]
				}
			},
			"response": []
		},
		{
			"name": "getuserinfo_bycode",
			"event": [
				{
					"listen": "prerequest",
					"script": {
						"exec": [
							"require(\"crypto-js\");",
							"",
							"/**",
							" * 签名",
							" * @param {'GET'|'POST'} method 请求方式",
							" * @param {string} timestamp header中的时间戳",
							" * @param {string} nonce header中的nonce",
							" * @param {string} url 请求的地址",
							" * @param {string} params 请求参数",
							" * @returns {string} 签名字段",
							" */",
							"const getSignature = (method, timestamp, nonce, url, params) => {",
							"    /** 获取签名字符串的字节数组：请求Method+'\\n'+请求Header中的Timestamp+'\\n'+请求Header中的Nonce+'\\n'+请求的的URL(不带域名)+'\\n'+请求参数 */",
							"    const bytesToSign = `${method}\\n${timestamp}\\n${nonce}\\n${url}\\n${params}`;",
							"",
							"    // HmacSha256(SecretKey,签名字符串字节数组)",
							"    // const hmac = crypto.createHmac(\"sha256\", this.API_SECRET_KEY);",
							"    // hmac.update(bytesToSign);",
							"    // let Hmac = hmac.digest(\"bytes\");",
							"    var hash = CryptoJS.HmacSHA256(bytesToSign, pm.environment.get('secretKey'));",
							"    // 对第二步结果使用Base64，得到签名结果",
							"    // return Hmac.toString(\"base64\");",
							"    return CryptoJS.enc.Base64.stringify(hash);",
							"}",
							"",
							"/**",
							" * 获取mac地址",
							" * @returns {string} 随机的mac地址",
							" */",
							"const getMacAddress = () => {",
							"    return new Array(6)",
							"        .fill(0x100)",
							"        .map((v) => ((Math.random() * v) << 0).toString(16).padStart(2, \"0\"))",
							"        .join(\":\");",
							"}",
							"",
							"const paramStr = (() => {",
							"    let param = ''",
							"    if (pm.request.method === 'GET') {",
							"        param = pm.request.url.getQueryString()",
							"    } else {",
							"        param = pm.request.body.toString()",
							"    }",
							"",
							"    return param.replace(/{{(.*?)}}/g, (all, key) => {",
							"        return pm.environment.get(key)",
							"    })",
							"})()",
							"",
							"",
							"/** 当前时间 */",
							"const now = new Date();",
							"/** 请求发出时间，使用UTC时间，ISO8601格式为\"yyyy-MM-ddTHH:mm:ss.sss+08:00\" */",
							"const timestamp = now.toISOString();",
							"/** API的nonce，建议使用13位时间毫秒数 + 4位随机数 */",
							"const nonce = `${now.getTime()}${String(",
							"    (Math.random() * 1000) << 0",
							").padStart(4, \"0\")}`;",
							"const signature = getSignature(",
							"    pm.request.method,",
							"    timestamp,",
							"    nonce,",
							"    pm.request.url.getPath(),",
							"    paramStr",
							");",
							"pm.request.headers.add(\"application/x-www-form-urlencoded\", \"Content-Type\")",
							"pm.request.headers.add(timestamp, 'X-Hmac-Auth-Timestamp')",
							"pm.request.headers.add('1.0', 'X-Hmac-Auth-Version')",
							"pm.request.headers.add(nonce, 'X-Hmac-Auth-Nonce')",
							"pm.request.headers.add(pm.environment.get('accessKey'), 'apiKey')",
							"pm.request.headers.add(signature, 'X-Hmac-Auth-Signature')",
							"pm.request.headers.add('127.0.0.1', 'X-Hmac-Auth-IP')",
							"pm.request.headers.add(getMacAddress(), 'X-Hmac-Auth-MAC')"
						],
						"type": "text/javascript"
					}
				}
			],
			"request": {
				"method": "POST",
				"header": [],
				"body": {
					"mode": "urlencoded",
					"urlencoded": [
						{
							"key": "access_token",
							"value": "app_3a53ad3a447d446db514fc795b47572d",
							"type": "default"
						},
						{
							"key": "code",
							"value": "4fa4fdd047db4e5c9c06335c6e6a9a000c0f8f01",
							"type": "default"
						}
					]
				},
				"url": {
					"raw": "{{domainName}}/rpc/oauth2/getuserinfo_bycode.json",
					"host": [
						"{{domainName}}"
					],
					"path": [
						"rpc",
						"oauth2",
						"getuserinfo_bycode.json"
					]
				}
			},
			"response": []
		}
	]
}
```
其实就是在 “Pre-request Script”中，放入本sdk。如果在特定接口中，请自行修改

