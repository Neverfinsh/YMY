// var LocalStorage = storages.create("task_storage");
// var taskList=[]
//     taskList = LocalStorage.get("task_list");
//     console.log('....  从本地缓存获取的值,执行任务前的 [task_list] .........',taskList);

// for( let j=0;j<taskList.length;j++){
//     let  seriesTitle=taskList[j].seriesTitle
//     let  counter=taskList[j].counter
//     console.log('.... 缓存获取task_list 的值中具体的值 .........',taskList[j]);
//     console.log('.... 从本地缓存获取task_list的值 【SeriesTitle】 .........',seriesTitle );
//     console.log('.... 从本地缓存获取task_list的值 【counter】 .........',counter );
//     console.log('.... 开始执行main方法 .........' );
//     main(seriesTitle,counter,3000);
// }    
// taskList = LocalStorage.get("task_list");
// console.log('....  执行任务完的 [task_list] .........',taskList);



//  请求接口
var url = "http://example.com/api"; 
function requestData() {
  http.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0" 
    },
    success: function(response) {
      var data = response.body.string(); 
      toastLog("Response: " + data);
    },
    error: function(error) {
      console.log(error);
    }
  });
}


// 每隔5分钟执行一次requestData函数
setInterval( main(seriesTitle,counter,3000),5 * 60 * 1000);

function main(seriesTitle,counter,gap) {

for (let pages = 1; pages < Number(counter); pages++) {

// 停止其他脚本
//engines.stopAllAndToast()


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
let richTitle=setTitleRich(seriesTitle);
console.log("....获取chatGPT的标题......",richTitle);

//  从chatGPT 获取数据
sleep(4000);
let content;
content=getContentChatGPT(richTitle)

console.log("....获取chatGPT的内容......",content);
// 跳出大循环
if(content==="Something went wrong, please try again later."){
    console.log("........没有获取到ChatGPT的内容........");
    continue ;
}
// 找到对应的控件消息
toastLog("开始获取发布文章内容");
let count = 0
while(count<60){
  count++;
  if(content== "false"){   // 出问题了
    console.log("....等待获取chatGPT的内容......",count);
    sleep(2000);
    break ; // 跳出循环
  }
  if(content== undefined){
    console.log("....等待获取chatGPT的内容......",count);
    sleep(2000);
  }else{
    let inputCmpObj = className('EditText').depth(19).findOne(1000);
    inputCmpObj.click();
    sleep(5000);
    inputCmpObj.setText(content);
    break ; 
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
while (randomInts.length < 4) {
  var randomInt = Math.floor(Math.random() * 20) + 1;
  if (randomInts.indexOf(randomInt) === -1) {
       randomInts.push(randomInt);
  }
}

desc('未选中').depth(15).find().forEach(function(value,index){
  if(randomInts.includes(index)){
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
sleep(5000) ;
className('android.widget.Button').depth(20).find().forEach(function(currentItem,index){
   if(currentItem.desc() == "添加位置，让更多人看到" || currentItem.desc() == "添加位置" ){
      currentItem.click();
      // 进入地址选择页面
      sleep(3000);
      
      className('android.widget.RelativeLayout').depth(10).find().forEach(function(currentItem,index){
        if( index==2){
           currentItem.click();;
        }
      })
    }
})


// 把标题润色一下


//获取标题  desc('添加标题')
sleep(3000) 
className('android.widget.Button').depth(20).find().forEach(function(currentItem,index){
  if(currentItem.desc() == "添加标题"){
     currentItem.click();
     // 进入地址选择页面
     sleep(1000);
     className('android.widget.EditText').depth(19).find().forEach(function(Item,index){
       if(Item.text()== "填写标题会有更多赞哦（选填）"){
           Item.setText(richTitle ? richTitle : seriesTitle+"("+pages+")");
       }
     })
   }
})

//发布
// text("预览").depth(12).findOne(1000).click();

//选择完图片后，进行发布
text("发布").depth(12).findOne().click();

sleep(Number(gap))
}
}





/* *************************************【获取chatGPT 】 **********************************/


function getContentChatGPT(title) {

var content = "";
// 打开页面
app.startActivity({
  action: "android.intent.action.VIEW",
  data:   "https://chat18.aichatos.xyz/"
});

// 等待浏览器加载完成
sleep(1000 * 6);

// 查找搜索框并输入关键字
var searchBox = className("android.widget.EditText").depth(28).findOne();
// console.log("=====searchBox====",searchBox);
searchBox.click();
sleep(1000);
searchBox.setText("围绕着"+title+"这个标题写一篇200字的文章，结合历史事件，要求内容吸引人眼球，正能量,不要带有正文和标题的字样,开头换一行,并且空2格")


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
console.log("....获取chatGPT的内容.....开始时间:....",formateDateUtil());
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
      console.log("加载中.......",counter);
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

console.log("....获取chatGPT的内容......结束时间:....",formateDateUtil());


console.log("............................");

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
  data:   "https://chat18.aichatos.xyz/"
});

// 等待浏览器加载完成
sleep(1000 * 6);

// 查找搜索框并输入关键字
var searchBox = className("android.widget.EditText").depth(28).findOne();
// console.log("=====searchBox====",searchBox);
searchBox.click();
sleep(1000);
searchBox.setText("把"+title+"这个标题润色一下,使得标题更加吸引人眼球，更加具体创新力，不超过15个字，要求标题带有双引号,不要带有冒号")


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
console.log("....获取chatGPT的标题.....开始时间:....",formateDateUtil());
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
      console.log("加载中.......",counter);
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

console.log("....获取chatGPT的标题......结束时间:....",formateDateUtil());


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

recents();

sleep(3000);

let _clear_box=id("clearbox").depth(7).findOne();66
let _clear_box_bounds=_clear_box.bounds()
var x = _clear_box_bounds.centerX();
var y = _clear_box_bounds.centerY();
click(x,y)
sleep(4000);

sleep(4000);
}