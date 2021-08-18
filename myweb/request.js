// const baseUrl = 'http://localhost:3000' // 服务器地址
// const baseUrl = 'http://sakula.mynatapp.cc' // 服务器地址
const baseUrl = 'http://192.168.169.161:3000' // 服务器地址
// const baseUrl = 'http://192.168.169.161:8080' // 服务器地址

const fetchInitCode = async () => {
    return await fetch(`${baseUrl}/getInitCode`,{
        mode: 'cors',
        // method: 'post',
        // body: JSON.stringify({ requestCode: 32132 })
    }).then(response => {
        return response.json()
    }).then(data => {
        console.log(data)
        return data.data.initCode
    }).catch(err => {
        console.error({ err })
    })
}
const fetchUserInfo = async(requestCode) => {
    console.log("requestCode",requestCode)
    return await fetch(`${baseUrl}/getUserInfo`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json;charset=utf-8;'
        },
        body: JSON.stringify({ requestCode: requestCode })
    }).then(response => {
        return response.json()
    })
}
// const fetchAuthCode = async() => {
//     return await fetch(`${baseUrl}/getAuthCode`).then(response => {
//         console.log("response",response)
//         return response.json()
//     }).then(data => {
//         console.log("getAuthCode",data)
//         return data.data.authCode
//     }).catch(err => {
//         console.error({ err })
//     })
// }

// const fetchAuthToken = async(authCode) => {
//     return await fetch(`${baseUrl}/getAccessToken`,{
//         method: 'post',
//         headers: {
//             'content-type': 'application/json'
//         },
//         body: JSON.stringify({
//             authCode: 'f0ff9c0fa16c43bb81a74773c0f044e8'
//         })
//     })
//     .then(response => {
//         console.log("response",response)
//         // return response.json()
//     })
//     .then(data => {
//         console.log(data)
//         return data
//     }).catch(err => {
//         console.error({ err })
//     })
// }