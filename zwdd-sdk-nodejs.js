const crypto = require("crypto");

/**
 * json对象转url参数字符串
 * @param {Record<string,any>} data 参数对象
 */
const JSON2URLParams = (data = {}) => {
  var params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    params.set(key, value);
  });

  return params.toString();
};

/**
 * @typedef Opt 客户端的配置项
 * @property {string} accessKey 你的应用的access_key
 * @property {string} secretKey 你的应用的secret_key
 * @property {string} domainName API请求域名
 * @property {string=} ipaddress 本机ip地址
 */

class ExecutableClient {
  /**
   * 请求方法
   * @param {Opt} opt 配置项
   * @returns
   */
  constructor(opt) {
    this.API_KEY = opt.accessKey;
    this.API_SECRET_KEY = opt.secretKey;
    this.API_SERVER = opt.domainName;
    this.ipaddress = opt.ipaddress ?? this.ipaddress;
  }

  /** API_KEY：你的应用的access_key */
  API_KEY = "";
  /** 你的应用的secret_key */
  API_SECRET_KEY = "";

  /** API版本，默认1.0 */
  API_VERSION = "1.0";
  /** API请求域名 */
  API_SERVER = "";

  /** 本机ip地址 */
  ipaddress = "127.0.0.1";

  get fetch() {
    /**
     * 分装后的请求方法
     * @param {string} url 请求的名称
     * @param {Record<string,any>} params 请求参数对象
     * @param {'GET'|'POST'} method 请求类型
     */
    return async (url, params = {}, method = "GET") => {
      /** 当前时间 */
      const now = new Date();
      /** 请求发出时间，使用UTC时间，ISO8601格式为"yyyy-MM-ddTHH:mm:ss.sss+08:00" */
      const timestamp = now.toISOString();
      /** API的nonce，建议使用13位时间毫秒数 + 4位随机数 */
      const nonce = `${now.getTime()}${String(
        (Math.random() * 1000) << 0
      ).padStart(4, "0")}`;
      const self = this;
      const paramStr = JSON2URLParams(params);
      /** 完整的请求地址 */
      const addrUrl = (() => {
        const myURL = this.API_SERVER + url;
        if (method === "GET") {
          return `${myURL}?${paramStr}`;
        }
        return myURL;
      })();
      const signature = this.signature(method, timestamp, nonce, url, paramStr);
      const response = await fetch(addrUrl, {
        method: method,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Hmac-Auth-Timestamp": timestamp,
          "X-Hmac-Auth-Version": self.API_VERSION,
          "X-Hmac-Auth-Nonce": nonce,
          apiKey: self.API_KEY,
          "X-Hmac-Auth-Signature": signature,
          "X-Hmac-Auth-IP": self.ipaddress,
          "X-Hmac-Auth-MAC": self.getMacAddress(),
        },
        body: method === "POST" ? paramStr : undefined,
      });
      return response.json();
    };
  }

  /**
   * 签名
   * @param {'GET'|'POST'} method 请求方式
   * @param {string} timestamp header中的时间戳
   * @param {string} nonce header中的nonce
   * @param {string} url 请求的地址
   * @param {string} params 请求参数
   * @returns {string} 签名字段
   */
  signature(method, timestamp, nonce, url, params) {
    /** 获取签名字符串的字节数组：请求Method+'\n'+请求Header中的Timestamp+'\n'+请求Header中的Nonce+'\n'+请求的的URL(不带域名)+'\n'+请求参数 */
    const bytesToSign = `${method}\n${timestamp}\n${nonce}\n${url}\n${params}`;

    // HmacSha256(SecretKey,签名字符串字节数组)
    const hmac = crypto.createHmac("sha256", this.API_SECRET_KEY);
    hmac.update(bytesToSign);
    let Hmac = hmac.digest("bytes");
    // 对第二步结果使用Base64，得到签名结果
    return Hmac.toString("base64");
  }

  /** 
   * 获取mac地址
   * @returns {string} 随机的mac地址
   */
  getMacAddress() {
    return new Array(6)
      .fill(0x100)
      .map((v) => ((Math.random() * v) << 0).toString(16).padStart(2, "0"))
      .join(":");
  }
}

module.exports = ExecutableClient;
