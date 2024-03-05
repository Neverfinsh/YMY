
// 点击操作

/* *************************************【保存图片 】 **********************************/

function saveImg(imgUrl) {

    // 从网络加载一张图片
    
    // 使用split()函数将路径字符串分割成数组
    var pathArray = imgUrl.split("/");
    
    // 获取数组中最后一个元素作为图片名称
    var imageName = pathArray[pathArray.length - 1];
    
    // 打印图片名称
    console.log(imageName);
    
    
    var img = images.load(imgUrl);
    
    // 保存图片到相册
    var saved = images.save(img, "/sdcard/DCIM/Camera/" + imageName + ".jpg");
    
    // 检查保存是否成功
    if (saved) {
      toast("图片保存成功");
    } else {
      toast("图片保存失败");
    }
    
    }
    
    
    function  httpUtils(){
    
    // 定义要调用的接口URL
    var apiUrl = "www.fastmock.site/mock/e5342b281f348ba318c234f0ee137f40/_vue3_learn/api/orderList";
    
    // 发起GET请求
    var res= http.post(apiUrl)
    console.log("==res==",res.body.string());
    }