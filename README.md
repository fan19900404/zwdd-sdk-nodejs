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
