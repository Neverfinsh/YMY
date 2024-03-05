"ui";

showLoalTask();
console.hide();
threads.start(setIntervalTask);

//log info warn  error ，全局模式方案
var gloabModalType = false;


function showLoalTask() {

  ui.layout(
    <frame>
      <vertical h="auto" marginTop="20">
        <linear marginLeft="35" marginTop="35">
          <text w="150" h="50" textSize="16ps" >是否自动模式:</text>
          <switch id="model_switch" checked="false" thumbTint="gray/orange-800" trackTint="light-gray/orange-200" marginEnd="16"></switch>
        </linear>
        <linear marginTop="30">
          <button id="them_to_article_btn" bg="#8acfaa" text="执行话题" marginLeft="35" h="38" />
          <button id="clearn_localstorage_btn" bg="#ffe63d" text="清除本地缓存" marginLeft="15" h="38" />
          <button id="stop_all_script_btn" bg="#ffe63d" text="停止脚本运行" marginLeft="15" h="38" />
        </linear>
        <linear marginTop="30">
          <button id="close_console_log_btn" bg="#8acfaa" text="关闭日志" marginLeft="35" h="38" />
        </linear>
      </vertical>
    </frame>
  );


  // 【 生成文章 】

  ui.them_to_article_btn.click(function () {

    var runningScripts = engines.all();
    console.error("当前运行的脚本个数", runningScripts.length);


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
        if (j != runningScripts.length - 1) { // 保留最后一个
          try {
            var engine = runningScripts[j];
            console.log('.....engine......', engine);
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

    // 打开日志窗口
    console.show();
    console.setSize(800, 1000)
    console.setPosition(70, 100);

  });



  // 【选择模式】
  ui.model_switch.on("check", function (checked) {
    if (checked) {
      toast("开关已打开");
      gloabModalType = true;
    } else {
      toast("开关已关闭");
      gloabModalType = false;
    }
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
  setInterval(executeMain, 60 * 1000)
}


// 【 ........................................ 【主程序】.......................................... 】

function executeMain() {
  if (!console.isShowing()) {
    console.show();
    console.setPosition(70, 100);
  }

  var runningScripts = engines.all();
  console.error("当前运行的脚本个数", runningScripts.length);

  if (runningScripts.length > 1) {
    console.error("-----------有多个脚本同时运行，已经关闭所有重复脚本，停止运行。脚本数:", runningScripts.length);
    engines.stopAll();
    return;
  }



  var url = "http://101.201.33.155:8099/topicKey/script/findTopicOne";
  var r = http.get(url);
  var result = r.body.string();
  let taskRes = JSON.parse(result)
  let resObj = taskRes.res;

  if (resObj === null) {
    toastLog("当前没有需要转化的 【TopicKey】")
    console.error('.....[ 当前没有可执行TopicKey任务 ]........');
    return;
  }
  console.log('.....[ 开始执行获取  TopicKey 的内容  ]........', resObj);
  // 获取标题和内容
  let taskResult = taskRes.res;
  let countentSuccess=[]
      countentSuccess = excuteAritcle(taskResult)

  /**
   * [
    {
        "name": "尊重他人，就能获得更多尊重",
        "userId": "",
        "deviceId": "",
        "topicKeyId": "12",
        "topicDetail": "个人兴趣爱好和业余活动。",
        "topicDetailComplete": "个人兴趣爱好和业余活动。根据这个设定，以第一人称的口吻，写一篇300字的短文，语言通俗易懂，情感要真实 ，不要带有第一话",
        "status": "1",
        "type": 1,
        "remark": "测试321",
        "createTime": "15:56:01"
    }

   */
  // 把 countentSuccess[]存入的数据库中
  let name = taskResult.name
  let userId = taskResult.userId
  let deviceId = taskResult.deviceId
  let topicKeyId=taskResult.id

  let topicDeTailArr=[]
  for(let i=0;i<countentSuccess++;i++){
      let topicDeTail={}
      topicDeTail.name=name
      topicDeTail.userId=userId
      topicDeTail.deviceId=deviceId
      topicDeTail.topicKeyId=topicKeyId
      topicDeTail.topicDetail=countentSuccess[i]
      //TODO: 模板
      topicDeTail.topicDetailComplete=countentSuccess[i]
      topicDeTail.status=0
      topicDeTail.type=1
      topicDeTail.remark=""
      topicDeTail.createTime=new Date()
      topicDeTailArr.push(topicDeTail)
  }

  console.info('.....[   存入topicDetail 的接口请求参数    ]........',topicDeTailArr);
  
  var add_top_detail_url = `http://101.201.33.155:8099//topic/detail/script/addTopicDetail`;
  const add_top_detail_result = http.postJson(add_top_detail_url,topicDeTailArr);
  const add_top_detail_result_json = JSON.parse(add_top_detail_result.body.string());
  console.info('.....[   存入topicDetail 的接口,返回值  ]........', add_top_detail_result_json);

  if (add_top_detail_result_json.code === 1) {
    console.info('.....[   批量插入topicDetail成功    ]........');
    console.info('.....[   开始更新topicKey 的状态    ]........',topicDeTailArr);

    const update_top_key_statu_url = `http://101.201.33.155:8099//topic/detail//web/updateTopicDetail`;
    const update_top_key_statu_param=taskRes
    update_top_key_statu_param.status=1
    const update_top_key_statu_result = http.postJson(update_top_key_statu_url,update_top_key_statu_param);
    const update_top_key_statu_result_json = JSON.parse(update_top_key_statu_result.body.string());
    if (update_top_key_statu_result_json.code === 1) {
         console.info('.....[   开始更新topicKey 的结果信息   ]........',update_top_key_statu_result_json);
         console.info('.....[   开始更新topicKey 的状态成功    ]........',update_top_key_statu_result_json);
    }
  }


 



  // // 更新 them的状态
  // let themId = resObj.id
  // var url2 = `http://101.201.33.155:8099/them/script/updateThemStatus/${themId}`;
  // console.info('.....[   开始回调接口    ]........');

  // var updateStatusRes = http.postJson(url2);

  // let contentCallBack = JSON.parse(updateStatusRes.body.string());

  // console.info('.....[   开始回调them接口结果,返回值  ]........', contentCallBack);

  // if (contentCallBack.code === 1) {
  //   console.info('.....[   更新状态成功    ]........');
  // }

}


// 【 ............................................ 【入库】.................................... 】
function excuteAritcle(taskResult) {

  console.warn('.....[从查询出来的 topicKey ]......', taskResult);
  let topicKey = taskResult.name
  content = getContentWithTopicKey(topicKey);
  // 插入 top_detail 表格
  return content;
}


function getContentWithTopicKey(title) {
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
  searchBox.click();
  sleep(1000);
  searchBox.setText(title)


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
  sleep(6000)
  let arr = []
  let counter = 0;
  console.log("....获取chatGPT的内容.....开始时间:....", formateDateUtil());
  while (counter < 100) {
    counter++;
    if (!text('Stop Responding').depth(28).exists()) {
      
      className("android.widget.TextView").depth(31).find().forEach(function (currentItem, index) {
        let itemContent = currentItem.text();
        console.log('.....itemContent......',itemContent);
        arr.push(itemContent)
      });
      

      console.log("....获取chatGPT的内容 arr ....:....", arr);

      // 处理结果
      for (let i = 0; i < arr.length; i++) {
           content += arr[i];
      }
      // 加载完
      break;
    }

    console.log("....获取chatGPT的内容 content ....:....", content);
    // 还在加载中...、
    if (textStartsWith("Stop Responding").depth(28).exists()) {
         console.log("加载中.......", counter);
         sleep(3000)
    }

    // 发生错误了
    if (textStartsWith("Something went wrong").depth(28).exists()) {
      return "false";
    }

    // 超时
    if (counter > 100) {
      return "false";
    }
  }

  console.log("....获取chatGPT的内容......结束时间:....", formateDateUtil());

  // 检查content

  if (content.indexOf("Ai") !== -1) {
    console.error("ChatGPT 内容获取获取失败,内容带有 [AI [字样")
    return "false";
  }

  if (content.indexOf("机器人") !== -1) {
    console.error("ChatGPT 内容获取获取失败,内容带有 [机器人[] 字样")
    return "false";
  }

  if (content.indexOf("抱歉我无法满足你的要求") !== -1) {
    console.error("ChatGPT 内容获取获取失败,内容带有 [ 抱歉我无法满足你的要求 ] 字样")
    return "false";
  }


  // 双击退出
 // doubleExistApp()

  if (content === "") {
    return "false"
  } else {
    return arr
  }
}




// 【 ............................................. 【 工具类  】........................................ 】
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


function nextDateUtil(index) {

  let now = new Date(); // 获取当前的日期和时间
  let addMinutes = 10 * index
  let year = now.getFullYear(); // 获取当前的年份
  let month = now.getMonth() + 1; // 获取当前的月份（注意月份是从 0 开始计算的，所以需要加 1）
  let day = now.getDate(); // 获取当前的日期
  let hour = now.getHours(); // 获取当前的小时
  let minute = now.getMinutes() + addMinutes; // 获取当前的分钟
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


function nextDateUtil(index) {

  let now = new Date(); // 获取当前的日期和时间
  let addMinutes = 10 * index
  let year = now.getFullYear(); // 获取当前的年份
  let month = now.getMonth() + 1; // 获取当前的月份（注意月份是从 0 开始计算的，所以需要加 1）
  let day = now.getDate(); // 获取当前的日期
  let hour = now.getHours(); // 获取当前的小时
  let minute = now.getMinutes() + addMinutes; // 获取当前的分钟
  let second = now.getSeconds(); // 获取当前的秒钟

  let formattedDateTime = year + "-" + addZeroPadding(month) + "-" + addZeroPadding(day) + " " +
    addZeroPadding(hour) + ":" + addZeroPadding(minute) + ":" + addZeroPadding(second);

  // 在个位数前添加零补齐
  function addZeroPadding(num) {
    return num < 10 ? "0" + num : num;
  }
  return formattedDateTime
}
