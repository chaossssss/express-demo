window.onload = async () => {
    // 进入页面首先调起用户授权
    // 授权接口需要初始化才能调用，所以要先进行JSSDK的初始化
    // JSSDK初始化需要传入initCode，所以我们先获取initCode
    const initCode = await fetchInitCode()

    const appId = 'cb5f71d6b5d44c7f9d97e10fe4920d75'


    console.log(initCode)
    if (!initCode) return
    sc.config({
        debug: false,   // 是否开启调试模式,调用的所有 api 的返回值会在客户端 alert 出来
        appId,  // 在统一 APP 开放平台服务器申请的 appId
        initCode,
        nativeApis: ['userAuth']
    })
    /*
    config 信息验证后会执行 ready 方法，所有需初始化接口调用都必须在 config 接口获得结果之后，config 是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在 ready 函数中调用来确保正确执行。
    这里我们把授权接口放到sc.ready函数中执行
    */
   sc.ready(() => {

       sc.userAuth({ appId },async (res) => {
           /*
            sc.userAuth会首先判断用户是否登录，若没有登录，则会主动调起登录窗口，无需在此调用 isLogin 和 login 接口
            */
           if (res.code === 0) {
            //    用户同意授权
            const requestCode = res.data.requestCode
            fetchUserInfo(requestCode).then(info => {
                console.log("33333333333", info )
                // 你自己的业务逻辑
            })
            // console.log("requestCode",requestCode)
            // authCode
            // const authCode = await fetchAuthCode()
            // console.log("authCode",authCode)
            // fetchAuthToken(authCode)
            // fetchUserInfo(requestCode)
           } else {
            /*
            用户拒绝授权或其它失败情况
            code: -1 默认失败
            code: -10001    没有初始化JSSDK
            code: -10002    用户点击拒绝授权
            code: -10003    用户未登录
            */
               console.warning(res.message)
           }
       })
   })
   sc.error((res) => {
       console.error({ res })
   })
}

// 下面的事件由于用户点击才会触发，所以可以不用放在window.onload函数里
const tel = document.getElementById('tel')
const phoneBtn = document.getElementById('phoneCall')
const infoBtn = document.getElementById('getDeviceInfo')
const backBtn = document.getElementById('onBack')

phoneBtn.addEventListener('click', () => {
	const telNum = tel.value
	if (!telNum) {
		console.warn('请输入手机号')
		return
	}
	sc.phoneCall(telNum, (res) => {
		if (res.code !== 0) {
			console.error(res.message)
		}
	})
})

infoBtn.addEventListener('click', () => {
	sc.getDeviceInfo((res) => {
		if (res.code === 0) {
			// 获取成功
			// 你的逻辑
			console.log(res.data)
		} else {
			// 获取失败
			// 你的逻辑
		}
	})
})

backBtn.addEventListener('click', () => {
	sc.onBack({ closeBtn: true }, () => {
		console.log('返回按钮被点击了')
		// 由于重写了返回按钮的处理逻辑，所以这里需手动调用返回
		sc.goBack()
	})
})
