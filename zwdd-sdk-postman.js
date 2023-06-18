require("crypto-js");

/**
 * 签名
 * @param {'GET'|'POST'} method 请求方式
 * @param {string} timestamp header中的时间戳
 * @param {string} nonce header中的nonce
 * @param {string} url 请求的地址
 * @param {string} params 请求参数
 * @returns {string} 签名字段
 */
const getSignature = (method, timestamp, nonce, url, params) => {
    /** 获取签名字符串的字节数组：请求Method+'\n'+请求Header中的Timestamp+'\n'+请求Header中的Nonce+'\n'+请求的的URL(不带域名)+'\n'+请求参数 */
    const bytesToSign = `${method}\n${timestamp}\n${nonce}\n${url}\n${params}`;

    // HmacSha256(SecretKey,签名字符串字节数组)
    // const hmac = crypto.createHmac("sha256", this.API_SECRET_KEY);
    // hmac.update(bytesToSign);
    // let Hmac = hmac.digest("bytes");
    var hash = CryptoJS.HmacSHA256(bytesToSign, pm.environment.get('secretKey'));
    // 对第二步结果使用Base64，得到签名结果
    // return Hmac.toString("base64");
    return CryptoJS.enc.Base64.stringify(hash);
}

/**
 * 获取mac地址
 * @returns {string} 随机的mac地址
 */
const getMacAddress = () => {
    return new Array(6)
        .fill(0x100)
        .map((v) => ((Math.random() * v) << 0).toString(16).padStart(2, "0"))
        .join(":");
}

const paramStr = (() => {
    let param = ''
    if (pm.request.method === 'GET') {
        param = pm.request.url.getQueryString()
    } else {
        param = pm.request.body.toString()
    }

    return param.replace(/{{(.*?)}}/g, (all, key) => {
        return pm.environment.get(key)
    })
})()


/** 当前时间 */
const now = new Date();
/** 请求发出时间，使用UTC时间，ISO8601格式为"yyyy-MM-ddTHH:mm:ss.sss+08:00" */
const timestamp = now.toISOString();
/** API的nonce，建议使用13位时间毫秒数 + 4位随机数 */
const nonce = `${now.getTime()}${String(
    (Math.random() * 1000) << 0
).padStart(4, "0")}`;
const signature = getSignature(
    pm.request.method,
    timestamp,
    nonce,
    pm.request.url.getPath(),
    paramStr
);
pm.request.headers.add("application/x-www-form-urlencoded", "Content-Type")
pm.request.headers.add(timestamp, 'X-Hmac-Auth-Timestamp')
pm.request.headers.add('1.0', 'X-Hmac-Auth-Version')
pm.request.headers.add(nonce, 'X-Hmac-Auth-Nonce')
pm.request.headers.add(pm.environment.get('accessKey'), 'apiKey')
pm.request.headers.add(signature, 'X-Hmac-Auth-Signature')
pm.request.headers.add('127.0.0.1', 'X-Hmac-Auth-IP')
pm.request.headers.add(getMacAddress(), 'X-Hmac-Auth-MAC')