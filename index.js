"ui";
 showLoalTask();
 threads.start(setIntervalTask);


function showLoalTask() {
    ui.layout(
        <frame>
            <vertical h="auto" marginTop="20">
                <linear>
                    <text w="70" h="50" textSize="16ps">用户编号:</text>
                    <input id="user_id_input" h="40"  w="300"  textSize="16ps"  />
                </linear>
                <linear>
                    <text w="70" h="50" textSize="16ps">设备编号:</text>
                    <input id="device_id_input" h="40" w="300"  textSize="16ps"  />
                </linear>
                <linear  marginTop="30">
                    <button id="local_start_task_btn"    bg="#8acfaa"     text="开始最新任务"     marginLeft="40" h="38" />
                    <button id="local_show_task_btn"     bg="#8acfaa"     text="展示最新任务"     marginLeft="10" h="38" />
                    <button id="show_localstorage_btn"   bg="#8acfaa"     text="展示本地缓存"     marginLeft="10" h="38" />
                
                </linear>
                <linear  marginTop="30">
                    <button id="clearn_localstorage_btn" bg="#ffe63d"     text="清除本地缓存" marginLeft="40" h="38" />
                    <button id="stop_all_script_btn"     bg="#ffe63d" text="停止脚本运行" marginLeft="10" h="38" />
                    <button id="stop_all_script_btn"     bg="#ffe63d" text="暂没想好" marginLeft="10" h="38" />
                </linear>
            </vertical>
        </frame>
    );
   
    // 【初始化】
    var  LocalStorage = storages.create("device_storage");
    let  deviceInfo= LocalStorage.get("deviceInfo")
    if(deviceInfo != null ){
        ui.user_id_input.setText(deviceInfo.userId);
        ui.device_id_input.setText(deviceInfo.deviceId);
    }
 

    //  【停止脚本运行】
     ui.stop_all_script_btn.click(function(){
        engines.stopAll();
    });


    //【 展示本地缓存】 TODO: 可以考虑删除掉
    ui.show_localstorage_btn.click(function(){
        var  LocalStorage = storages.create("device_storage");
        let  deviceInfo= LocalStorage.get("deviceInfo")
        toastLog("=========本地缓存====",deviceInfo)
    });


    // 【 开始最新任务 】 
    ui.local_start_task_btn.click(function () {
        toastLog("开始执行任务")
        let   userId = ui.user_id_input.getText();
        let deviceId = ui.device_id_input.getText();
        // TODO: 获取不到值！！
        if (userId.length === 0 || deviceId.length === 0) {
            toastLog("请输入用户编号或者设备编号");
            return;
        }else{
            let param = {}
            param['userId'] = userId
            param['deviceId'] = deviceId
            LocalStorage.put("deviceInfo",param);
        }
    });


    // 【   展示最新任务  】   TODO: 可以考虑删除
    ui.local_show_task_btn.click(function () {
        let userId = null
        userId = ui.user_id_input.getText();
        let deviceId = ui.device_id_input.getText();

        console.log('......登录事件.......userId', userId);
        console.log('......登录事件.......deviceId', deviceId);
        // TODO: 获取不到值！！
        if (userId.length === 0 || deviceId.length === 0) {
            toastLog("请输入用户编号或者设备编号");
            return;
        }
        //  定时执行的方法
        let param = {}
            param['userId'] = userId
            param['deviceId'] = deviceId

        LocalStorage.put("deviceInfo",param)
        
    });
}


   // 【 清除本地缓存 】
   ui.clearn_localstorage_btn.click(function(){
    var  LocalStorage = storages.create("device_storage");
         LocalStorage.remove("deviceInfo")
     toastLog("清除本地缓存成功")

     showLoalTask()
   });


  // 【 定时任务执行 】
function setIntervalTask() { setInterval(executeMain,  1 * 20 * 1000)}


function executeMain(){

    toastLog("开始执行执行定时任务")
    var  LocalStorage = storages.create("device_storage");
    let  deviceInfo = LocalStorage.get("deviceInfo");
    console.log('..... [deviceInfo]........',deviceInfo);
    if(deviceInfo === undefined){
       toastLog("请填写用户编号和设备编号！！")
       return ;
    }
   let deviceId=deviceInfo.deviceId ;
   console.log('..... [deviceId]........',deviceId);
   if(deviceId === undefined || deviceId ==="" || deviceId ===null ){
    toastLog("请填写设备编号！！")
    return ;
   }

   let userId=deviceInfo.userId ;
   console.log('..... [userIdId]........',userId);
   if(userId === undefined || userId ==="" || userId ===null ){
    toastLog("请填写用户编号！！")
    return ;
   }

   let param=deviceInfo;
   var url = "http://101.201.33.155:8099/script/allThem";
   var r = http.postJson(url, param);
   var result = r.body.string();
   let taskRes = JSON.parse(result)
    // TODO: 判断是否有任务
   let content = JSON.parse(result);
   let resObj=content.res;
   // TODO: 悬浮任务框

   //floatText(taskRes)

   if(resObj == null){
       toastLog("当前没有可执行的任务")
       return;
    }
    let taskId=resObj.id
    toastLog("当前任务Id:",taskId)
    // 执行主脚本
    let   taskArr=taskRes.res;
    let   them= taskArr.articleThem
    let   pageSize= taskArr.articleNum
    
    // TODO:  执行脚本测试
    try {
        main(them, pageSize, 5000)
    } catch (error) {
        // TODO: 显示发生了异常情况,封装一个展示内容的悬浮框
        toastLog("执行脚本发生了异常情况，重新执行任务")
        main(them, pageSize, 5000)
        return;
    }

    console.log('.....[开始执行回调]......',);
    var url2 =`http://101.201.33.155:8099/script/updateThemStatus/${taskId}`;
    var updateStatusRes = http.postJson(url2);
    console.log('.....callback........', updateStatusRes);

}




//  关闭悬浮框
function closeFloat(){
    window.close();
}

// 开启悬浮框
function floatText(showContent) {

    var window = floaty.window(
        <frame >
            <linear marginTop="250" >
                <text id="text" textSize="16sp" textColor="red" />
            </linear>
        </frame>
    );
    
    window.exitOnClose();
    
    setInterval(() => {
        ui.run(function () {
            window.text.setText(JSON.stringify(showContent, null, 2));
        });
    }, 1000);

    window.text.click(() => {
        window.setAdjustEnabled(!window.isAdjustEnabled());
    });

}


function main(seriesTitle, counter, gap) {
    
    console.log('.....[开始执行主程序脚本]......',seriesTitle,counter);

    for (let pages = 0; pages < Number(counter); pages++) {
        //调用清除后台所有应用的方法
        clearApp()
        // 打开今日头条
        launchApp("今日头条");
        // TODO:  添加判断对未保存的，没有到正确的页面，记得跳正确的页面。
        // 有可能进入未编辑的的页面，删除。
        // 进入我的页面
        sleep(4000);
        click("我的");
        // 点击去发文
        sleep(4000);
        if (className("android.widget.ImageView").desc("发布").exists()) {
            click("去发文");
        }
        // className("android.widget.ImageView").desc("发布").find().forEach(function(item,value){
        //   item.click()
        //  });
        sleep(4000);
        let richTitle = setTitleRich(seriesTitle);
        console.log("....获取chatGPT的标题......", richTitle);

        //  从chatGPT 获取数据
        sleep(4000);
        let content;
        content = getContentChatGPT(richTitle)
        console.log("....获取chatGPT的内容......", content);
        // 跳出大循环
        if (content === "Something went wrong, please try again later.") {
            console.log("........没有获取到ChatGPT的内容........");
            continue;
        }
        // 找到对应的控件消息
        toastLog("开始获取发布文章内容");
        let count = 0
        while (count < 60) {
            count++;
            if (content == "false") {   // 出问题了
                console.log("....等待获取chatGPT的内容......", count);
                sleep(2000);
                break; // 跳出循环
            }
            if (content == undefined) {
                console.log("....等待获取chatGPT的内容......", count);
                sleep(2000);
            } else {
                let inputCmpObj = className('EditText').depth(19).findOne(1000);
                inputCmpObj.click();
                sleep(5000);
                inputCmpObj.setText(content);
                break;
            }
        }


        // 点击相册
        sleep(5000);
        let open_pic_btn_cmp = desc('相册').depth(20).findOne(1000);

        // 打开相册
        open_pic_btn_cmp.click();

        // 选中照片
        sleep(2000);
        var randomInts = [];
        while (randomInts.length < 1) {
            var randomInt = Math.floor(Math.random() * 30) + 1;
            if (randomInts.indexOf(randomInt) === -1) {
                randomInts.push(randomInt);
            }
        }

        desc('未选中').depth(15).find().forEach(function (value, index) {
            if (randomInts.includes(index)) {
                value.click();
            }
        });

        sleep(1500);
        toastLog("开始点击确认");
        className('Button').find().forEach(function (value, index) {
            let d = value.desc();
            if (d.includes("完成")) {
                value.click();
            }
        })


        sleep(5000)
        //  写一个while循环然后跳出。 推荐语
        className('android.widget.FrameLayout').depth(20).find().forEach(function (value, index) {
            value.click();
        })

        //  添加地址
        sleep(5000);
        className('android.widget.Button').depth(20).find().forEach(function (currentItem, index) {
            if (currentItem.desc() == "添加位置，让更多人看到" || currentItem.desc() == "添加位置") {
                currentItem.click();
                // 进入地址选择页面
                sleep(3000);

                className('android.widget.RelativeLayout').depth(10).find().forEach(function (currentItem, index) {
                    if (index == 2) {
                        currentItem.click();;
                    }
                })
            }
        })


        // 把标题润色一下


        //获取标题  desc('添加标题')
        // sleep(3000)
        // className('android.widget.Button').depth(20).find().forEach(function (currentItem, index) {
        //     if (currentItem.desc() == "添加标题") {
        //         currentItem.click();
        //         // 进入地址选择页面
        //         sleep(1000);
        //         className('android.widget.EditText').depth(19).find().forEach(function (Item, index) {
        //             if (Item.text() == "填写标题会有更多赞哦（选填）") {
        //                 Item.setText(richTitle ? richTitle : seriesTitle + "(" + pages + ")");
        //             }
        //         })
        //     }
        // })

        //发布
        // text("预览").depth(12).findOne(1000).click();

        //选择完图片后，进行发布
        text("发布").depth(12).findOne().click();
        sleep(Number(gap))
    }
}


function getContentChatGPT(title) {

    var content = "";
    // 打开页面
    app.startActivity({
        action: "android.intent.action.VIEW",
        data: "https://chat18.aichatos.xyz/"
    });

    // 等待浏览器加载完成
    sleep(1000 * 6);

    // 查找搜索框并输入关键字
    var searchBox = className("android.widget.EditText").depth(28).findOne();
    // console.log("=====searchBox====",searchBox);
    searchBox.click();
    sleep(1000);
    searchBox.setText("围绕着" + title + "这个标题写一篇300字的短文，要求内容吸引人眼球，正能量,不要带有正文和标题的字样,开头换一行,并且空2格")


    // // 点击搜索按钮并等待结果页面加载完成className('Button')
    sleep(1000);

    className("android.widget.Button").find().forEach(function (value, index) {
        if (value.depth() == 25) {
            if (value.indexInParent() == 3) {
                value.click()
            }
        }
    })

    // 查找搜索结果列表并输出内容
    sleep(3000) // --> 小心一瞬间的操作
    let arr = []
    let counter = 0;
    console.log("....获取chatGPT的内容.....开始时间:....", formateDateUtil());
    while (counter < 60) {
        counter++;
        //console.log("9999999999999",!text('Stop Responding').depth(28).exists());
        if (!text('Stop Responding').depth(28).exists()) {
            //  获取加载的值 【Stop Responding】  加载完是不会出现
            className("android.widget.TextView").depth(29).find().forEach(function (currentItem, index) {
                let itemContent = currentItem.text();
                arr.push(itemContent)
            });
            // 处理结果
            for (let i = 4; i < arr.length; i++) {
                content += arr[i];
            }
            // 加载完
            break;
        }
        // 还在加载中...、
        //console.log("33333",textStartsWith("Stop Responding").depth(28).exists());
        if (textStartsWith("Stop Responding").depth(28).exists()) {
            console.log("加载中.......", counter);
            sleep(3000)
        }

        // 发生错误了
        if (textStartsWith("Something went wrong").depth(28).exists()) {
            //console.log(222);
            return "false";
        }
        // 提示词有问题
        // if (textStartsWith("抱歉").depth(28).exists() || textStartsWith(" 你好！有什么我可以帮助您的吗").depth(28).exists()) {
        //    return "false";
        // }

        // 超时
        if (counter > 60) {
            //console.log(333);
            return "false";
        }
    }

    console.log("....获取chatGPT的内容......结束时间:....", formateDateUtil());


    // 双击退出
    doubleExistApp()

    if (content === "") {
        return "false"
    } else {
        return content
    }
}


function setTitleRich(title) {

    var content = "";
    // 打开页面
    app.startActivity({
        action: "android.intent.action.VIEW",
        data: "https://chat18.aichatos.xyz/"
    });

    // 等待浏览器加载完成
    sleep(1000 * 6);

    // 查找搜索框并输入关键字
    var searchBox = className("android.widget.EditText").depth(28).findOne();
    // console.log("=====searchBox====",searchBox);
    searchBox.click();
    sleep(1000);
    searchBox.setText("把" + title + "这个标题润色一下,使得标题更加吸引人眼球，更加具体创新力，不超过15个字，要求标题带有双引号,不要带有冒号")


    // // 点击搜索按钮并等待结果页面加载完成className('Button')
    sleep(1000);

    className("android.widget.Button").find().forEach(function (value, index) {
        if (value.depth() == 25) {
            if (value.indexInParent() == 3) {
                value.click()
            }
        }
    })

    // 查找搜索结果列表并输出内容
    sleep(3000) // --> 小心一瞬间的操作
    let arr = []
    let counter = 0;
    console.log("....获取chatGPT的标题.....开始时间:....", formateDateUtil());
    while (counter < 60) {
        counter++;
        //console.log("9999999999999",!text('Stop Responding').depth(28).exists());
        if (!text('Stop Responding').depth(28).exists()) {
            //  获取加载的值 【Stop Responding】  加载完是不会出现
            className("android.widget.TextView").depth(29).find().forEach(function (currentItem, index) {
                let itemContent = currentItem.text();
                arr.push(itemContent)
            });
            // 处理结果
            for (let i = 4; i < arr.length; i++) {
                content += arr[i];
            }
            // 加载完
            break;
        }
        // 还在加载中...、
        //console.log("33333",textStartsWith("Stop Responding").depth(28).exists());
        if (textStartsWith("Stop Responding").depth(28).exists()) {
            console.log("加载中.......", counter);
            sleep(3000)
        }

        // 发生错误了
        if (textStartsWith("Something went wrong").depth(28).exists()) {
            //console.log(222);
            return "false";
        }
        // 提示词有问题
        // if (textStartsWith("抱歉").depth(28).exists() || textStartsWith(" 你好！有什么我可以帮助您的吗").depth(28).exists()) {
        //    return "false";
        // }

        // 超时
        if (counter > 60) {
            //console.log(333);
            return "false";
        }
    }

    console.log("....获取chatGPT的标题......结束时间:....", formateDateUtil());


    console.log("............................");

    // 双击退出
    doubleExistApp()

    if (content === "") {
        return "false"
    } else {
        return content
    }
}


function formateDateUtil() {

    let now = new Date(); // 获取当前的日期和时间

    let year = now.getFullYear(); // 获取当前的年份
    let month = now.getMonth() + 1; // 获取当前的月份（注意月份是从 0 开始计算的，所以需要加 1）
    let day = now.getDate(); // 获取当前的日期
    let hour = now.getHours(); // 获取当前的小时
    let minute = now.getMinutes(); // 获取当前的分钟
    let second = now.getSeconds(); // 获取当前的秒钟

    let formattedDateTime = year + "-" + addZeroPadding(month) + "-" + addZeroPadding(day) + " " +
        addZeroPadding(hour) + ":" + addZeroPadding(minute) + ":" + addZeroPadding(second);

    // 在个位数前添加零补齐
    function addZeroPadding(num) {
        return num < 10 ? "0" + num : num;
    }
    return formattedDateTime
}

function doubleExistApp() {

    back()
    sleep(1000)
    back()
    sleep(1000)
    back()
}


function clearApp() {

    //调用清除后台所有应用的方法

    console.log('..... 执行【clearApp】【开始】........');

    recents();

    sleep(3000);

    let _clear_box = id("clearbox").depth(7).findOne(); 66
    let _clear_box_bounds = _clear_box.bounds()
    var x = _clear_box_bounds.centerX();
    var y = _clear_box_bounds.centerY();
    click(x, y)
    sleep(4000);

    sleep(4000);

    console.log('..... 执行【clearApp】【结束】........');
}

