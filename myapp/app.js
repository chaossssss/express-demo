const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const md5 = require('js-md5');
var log = require('console-emoji')
var colorconsole = require('@kenworks/colorconsole')
const Alphabet = require('alphabetjs')
const app = express();
const port = 3000;

// app.use(bodyParser);
// app.use(express.urlencoded())
// axios.defaults.baseURL = 'https://isz-open.sz.gov.cn/smtapp';
axios.defaults.baseURL = 'http://sakula.mynatapp.cc';

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  req.header('Content-Type', 'application/json;charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', 'http://192.168.169.161:8080');
  next();
});

function makeRandomSeries() {
  let t = '';
  for (let i = 0; i < 10; i += 1) {
    t += Math.floor(Math.random() * 10);
  }
  if (t.startsWith('0')) {
    t.replace('0', '1');
  }
  return t;
}

// const appId = 'ef0c96959eb545b9a6e557a8880bb001';
const appId = 'cb5f71d6b5d44c7f9d97e10fe4920d75';
// const appKey = '32b8496e46d745479c07752ce473cb3f';
const appKey = '652734cbeb2d45ae8c2f9e6c2ac8cefb';
const timestamp = +new Date();
const randomSeries = makeRandomSeries();

function makeCipherText() {
  return md5(`appId${appId}appKey${appKey}randomSeries${randomSeries}timestamp${timestamp}`);
}

const cipherText = makeCipherText();

app.get('/getInitCode', async (req, res) => {
  try {
    // const response = await axios.post('/openPlatform/initCode/getInitCode.do', {
    const response = await axios.post('/initCode', {
      appId, // 第三方服务在开放平台申请的 appId
      timestamp, // 时间戳（长度为为 10 位或 13 位的时间戳）
      randomSeries, // 随机序列（长度为 10 位的数字序列）
      cipherText, // 密文
    });
    res.send(response.data);
  } catch (error) {
    res.send({ code: error.response.status, msg: error.response.data });
  }
});

// app.get('/getAuthCode', async (req, res) => {
//   try {
//     // const response = await axios.post('/openPlatform/authCode/getAuthCode.do', {
//     const response = await axios.post('/getAuthCode', {
//       appId, // 第三方服务在开放平台申请的 appId
//       timestamp, // 时间戳（长度为为 10 位或 13 位的时间戳）
//       randomSeries, // 随机序列（长度为 10 位的数字序列）
//       cipherText, // 密文
//     });
//     res.send(response.data);
//   } catch (error) {
//     console.error({ error });
//     return error;
//   }
// })

// app.get('/getAccessToken', async (req, res) => {
//   console.log(req)
//   // let jsonQuery = JSON.parse(req)
//   try {
//     // const response = await axios.post('/openPlatform/authCode/getAuthCode.do', {
//       // res.send("dfsfaf")
//     const response = await axios.post('/getAccessToken', {
//       appId, // 第三方服务在开放平台申请的 appId
//       authCode: req.authCode,
//     });
//     res.send(response.data);
//   } catch (error) {
//     console.error({ error });
//     return error;
//   }
// })

async function getAuthCode() {
  try {
    // const response = await axios.post('/openPlatform/authCode/getAuthCode.do', {
    const response = await axios.post('/getAuthCode', {
      appId, // 第三方服务在开放平台申请的 appId
      timestamp, // 时间戳（长度为为 10 位或 13 位的时间戳）
      randomSeries, // 随机序列（长度为 10 位的数字序列）
      cipherText, // 密文
    });
    return response.data;
  } catch (error) {
    console.error({ error });
    return error;
  }
}

async function getAccessToken(authCode) {
  try {
    // const response = await axios.post('/openPlatform/accessToken/getAccessToken.do', {
    // const response = await axios.post(`/getAccessToken?authCode=${authCode}`);
    const response = await axios.post(`/getAccessToken`,{},{params:{
      authCode,
      appId
    }});
    return response.data;
  } catch (error) {
    console.error({ error });
    return error;
  }
}

async function refreshAccessToken(refreshToken) {
  try {
    // const response = await axios.post('/openPlatform/accessToken/refreshAccessToken.do', {
    const response = await axios.post('/refreshAccessToken', {},{params:{
      refreshToken,
      appId
    }});
    return response.data;
  } catch (error) {
    console.error({ error });
    return error;
  }
}

async function checkAccessToken(accessToken) {
  try {
    const response = await axios.post('/checkAccessToken',{},{params:{
      accessToken,
      appId
    }});
    return response.data;
  } catch (error) {
    console.error({ error });
    return error;
  }
}

async function checkRequestCode(requestCode,accessToken) {
  try {
    const response = await axios.post('/checkRequestCode',{},{params:{
      appId, // 第三方服务在开放平台申请的 appId
      requestCode: requestCode, // Native 在开放平台申请的 requestCode
      accessToken: accessToken, // 从开放平台获取的应用级别的访问令牌
    }});
    return response.data;
  } catch (error) {
    console.error({ error });
    return error;
  }
}

async function getUserInfo(userAccessToken) {
  try {
    const response = await axios.post('/getUserInfo',{},{params:{
      userAccessToken
    }});
    return response.data;
  } catch (error) {
    console.error({ error });
    return error;
  }
}

app.post('/getUserInfo', async (req, res) => {
  try {
    var str="",requestCode = '';
    req.on("data",function(chunk){
      str+=chunk
    })
    req.on("end",async function(){
      // console.log(str)
      requestCode = JSON.parse(str).requestCode
      console.log("requestCode",requestCode)
      const authData = await getAuthCode();
      let accessData = await getAccessToken(authData.data.authCode);

      // res.send(authData)
      // res.send(accessData)
      const isVerify = await checkAccessToken(accessData.data.accessToken);
      // console.log("isVerify",isVerify)
      // res.send(isVerify)
      if (!isVerify.data.verifyResult) {
        // 判断访问令牌是否过期，如果过期，则刷新访问令牌
        accessData = await refreshAccessToken(accessData.data.refreshToken);
      }
      // res.send(req.requestCode)
      // const response = await axios.post('/checkRequestCode',{}, {
      //   params: {
      //     appId, // 第三方服务在开放平台申请的 appId
      //     requestCode: requestCode, // Native 在开放平台申请的 requestCode
      //     accessToken: accessData.data.accessToken, // 从开放平台获取的应用级别的访问令牌
      //   }
      // });
  
  
      const response = await checkRequestCode(requestCode, accessData.data.accessToken)
      // res.send(response)
      // console.log("res",response)
      // res.send(response)

      const info = await getUserInfo(response.data.userAccessToken)
      res.send(info)
      // const info = await axios.post('/getUserInfo', {
      //   userAccessToken: response.data.userAccessToken,
      // });
      // res.send(info.data);
    })
  } catch (error) {
    res.send({ msg: "失败" });
  }
});

app.post('/getCorporateUserInfo', async (req, res) => {
  try {
    const authData = await getAuthCode();
    let accessData = await getAccessToken(authData.code);
    const isVerify = await checkAccessToken(accessData.accessToken);
    if (!isVerify) {
      // 判断访问令牌是否过期，如果过期，则刷新访问令牌
      accessData = await refreshAccessToken(accessData.refreshToken);
    }
    const response = await axios.post('/openPlatform/corporate/checkCorporateRequestCode.do', {
      appId, // 第三方服务在开放平台申请的 appId
      requestCode: req.requestCode, // Native 在开放平台申请的 requestCode
      accessToken: accessData.accessToken, // 从开放平台获取的应用级别的访问令牌
    });
    const info = await axios.post('/openPlatform/corporate/getCorporateUserInfo.do', {
      userAccessToken: response.data.userAccessToken,
    });
    res.send(info.data);
  } catch (error) {
    res.send({ code: error.response.status, msg: error.response.data });
  }
});

app.post('/report', async (req, res) => {
  try {
    const response = await axios.post('/openPlatform/record/notify.do', req.body);
    res.send(response.data);
  } catch (error) {
    res.send({ code: error.response.status, msg: error.response.data });
  }
});

app.post('/sendMessage', async (req, res) => {
  try {
    const response = await axios.post('/openPlatform/message/sendMessage.do', req.body);
    res.send(response.data);
  } catch (error) {
    res.send({ code: error.response.status, msg: error.response.data });
  }
});

app.get('/', (req, res) => res.send('Hello World'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
  const str = Alphabet('success','stereo')
  log(str,'ok')
  colorconsole.log('hello world!', 'blue', null, 'blink')
});
