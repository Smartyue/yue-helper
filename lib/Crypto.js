/**
 * Created by yuanjianxin on 2018/4/9.
 */
const crypto=require('crypto')
module.exports={

    /**
     * 对称加密
     * @param secretKey 私钥
     * @param content 加密内容
     * @param method 算法
     * @param inEncode 传入数据格式
     * @param outEncode 返回数据格式
     * @returns {string}
     */
    symmetryEncrypt(secretKey,content,method='aes192',inEncode='utf8',outEncode='hex'){
        let res='';
        let cipher=crypto.createCipher(method,secretKey);
        res+=cipher.update(Buffer.from(content),inEncode,outEncode);
        res+=cipher.final(outEncode);
        return res;
    },


    /**
     * 对称解密
     * @param secretKey
     * @param content
     * @param method
     * @param inEncode
     * @param outEncode
     * @returns {string}
     */
    symmetryDecrypt(secretKey,content,method='aes192',inEncode='hex',outEncode='utf8'){
        let res='';
        let decipher=crypto.createDecipher(method,secretKey);
        res+=decipher.update(content,inEncode,outEncode);
        res+=decipher.final(outEncode);
        return res;
    },


    /**
     * 非对称加密
     * @param publicKey  公钥
     * @param content 需要加密的内容
     * @returns {string} 加密结果
     */
    asymmetricEncrypt(publicKey,content){
        return crypto.publicEncrypt(publicKey,Buffer.from(content)).toString('base64');
    },


    /**
     * 非对称解密
     * @param privateKey 私钥
     * @param content 需要解密的内容
     * @returns {string} 解密结果
     */
    asymmetricDecrypt(privateKey,content){
        let res=crypto.privateDecrypt(privateKey,Buffer.from(content,'base64'));
        return res.toString();
    },
}