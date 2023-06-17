export = ExecutableClient;
/**
 * @typedef Opt 客户端的配置项
 * @property {string} accessKey 你的应用的access_key
 * @property {string} secretKey 你的应用的secret_key
 * @property {string} domainName API请求域名
 * @property {string=} ipaddress 本机ip地址
 */
declare class ExecutableClient {
    /**
     * 请求方法
     * @param {Opt} opt 配置项
     * @returns
     */
    constructor(opt: Opt);
    /** API_KEY：你的应用的access_key */
    API_KEY: string;
    /** 你的应用的secret_key */
    API_SECRET_KEY: string;
    /** API请求域名 */
    API_SERVER: string;
    /** 本机ip地址 */
    ipaddress: string;
    /** API版本，默认1.0 */
    API_VERSION: string;
    get fetch(): (url: string, params?: Record<string, any>, method?: 'GET' | 'POST') => Promise<any>;
    /**
     * 签名
     * @param {'GET'|'POST'} method 请求方式
     * @param {string} timestamp header中的时间戳
     * @param {string} nonce header中的nonce
     * @param {string} url 请求的地址
     * @param {string} params 请求参数
     * @returns {string} 签名字段
     */
    signature(method: 'GET' | 'POST', timestamp: string, nonce: string, url: string, params: string): string;
    /**
     * 获取mac地址
     * @returns {string} 随机的mac地址
     */
    getMacAddress(): string;
}
declare namespace ExecutableClient {
    export { Opt };
}
/**
 * 客户端的配置项
 */
type Opt = {
    /**
     * 你的应用的access_key
     */
    accessKey: string;
    /**
     * 你的应用的secret_key
     */
    secretKey: string;
    /**
     * API请求域名
     */
    domainName: string;
    /**
     * 本机ip地址
     */
    ipaddress?: string | undefined;
};
