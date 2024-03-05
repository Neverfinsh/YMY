excuteArticle();

function excuteArticle(title, content) {

  // console.info('..... [ 清除后台所有应用 ] ........');
  // clearApp()

  // sleep(3000)
  // console.info('..... [  打开今日头条 ] ........');
  // launchApp("今日头条");


  // sleep(8000);
  // if(className("android.widget.Button").text("取消").exists()){
  //   console.warn('..... [  界面出现了有未成的编辑的提示词 ] ........');
  //   let unfinish_page_obj= text("取消").depth(5).findOne(1000);
  //   unfinish_page_obj.click()
  // }


  // if(text("升级版本").depth(6).exists()){
  //   console.warn('..... [  界面出现了软件升级提示词 ] ........');
  //   let unfinish_page_obj= desc("关闭").depth(6).findOne(1000);
  //   unfinish_page_obj.click()
  // }



  // console.info('..... [  点击 [我的]  ] ........');
  // sleep(3000);
  // click("我的");


  // sleep(3000);
  // if(!text("创作中心").depth(22).exists()){
  //   console.error('..... [ 打开 [我的] 页面失败 ] ........');
  //   return;
  // }



  // console.info('..... [  点击 [去发文]  ] ........');
  // sleep(4000);
  // if (className("android.widget.TextView").desc("去发文").exists()) {
  //   click("去发文");
  // } else {
  //   className("android.widget.ImageView").desc("发布").find().forEach(function (item, value) {
  //     item.click()
  //   });
  // }

  
  // sleep(4000);
  // if(!text("图片智能配文").depth(20).exists()){
  //   console.error('..... [ 打开 [去发文] 页面失败 ] ........');
  //   throw(" ..... [ 打开 [去发文] 页面失败 ] ........")
  // }



  
  // // 找到对应的控件消息
  // console.info("....把内容写入编辑区......");
  // sleep(4000);
  // let inputCmpObj = className('EditText').depth(19).findOne(1000);
  // inputCmpObj.click();
  // sleep(5000);
  // inputCmpObj.setText(content);


  // console.info("开始打开相册，选择相册")
  // sleep(5000);
  // let open_pic_btn_cmp = desc('相册').depth(20).findOne(1000);
  // open_pic_btn_cmp.click();

  // console.info("------- [ 开始打开相册，选择相册,滑动相册 ] --------")
  // sleep(4000);

  // 设置滑动起始点和终点的坐标

  //let num = Math.random().toFixed(1);
  let num = (Math.random() * 0.99 + 0.01).toFixed(2);
  console.log("--------[随机数生成]--------" + num);
  console.log("--------[device.height]--------" + device.height);
  let y2 = num
  sleep(3000);
  // swipe(device.width / 2, device.height * 0.2, device.width / 2, 300, 500);
//  swipe(device.width /2, device.height * 0.2, device.width / 2, 500, 500);
  swipe(device.width / 2, device.height*0.8    , device.width / 2, y2, 500);
  sleep(1000);
  // swipe(device.width / 2, device.height*0.1    , device.width / 2, device.height*0.5, 500);
  swipe(device.width / 2, device.height*0.8    , device.width / 2, y2, 500);
  // 选中照片
  sleep(2000);
  var randomInts = [];
  while (randomInts.length < 1) {
    var randomInt = Math.floor(Math.random() * 100) + 1;
    if (randomInts.indexOf(randomInt) === -1) {
      randomInts.push(randomInt);
    }
  }


  desc('未选中').depth(15).find().forEach(function (value, index) {
    if (randomInts.includes(index)) {
      value.click();
    }
  });

  // sleep(1500);
  // console.info("------- [ 选择图片,开始点击确认 ] --------")
  // className('Button').find().forEach(function (value, index) {
  //   let d = value.desc();
  //   if (d.includes("完成")) {
  //     value.click();
  //   }
  // })




  // console.info("------- [  推荐语 ] --------")
  // sleep(4000)
  // className('android.widget.FrameLayout').depth(20).find().forEach(function (value, index) {
  //   sleep(500)
  //   value.click();
  //   sleep(500)
  // })


  // // 添加位置
  // console.info("------- [  添加地址 ] --------")
  // sleep(6000);
  // const addressObj=desc("添加位置").className('android.widget.Button').depth(20).findOne(1000);
  // addressObj.click();



  // sleep(2000);
  // var randomIndex = Math.floor(Math.random() * 7);
  // console.info("------- [  选择添加地址参数 ] --------",randomIndex)
  // className('android.widget.RelativeLayout').depth(10).find().forEach(function (currentItem, index) {
  //   if (index == randomIndex) {
  //       currentItem.click();;
  //   }
  // })

  // console.info("------- [ 再次 推荐语 ] --------")
  // sleep(4000)
  // className('android.widget.FrameLayout').depth(20).find().forEach(function (value, index) {
  //   sleep(500)
  //   value.click();
  //   sleep(500)
  // })


  // if(title.length<19){
  //   console.info("------- [  添加标题 ] --------")
  //   sleep(3000)
  //   className('android.widget.Button').depth(20).find().forEach(function (currentItem, index) {
  //     if (currentItem.desc() == "添加标题") {
  //       currentItem.click();
  //       // 进入地址选择页面
  //       sleep(1000);
  //       className('android.widget.EditText').depth(19).find().forEach(function (Item, index) {
  //         if (Item.text() == "填写标题会有更多赞哦（选填）") {
  //           Item.setText(title);
  //         }
  //       })
  //     }
  //   })
  // }else{
  //   console.error("....【 标题超过了19个字 】.....",title);
  // }


  // //选择完图片后，进行发布
  // console.info("-------  点击 [  发布 ]  按钮[发布中...]--------")
  // text("发布").depth(12).findOne().click();

  // console.info("-------  [准备开始下篇文章]---------------------")

  return false;
}


function clearApp() {
recents();
sleep(3000);

// let _clear_box = id("clearbox").depth(7).findOne(); 
// let _clear_box_bounds = _clear_box.bounds()
// var x = _clear_box_bounds.centerX();
// var y = _clear_box_bounds.centerY();

let _clear_box =  desc("关闭所有最近打开的应用").depth(6).findOne(1000)
_clear_box.click();


sleep(4000);
}

