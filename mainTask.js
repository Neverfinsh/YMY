/**
 *  当条数据去读取: 没有循环
 * 
 * 
 *  2024年1/23  (第二版本)
 *  此版本是简化板: 直接发文章内容，不用优化标题。
 * 
 */

"ui";
// ui 
showLoalTask();
// 启动定时器
threads.start(setInterval(executeMain, 1 * 20 * 1000) );

threads.start(setIntervalTask);


//  UI 界面
function showLoalTask() {
    ui.layout(
        <frame>
            <vertical h="auto" marginTop="20">
                <linear>
                    <text w="70" h="50" textSize="16ps">用户编号:</text>
                    <input id="user_id_input" h="40" w="300" textSize="16ps" />
                </linear>
                <linear>
                    <text w="70" h="50" textSize="16ps">设备编号:</text>
                    <input id="device_id_input" h="40" w="300" textSize="16ps" />
                </linear>
                <linear marginTop="30">
                    <button id="local_start_task_btn" bg="#8acfaa" text="开始最新任务" marginLeft="40" h="38" />
                    <button id="clearn_localstorage_btn" bg="#ffe63d" text="清除本地缓存" marginLeft="40" h="38" />
                    <button id="stop_all_script_btn" bg="#ffe63d" text="停止脚本运行" marginLeft="10" h="38" />
                </linear>
            </vertical>
        </frame>
    );

    // 【初始化】
    var LocalStorage = storages.create("device_storage");
    let deviceInfo = LocalStorage.get("deviceInfo")

    if (deviceInfo != null) {
        ui.user_id_input.setText(deviceInfo.userId);
        ui.device_id_input.setText(deviceInfo.deviceId);
    }

    //  【停止脚本运行】
    ui.stop_all_script_btn.click(function () {
        engines.stopAll();
    });

    // 【 开始最新任务 】 
    ui.local_start_task_btn.click(function () {
        toastLog("开始执行任务")
        let userId = ui.user_id_input.getText();
        let deviceId = ui.device_id_input.getText();
        // TODO: 获取不到值！！
        if (userId.length === 0 || deviceId.length === 0) {
            toastLog("请输入用户编号或者设备编号");
            return;
        } else {
            let param = {}
            param['userId'] = userId
            param['deviceId'] = deviceId
            LocalStorage.put("deviceInfo", param);
        }
    });


    // 【 清除本地缓存 】
    ui.clearn_localstorage_btn.click(function () {
        var LocalStorage = storages.create("device_storage");
        LocalStorage.remove("deviceInfo")
        toastLog("清除本地缓存成功")
        showLoalTask()
});
}


// 【 定时任务执行 】
function setIntervalTask() {
    setInterval(executeMain, 1 * 20 * 1000)
  }

  
// 获取脚本执行前的值
function executeMain() {

    toastLog("开始执行执行定时任务")
    var LocalStorage = storages.create("device_storage");
    let deviceInfo = LocalStorage.get("deviceInfo");
    console.log('..... [deviceInfo]........', deviceInfo);
    if (deviceInfo === undefined) {
        toastLog("请填写用户编号和设备编号！！")
        return;
    }
    let deviceId = deviceInfo.deviceId;
    console.log('..... [deviceId]........', deviceId);
    if (deviceId === undefined || deviceId === "" || deviceId === null) {
        toastLog("请填写设备编号！！")
        return;
    }

    let userId = deviceInfo.userId;
    console.log('..... [userIdId]........', userId);
    if (userId === undefined || userId === "" || userId === null) {
        toastLog("请填写用户编号！！")
        return;
    }

    let param = deviceInfo;
    var url = "http://101.201.33.155:8099/script/task/selectRecentTask";
    var r = http.postJson(url, param);
    var result = r.body.string();
    let taskRes = JSON.parse(result)
    // TODO: 判断是否有任务
    let content = JSON.parse(result);
    let resObj = content.res;
    // TODO: 悬浮任务框

    if (resObj == null) {
        toastLog("当前没有可执行的任务")
        return;
    }
    let taskId = resObj.id
    toastLog("当前任务Id:", taskId)
    let taskArr = taskRes.res;
    let them = taskArr.articleThem
    let pageSize = taskArr.articleNum
    try {
        main(them, pageSize, 5000)
    } catch (error) {
        toastLog("执行脚本发生了异常情况，重新执行任务")
        return;
    }

    console.log('.....[开始执行回调]......',);
    var url2 = `http://101.201.33.155:8099/script/task/delTask/${taskId}`;
    var updateStatusRes = http.postJson(url2);
    console.log('.....callback........', updateStatusRes);

}

// 主脚本
function main(seriesTitle, counter, gap) {
    clearApp()
    launchApp("今日头条");
    sleep(4000);

    // TODO:  添加判断对未保存的，没有到正确的页面，记得跳正确的页面。 有可能进入未编辑的的页面，删除。// 有未完成编辑的内容
    if (className("android.widget.Button").text("取消").depth(5).exists()) {
        click("取消");
    }

    sleep(4000);
    console.log('.......[点击我的]......');
    click("我的");


    // 点击去发文
    sleep(4000);
    if (className("android.widget.ImageView").desc("发布").exists()) {
        click("去发文");
    }

    // className("android.widget.ImageView").desc("发布").find().forEach(function(item,value){
    //   item.click()
    //  });


    //  从chatGPT 获取数据
    sleep(4000);
    let content;
    content = getContentChatGPT(seriesTitle)
    console.log("....获取chatGPT的内容......", content);
    // 跳出大循环
    if (content === "Something went wrong, please try again later.") {
        console.log("........没有获取到ChatGPT的内容........");
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
    console.log('.......[打开相册]......');
    sleep(5000);
    let open_pic_btn_cmp = desc('相册').depth(20).findOne(1000);


    // 打开相册
    open_pic_btn_cmp.click();


    //   模拟滑动操作(随机睡眠时间)
    //   可以调整device.height * 0.8和device.height * 0.2来改变滑动的起始位置和结束位置，以及调整最后一个参数来改变滑动的速度。
    /**
            * 模拟一次从(x1, y1)到(x2, y2)的时间为duration毫秒的滑动。
            * @param x1 滑动起点横坐标
            * @param y1 滑动起点纵坐标
            * @param x2 滑动终点横坐标
            * @param y2 滑动终点纵坐标
            * @param duration 滑动时长，单位毫秒，默认值为300
            * @param id 多点触摸id，可选，默认为1
            **/
    sleep(4000);
    let num = Math.random().toFixed(1);
    console.log("--------[随机数生成]--------" + num);
    let y2 = num
    //  swipe(device.width / 2, device.height * 0.8, device.width / 2, device.height * 0.2, 1000);  
    swipe(device.width / 2, device.height * 0.8, device.width / 2, y2, 1000);

    // 选中照片
    console.log('.......【   选中相册   】......');
    sleep(2000);
    var randomInts = [];
    while (randomInts.length < 1) {
        var randomInt = random(2, 40)
        if (randomInts.indexOf(randomInt) === -1) {
            randomInts.push(randomInt);
        }
    }

    console.log('......randomInts.......', randomInts);

    desc('未选中').depth(15).find().forEach(function (value, index) {
        console.log('>>>>>>【index】>>>>>>>>>', index);
        if (randomInts.includes(index)) {
            value.click();
        }
    });


    // 点击确认
    console.log('.......【选中相册...】......');
    sleep(1500);
    toastLog("开始点击确认");
    className('Button').find().forEach(function (value, index) {
        let d = value.desc();
        if (d.includes("完成")) {
            value.click();
        }
    })



    //  写一个while循环然后跳出。 推荐语
    console.log('.......【选推荐语】......');
    sleep(9000)
    className('android.widget.FrameLayout').depth(20).find().forEach(function (value, index) {
        value.click();
        sleep(2000)
    })



    // //  添加地址
    // console.log('.......【添加地址】......');
    // sleep(5000);
    // className('android.widget.Button').depth(20).find().forEach(function (currentItem, index) {
    //     if (currentItem.desc() == "添加位置，让更多人看到" || currentItem.desc() == "添加位置") {
    //         currentItem.click();
    //         // 进入地址选择页面
    //         sleep(3000);
    //         // 少了存在的 TODO:  有时候会加载不出来。判断处理
    //             className('android.widget.RelativeLayout').depth(10).find().forEach(function (currentItem, index) {
    //                 if (index == 2) {
    //                     currentItem.click();;
    //                 }
    //             })
    //     }
    // })




    // // //获取标题  desc('添加标题')
    // // sleep(3000)
    // // className('android.widget.Button').depth(20).find().forEach(function (currentItem, index) {
    // //     if (currentItem.desc() == "添加标题") {
    // //         currentItem.click();
    // //         // 进入地址选择页面
    // //         sleep(1000);
    // //         className('android.widget.EditText').depth(19).find().forEach(function (Item, index) {
    // //             if (Item.text() == "填写标题会有更多赞哦（选填）") {
    // //                 Item.setText(richTitle ? richTitle : seriesTitle + "(" + pages + ")");
    // //             }
    // //         })
    // //     }
    // // })



    //选择完图片后，进行发布
    sleep(3000)
    console.log('.......【点击发布】......');
    text("发布").depth(12).findOne().click();

}

// 获取内容
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
    // searchBox.setText("围绕着" + title + "这个标题写一篇300字的短文，要求内容吸引人眼球，正能量,不要带有正文和标题的字样,开头换一行,并且空2格")
    searchBox.setText(title)


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


    console.log("............................");

    // 双击退出
    doubleExistApp()

    if (content === "") {
        return "false"
    } else {
        return content
    }
}

// 格式化内容日期输出
function formateDateUtil() {

    let now = new Date();              // 获取当前的日期和时间

    let year = now.getFullYear();       // 获取当前的年份
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

// 双击退出
function doubleExistApp() {
    back()
    sleep(1000)
    back()
    sleep(1000)
    back()
}

//  清内存
function clearApp() {
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

