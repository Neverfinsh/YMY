/**
 * 
 * 重构页面脚本主要解决问题：
 * 
 *    怎么保证打开了正确应用，有可能网络问题，导致页面加载很慢，或者时在该页面弹出了其他页面或者广告
 *    优化them的页面
 * 
 */

"ui";

const { info, error } = require("__console__");

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

        <linear marginTop="30">                            
          <button id="local_start_task_btn"      bg="#8acfaa" text="发布文章" marginLeft="35" h="38" />
          <button id="clearn_localstorage_btn"   bg="#ffe63d" text="清除本地缓存" marginLeft="15" h="38" />
          <button id="stop_all_script_btn"       bg="#ffe63d" text="停止脚本运行" marginLeft="15" h="38" />
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






  // 【 发布文章 】 
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


/*************************************  [执行主程序] ******************************************************/
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

  var url = `http://101.201.33.155:8099/article/script/execute/findOneArticle/${deviceId}`;

  var r = http.get(url);
  var result = r.body.string();
  let taskRes = JSON.parse(result)
  let content = JSON.parse(result);
  let resObj = content.res;


  if (resObj == null) {
    toastLog(`当前没有可发布的【文章】,设备编号:${deviceInfo.deviceId}`)
    return;
  }

  sleep(4000)

  let articleId = resObj.id
  let taskArr = taskRes.res;
  let titleArticle = taskArr.articleTitle
  let contentArticle = taskArr.articleContent

  console.warn(".........【 开始发送发布文章内容 】.............");
  try {
    const flag= excuteArticle(titleArticle,contentArticle);
    if(!flag){
      console.error("执行发送文章的脚本出现错误,无法执行回调")
      return;
   }
 
  } catch (error) {
    console.error(".........【 发布文章内容失败！】原因:",error);
    return;
  }


  //【   更新回调   】
  sleep(2000)
  console.info('.....[   开始回调接口    ]........');
  var url2 = `http://101.201.33.155:8099/article/script/execute/updateArticle/${articleId}`;
  var updateStatusRes = http.postJson(url2);

  let contentCallBack = JSON.parse(updateStatusRes.body.string());
  console.log('......[   回调接口返回值    ]..........', contentCallBack);
  
  if(contentCallBack.code===1){
    console.info('.....[   更新状态成功    ]........');
  }

}





/*************************************  [执行脚本] ******************************************************/

function excuteArticle(title, content) {

      console.info('..... [ 清除后台所有应用 ] ........');
      clearApp()

      sleep(8000);
      console.info('..... [  打开今日头条 ] ........');
      launchApp("今日头条");


      console.info('..... [  打开首页 ] ........');
      sleep(3000);
      click("首页");


    sleep(8000);
     if(className("android.widget.Button").text("取消").exists()){
        console.warn('..... [  界面出现了有未成的编辑的提示词 ] ........');
        let unfinish_page_obj= text("取消").depth(5).findOne(1000);
        unfinish_page_obj.click()
      }


      if(text("升级版本").depth(6).exists()){
        console.warn('..... [  界面出现了软件升级提示词 ] ........');
        let unfinish_page_obj= desc("关闭").depth(6).findOne(1000);
        unfinish_page_obj.click()
      }

 

      console.info('..... [  点击 [我的]  ] ........');
      sleep(3000);
      click("我的");
    

      sleep(3000);
      if(!text("创作中心").depth(22).exists()){
        console.error('..... [ 打开 [我的] 页面失败 ] ........');
        return;
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
        throw(" ..... [ 打开 [去发文] 页面失败 ] ........")
      }



      
      // 找到对应的控件消息
      console.info("....把内容写入编辑区......");
      sleep(4000);
      let inputCmpObj = className('EditText').depth(19).findOne(1000);
      inputCmpObj.click();
      sleep(5000);
      inputCmpObj.setText(content);


      console.info("开始打开相册，选择相册")
      sleep(5000);
      let open_pic_btn_cmp = desc('相册').depth(20).findOne(1000);
      open_pic_btn_cmp.click();

      console.info("------- [ 开始打开相册，选择相册,滑动相册 ] --------")
      sleep(4000);

      // 设置滑动起始点和终点的坐标

      //let num = Math.random().toFixed(1);
      var num = (Math.random() * 0.99 + 0.01).toFixed(2);
      console.log("--------[随机数生成]--------" + num);
      let y2 = num
      sleep(3000);
      swipe(device.width / 2, device.height * y2, device.width / 2, y2, 1000);
      // sleep(1000);
      // swipe(device.width / 2, device.height * 0.8, device.width / 2, y2, 1000);
      // 选中照片
      sleep(2000);
      var randomInts = [];
      while (randomInts.length < 1) {
        var randomInt = Math.floor(Math.random() * 30) + 1;
        if (randomInts.indexOf(randomInt) === -1) {
            randomInts.push(randomInt);
        }
      }


      let destionArr=[]
      const flag=false
      desc('未选中').depth(15).find().forEach(function (value, index) {
        destionArr.push(index)
        if (randomInts.includes(index)) {
            value.click();
            flag=true;
        }
      });

      console.log('.....destionArr......',destionArr);
      console.log('.....randomInts......',randomInts);


      // if(!flag){
      //   const randomNumber = Math.floor(Math.random() * 30);
      //   console.log(randomNumber);
      //   desc('未选中').depth(15).find().forEach(function (value, index) {
      //     if (randomNumber===index) {
      //         value.click();
      //     }
      //   });
      // }




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


      // 添加位置
      console.info("------- [  添加地址 ] --------")
      sleep(6000);
      const addressObj=desc("添加位置").className('android.widget.Button').depth(20).findOne(1000);
      addressObj.click();



      sleep(2000);

      console.info("------- [  添加地址，选择位置参数 ] --------")  
    
      let add_address_counter=0

      while(add_address_counter<30){
        
         add_address_counter++;
        
         let add_adress_list_obj_arr=[]

         add_adress_list_obj_arr=className('android.widget.RelativeLayout').depth(10).find();
         console.info("------- [  选择添加地址参数列表数组大小： ] --------",add_adress_list_obj_arr.length)
    

         // 验证值是否大于7的时候。
         console.info("------- [  开始选择添加地址,次数: ] --------",add_address_counter)
         if(add_adress_list_obj_arr.length > 1){
             var randomIndex = Math.floor(Math.random() * 7);
             console.info("------- [  选择添加地址参数： ] --------",randomIndex)
             className('android.widget.RelativeLayout').depth(10).find().forEach(function (currentItem, index) {
                if (index == randomIndex) {
                    currentItem.click();
                }
             })
             break;
        }
        // 休息2秒
        sleep(2000)
      }
      

      // 如果超过30个选择默认
      if(add_address_counter>=30){
      console.info("------- [  添加默认地址参数 ] --------")  
      className('android.widget.RelativeLayout').depth(10).find().forEach(function (currentItem, index) {
        currentItem.click();;
      })
      }

      // className('android.widget.RelativeLayout').depth(10).find().forEach(function (currentItem, index) {
      //   if (index == randomIndex) {
      //        currentItem.click();;
      //   }
      // })




      console.info("------- [ 再次 推荐语 ] --------")
      sleep(4000)
      className('android.widget.FrameLayout').depth(20).find().forEach(function (value, index) {
        sleep(500)
        value.click();
        sleep(500)
      })


      if(title.length<19){
        console.info("------- [  添加标题 ] --------")
        sleep(3000)
        className('android.widget.Button').depth(20).find().forEach(function (currentItem, index) {
          if (currentItem.desc() == "添加标题") {
            currentItem.click();
            // 进入地址选择页面
            sleep(1000);
            className('android.widget.EditText').depth(19).find().forEach(function (Item, index) {
              if (Item.text() == "填写标题会有更多赞哦（选填）") {
                Item.setText(title);
              }
            })
          }
        })
      }else{
        console.error("....【 标题超过了19个字 】.....",title);
      }


      //选择完图片后，进行发布
      console.info("-------  点击 [  发布 ]  按钮[发布中...]--------")
     // text("发布").depth(14).findOne().click();
      text("发布").findOne().click();

      // console.info("-------  [准备开始下篇文章]---------------------")

      return true;
}


function clearApp() {
  recents();
  sleep(3000);





  if(desc("关闭所有最近打开的应用").depth(6).exists()){
    let _clear_box =  desc("关闭所有最近打开的应用").depth(6).findOne(1000)
    _clear_box.click();
  }else{
      let _clear_box = id("clearbox").depth(7).findOne(); 
      let _clear_box_bounds = _clear_box.bounds()
      var x = _clear_box_bounds.centerX();
      var y = _clear_box_bounds.centerY();
      click(x,y);
  }

  sleep(4000);
}

