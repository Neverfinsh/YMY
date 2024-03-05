/**
 * 
 * 重构页面脚本主要解决问题：
 * 
 *    怎么保证打开了正确应用，有可能网络问题，导致页面加载很慢，或者时在该页面弹出了其他页面或者广告
 *    优化them的页面
 * 
 */

"ui";

const { info } = require("__console__");


showLoalTask();
console.hide();
threads.start(setIntervalTask);

//        log info warn  error ，全局模式方案
var gloabModalType=false;


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
        <linear>
          <text w="150" h="50" textSize="16ps">读任务选择模式:</text>
            <switch  id="model_switch"   checked="false"  thumbTint="gray/orange-800" trackTint="light-gray/orange-200" marginEnd="16"></switch>
        </linear>
        <linear marginTop="30">                            
          <button id="local_start_task_btn" bg="#8acfaa" text="开始最新任务" marginLeft="35" h="38" />
          <button id="clearn_localstorage_btn" bg="#ffe63d" text="清除本地缓存" marginLeft="15" h="38" />
          <button id="stop_all_script_btn" bg="#ffe63d" text="停止脚本运行" marginLeft="15" h="38" />
        </linear>
        <linear marginTop="30">
          <button id="close_console_log_btn" bg="#8acfaa" text="关闭日志" marginLeft="35" h="38" />
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

  // 【选择模式】

  ui.model_switch.on("check", function(checked) {
    if (checked) {
        toast("开关已打开");
        gloabModalType=true;
    } else {
        toast("开关已关闭");
        gloabModalType=false;
    }
});


  // 【 开始最新任务 】 
  ui.local_start_task_btn.click(function () {

   
    var runningScripts = engines.all();
    console.error("当前运行的脚本个数",runningScripts.length);


    var currentScriptName = engines.myEngine().source.toString();   // 获取当前脚本的名称 
    var runningScripts = engines.all();
    var otherScripts = [];

      for (var i = 0; i < runningScripts.length; i++) {
        var scriptName = runningScripts[i].source.toString();
        if (scriptName == currentScriptName) {
            otherScripts.push(scriptName);
        }
      }

      if (otherScripts.length > 0) {
        for (var j = 0; j < runningScripts.length; j++) {
            if(j != runningScripts.length-1 ){ // 保留最后一个
               try {
                    var engine = runningScripts[j] ;
                    console.log('.....engine......',engine);
                     engine.forceStop(); 
                    toastLog("强制了关闭其中一个脚本");
               } catch (error) {
                     toastLog("强制了关闭其中一个脚本，出现错误");
               }
            }
        }

      } else {
        toastLog("当前没有其他脚本在执行");
      }

    
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
    // 打开日志窗口
    console.show();
    console.setSize(800,1000)
    console.setPosition(70, 100);

  });


  //  【停止脚本运行】
  ui.stop_all_script_btn.click(function () {
    toastLog("停止了脚本运行，并且清除日志缓存")
    console.clear();
    engines.stopAll();
  });


  // 【 清除本地缓存 】
  ui.clearn_localstorage_btn.click(function () {
    var LocalStorage = storages.create("device_storage");
    LocalStorage.remove("deviceInfo")
    toastLog("清除本地缓存成功")
    showLoalTask()
  });


    // 【 关闭日志 】
    ui.close_console_log_btn.click(function () {
      console.hide();
    });                                                                                                                                                                                                                                                       
}



// 【 定时任务执行 】
function setIntervalTask() {
  setInterval(executeMain, 1 * 20 * 1000)
}



function executeMain() {


 if (!console.isShowing()) {
     console.show();
     console.setPosition(70, 100);
 } 

  var runningScripts = engines.all();
  console.error("当前运行的脚本个数",runningScripts.length);

 if(runningScripts.length>1){
    console.error("-----------有多个脚本同时运行，已经关闭所有重复脚本，停止运行。脚本数:",runningScripts.length);
    engines.stopAll();
    return ;
 }


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
  if(!gloabModalType){
    toastLog("获取them数据")
    console.warn("................[获取them数据]..............",);
    var url = "http://101.201.33.155:8099/them/allThem";
  
  }else{
    toastLog("获取task数据")
    console.warn(".................[获取task数据].............",);
    var url = "http://101.201.33.155:8099/script/task/selectRecentTask";
  }


  var r = http.postJson(url, param);
  var result = r.body.string();
  let taskRes = JSON.parse(result)
  let content = JSON.parse(result);
  let resObj = content.res;

  if (resObj == null) {

    if(!gloabModalType){
      toastLog("当前没有可执行的[them]任务")
    }else{
      toastLog("当前没有可执行的[task]任务")
    }
    return;

  }
  let taskId = resObj.id


  let taskArr = taskRes.res;
  let them = taskArr.articleThem
  let pageSize = taskArr.articleNum

  console.warn("-----------脚本模式选择-------------",!gloabModalType);
  try {
    if(!gloabModalType){
      console.warn("................[执行them模式脚本]..............",);
      excuteThem(them, pageSize, 30000)
    }else{
      console.warn("................[执行Task模式脚本]..............",);
      excuteTask(them)
    }

  } catch (error) {
    if(!gloabModalType){
      console.error("................[执行them模式脚本]..............",error);
      toastLog("[   执行 【them 模式】 脚本发生了异常情    ]")
    }else{
      console.error("................[执行Task模式脚本]..............",error);
      toastLog("[   执行【task 模式】 脚本发生了异常情    ]")
    }
    return;
  }




  if(!gloabModalType){
      console.warn("................[执行them模式脚本回调]..............",);
      var url2 = `http://101.201.33.155:8099/them/updateThemStatus/${taskId}`;
  }else{
      console.warn("................[执行Task模式脚本回调]..............",);
      var url2 = `http://101.201.33.155:8099/script/task/delTask/${taskId}`;
  }

  console.info('.....[   开始回调接口    ]........');
  var updateStatusRes = http.postJson(url2);

  let contentCallBack = JSON.parse(updateStatusRes.body.string());
  console.log('.....callBackRes........', contentCallBack);
  if(contentCallBack.code===1){
    console.info('.....[   更新状态成功    ]........');
  }

}







function excuteThem(seriesTitle, counter, gap) {
  try {
    for (let pages = 0; pages < Number(counter); pages++) {

      console.info('..... [ 清除后台所有应用 ] ........');
      clearApp()

      console.info('..... [  打开今日头条 ] ........');
      launchApp("今日头条");
       sleep(20000);


      if(text("取消").depth(5).exists()){
        console.warn('..... [  界面出现了有未成的编辑的提示词 ] ........');
        let unfinish_page_obj= text("取消").depth(5).findOne(1000);
        unfinish_page_obj.click()
      }

 

      console.info('..... [  点击 [我的]  ] ........');
      sleep(3000);
      click("我的");
    

      sleep(3000);
      if(!text("创作中心").depth(22).exists()){
        console.error('..... [ 打开 [我的] 页面失败 ] ........');
        continue ;
      }
   


      console.info('..... [  点击 [去发文]  ] ........');
      sleep(4000);
      if (className("android.widget.TextView").desc("去发文").exists()) {
        click("去发文");
      } else {
        className("android.widget.ImageView").desc("发布").find().forEach(function (item, value) {
          item.click()
        });
      }

      
      sleep(4000);
      if(!text("图片智能配文").depth(20).exists()){
        console.error('..... [ 打开 [去发文] 页面失败 ] ........');
        continue ;
      }


      sleep(4000);
      let richTitle = setTitleRich(seriesTitle);
      console.info(".... [ 获取chatGPT的标题  ]  ......", richTitle);
      if (richTitle.indexOf("Something went wrong") !== -1) {
        console.error("ChatGPT 优化标题获取失败")
        continue;
      }



      // 重新打开，看是否回到页面
      console.info("-------[ 获取标题 重新切换回打开了【今日头条】]--------")
      launchApp("今日头条");
      //  从chatGPT 获取数据


      sleep(4000);
      let content;
      content = getContentChatGPT(seriesTitle)
      const firstTwoChars = content.substring(0, 2);
      if (firstTwoChars==="根据"){
          firstTwoChars="";
      }
      content=firstTwoChars + content.substring(2)
     // content = getContentChatGPT(richTitle)

      console.info("-------[获取内容  重新切换回打开了【今日头条】]--------")
      if (content.indexOf("Something went wrong") !== -1) {
        console.error("ChatGPT 内容获取获取失败")
        continue;
      }
      if (content.indexOf("抱歉") !== -1) {
          console.error("ChatGPT 内容获取获取失败")
          continue;
      }

      // 跳出大循环
      if (content === "Something went wrong, please try again later.") {
        console.log("........没有获取到ChatGPT的内容........");
        continue;
      }
      // 找到对应的控件消息
      console.info("....获取到chatGPT的内容......", content);

      // 出问题了
      let count = 0
      while (count < 60) {
        count++;
        if (content == "false") {
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

      console.info("开始打开相册，选择相册")
      sleep(5000);
      let open_pic_btn_cmp = desc('相册').depth(20).findOne(1000);
      open_pic_btn_cmp.click();

      console.info("------- [ 开始打开相册，选择相册,滑动相册 ] --------")
      sleep(4000);

      // 设置滑动起始点和终点的坐标

      var num = (Math.random() * 0.99 + 0.01).toFixed(2);
      console.log("--------[随机数生成]--------" + num);
      let y2 = num
      swipe(device.width / 2, device.height * 0.2, device.width / 2, y2, 1000);


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
      console.info("------- [ 选择图片,开始点击确认 ] --------")
      className('Button').find().forEach(function (value, index) {
        let d = value.desc();
        if (d.includes("完成")) {
          value.click();
        }
      })



    
      console.info("------- [  推荐语 ] --------")
      sleep(4000)
      className('android.widget.FrameLayout').depth(20).find().forEach(function (value, index) {
        sleep(500)
        value.click();
        sleep(500)
      })





      console.info("------- [  添加地址 ] --------")
      sleep(6000);
      className('android.widget.Button').depth(20).find().forEach(function (currentItem, index) {
        if (currentItem.desc() == "添加位置，让更多人看到" || currentItem.desc() == "添加位置") {
          currentItem.click();
          sleep(2000);
          className('android.widget.RelativeLayout').depth(10).find().forEach(function (currentItem, index) {
            if (index == 2) {
                currentItem.click();;
            }else{
                currentItem.click();;
            }
          })
        }
      })


      console.info("------- [ 在此 推荐语 ] --------")
      sleep(4000)
      className('android.widget.FrameLayout').depth(20).find().forEach(function (value, index) {
        sleep(500)
        value.click();
        sleep(500)
      })


      if(seriesTitle.length<19){
        console.info("------- [  添加标题 ] --------")
        sleep(3000)
        className('android.widget.Button').depth(20).find().forEach(function (currentItem, index) {
          if (currentItem.desc() == "添加标题") {
            currentItem.click();
            // 进入地址选择页面
            sleep(1000);
            className('android.widget.EditText').depth(19).find().forEach(function (Item, index) {
              if (Item.text() == "填写标题会有更多赞哦（选填）") {
                Item.setText(richTitle ? richTitle : seriesTitle + "(" + pages + ")");
              }
            })
          }
        })
      }


      //选择完图片后，进行发布
      console.info("-------  点击 [  发布 ]  按钮[发布中...]--------")
      text("发布").depth(12).findOne().click();

      
      console.info("-------  [准备开始下个话题]---------------------")
      sleep(Number(5000))


    }
  } catch (error) {
      throw("异常信息"+error)
  }
}






function excuteTask(seriesTitle) {
  try {

      console.info('..... [ 清除后台所有应用 ] ........');
      clearApp()

      console.info('..... [  打开今日头条 ] ........');
      launchApp("今日头条");

      sleep(20000);


      if(text("取消").depth(5).exists()){
        console.warn('..... [  界面出现了有未成的编辑的提示词 ] ........');
        let unfinish_page_obj= text("取消").depth(5).findOne(1000);
        unfinish_page_obj.click()
      }

      console.info('..... [  点击 [我的]  ] ........');
      sleep(3000);
      click("我的");


      // TODO: 没有正确打开页面
      var currentPackage1 = currentPackage();
      var currentPackage4 = currentActivity();


      if(currentPackage1 !== "com.ss.android.article.news"){
        console.error('..... [ 点击 [我的] 页面失败 ] ........');
       }

       
       // TODO: 有时候会出现去了其他页面
      console.info('..... [  点击 [去发文]  ] ........');
      sleep(4000);
      if (className("android.widget.TextView").desc("去发文").exists()) {
        click("去发文");
      } else {
        className("android.widget.ImageView").desc("发布").find().forEach(function (item, value) {
          item.click()
        });

      }

  
      sleep(4000);
      let content;
      content = getContentChatGPTWithTask(seriesTitle)
     // content = getContentChatGPT(richTitle)

      console.info("-------[获取内容  重新切换回打开了【今日头条】]--------")
      if (content.indexOf("Something went wrong") !== -1) {
        console.error("ChatGPT 内容获取获取失败")
        throw("ChatGPT 内容获取获取失败")
      }

      if (content === "Something went wrong, please try again later.") {
         console.log("........没有获取到ChatGPT的内容........");
         throw("没有获取到ChatGPT的内容")
      }
      if (content.indexOf("抱歉我无法满足你的要求") !== -1) {
          console.error("ChatGPT 内容获取获取失败")
          throw("ChatGPT 内容获取获取失败")
      }
      
      console.info("....获取到chatGPT的内容......", content);
     
       // 出问题了
      let count = 0
      while (count < 60) {
        count++;
        if (content == "false") {
          console.log("....等待获取chatGPT的内容......", count);
          sleep(2000);
          break;        // 跳出循环
        }
        if (content == undefined) {
          console.log("....等待获取chatGPT的内容......", count);
          sleep(2000);
        } else {
          // 给发布文章填入值
          let inputCmpObj = className('EditText').depth(19).findOne(1000);
          inputCmpObj.click();
          sleep(5000);
          inputCmpObj.setText(content);
          break;
        }
      }

      console.warn(".....................开始打开相册，选择相册.....................")
      sleep(5000);
      let open_pic_btn_cmp = desc('相册').depth(20).findOne(1000);
      open_pic_btn_cmp.click();

      console.warn("------- [ 开始打开相册，选择相册,滑动相册 ] --------")
      sleep(4000);
      let num = Math.random().toFixed(1);
      console.log("--------[随机数生成]--------" + num);
      let y2 = num
      swipe(device.width / 2, device.height * 0.8, device.width / 2, y2, 1000);


      // 选中照片
      sleep(2000);
      var randomInts = [];
      while (randomInts.length < 1) {
        var randomInt = Math.floor(Math.random() *35) + 1;
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
      console.warn("------- [ 选择图片,开始点击确认 ] --------")
      className('Button').find().forEach(function (value, index) {
        let d = value.desc();
        if (d.includes("完成")) {
          value.click();
        }
      })


      console.info("------- [  推荐语 ] --------")
      sleep(4000)
      className('android.widget.FrameLayout').depth(20).find().forEach(function (value, index) {
        sleep(500);
        value.click();
        sleep(500);
      })


      console.info("------- [  添加地址 ] --------")
      sleep(6000);
      className('android.widget.Button').depth(20).find().forEach(function (currentItem, index) {
        if (currentItem.desc() == "添加位置，让更多人看到" || currentItem.desc() == "添加位置") {
          currentItem.click();
          sleep(5000);
          className('android.widget.RelativeLayout').depth(10).find().forEach(function (currentItem, index) {
            sleep(5000);
            if (index == 2) {
                  currentItem.click();;
              }
              // else{
              //     currentItem.click();;
              // }
          })
        }
      })


      console.info("------- [  再次推荐语 ] --------")
      sleep(4000)
      className('android.widget.FrameLayout').depth(20).find().forEach(function (value, index) {
        sleep(500);
        value.click();
        sleep(500);
      })


      //选择完图片后，进行发布
      console.info("------- [  发布中 ] --------")
      text("发布").depth(12).findOne().click();

  } catch (error) {
      throw("异常信息"+error)
  }
}




function getContentChatGPT(title) {
  var content = "";
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
  searchBox.setText("以"+ title +"为标题写一篇300字的短文，要求内容吸引人眼球，正能量,不要带有正文和标题的字样,开头换一行,并且空2格")


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

function getContentChatGPTWithTask(title) {

  console.info('..... [  打开浏览器访问网址 ] ........');

  var content = "";
  // 打开页面
  app.startActivity({
    action: "android.intent.action.VIEW",
    data: "https://chat18.aichatos.xyz/"
  });

  // 等待浏览器加载完成
  sleep(1000 * 6);

  // 查找搜索框并输入关键字
  console.info('..... [  访问浏览器访问网址 ] ........');
  var searchBox = className("android.widget.EditText").depth(28).findOne();
  searchBox.click();
  sleep(1000);
  searchBox.setText( title)


  sleep(1000);
  console.info('..... [  访问网址，填入问题, 点击发送 ] ........');
  className("android.widget.Button").find().forEach(function (value, index) {
    if (value.depth() == 25) {
      if (value.indexInParent() == 3) {
        value.click()
      }
    }
  })

  // 查找搜索结果列表并输出内容 ， // --> 小心一瞬间的操作
  sleep(3000) 
  let arr = []
  let counter = 0;
  console.log("....获取chatGPT的内容.....开始时间:....", formateDateUtil());
  while (counter < 60) {
    counter++;
    if (!text('Stop Responding').depth(28).exists()) {
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
    if (textStartsWith("Stop Responding").depth(28).exists()) {
      console.log("加载中.......", counter);
      sleep(3000)
    }

    // 发生错误了
    if (textStartsWith("Something went wrong").depth(28).exists()) {
      return "false";
    }
    // 提示词有问题
    // if (textStartsWith("抱歉").depth(28).exists() || textStartsWith(" 你好！有什么我可以帮助您的吗").depth(28).exists()) {
    //    return "false";
    // }

    // 超时
    if (counter > 60) {
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
  app.startActivity({
    action: "android.intent.action.VIEW",
    data: "https://chat18.aichatos.xyz/"
  });



  sleep(1000 * 6);
  var searchBox = className("android.widget.EditText").depth(28).findOne();
  searchBox.click();
  sleep(1000);



  searchBox.setText("把" + title + "这个标题润色一下,使得标题更加吸引人眼球，更加具体创新力，不超过14个字，要求标题不要带有双引号,不要带有:")


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
    if (!text('Stop Responding').depth(28).exists()) {
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
    // 还在加载中...
    if (textStartsWith("Stop Responding").depth(28).exists()) {
      console.log("加载中.......", counter);
      sleep(3000)
    }

    // 发生错误了
    if (textStartsWith("Something went wrong").depth(28).exists()) {
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
  recents();
  sleep(3000);

  let _clear_box = id("clearbox").depth(7).findOne(); 66
  let _clear_box_bounds = _clear_box.bounds()
  var x = _clear_box_bounds.centerX();
  var y = _clear_box_bounds.centerY();
  click(x, y)
  sleep(4000);


}

