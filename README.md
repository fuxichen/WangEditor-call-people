# WangEditor-call-people
WangEditor 编辑器@人功能插件
> 当前插件代码使用 tampermonkey 编写测试  
编写时测试环境为 WangEditor官网 https://www.wangeditor.com/ （v4版本）

## 测试视频
> ![Image text](https://raw.githubusercontent.com/fuxichen/WangEditor-call-people/main/bandicam%202021-01-24%2017-44-35-382.gif) 

## 测试步骤
1. 在tampermonkey中安装该插件，并打开WangEditor官网
2. 打开控制台输入代码
```javascript
$(function (){
    var E = window.wangEditor
    var editor = new E('#div-demo')

    editor.config.uploadImgShowBase64 = true
    editor.config.height = 800

    editor.create()
});
```
> 该代码是从官网js里扒的，我代码里代理了WangEditor的对象，但因为js执行时机问题一直无法赶在官方代码执行前执行所有需要手动执行一遍
## 如何将插件合并到真实开发中去
> 代码中存在 一个 init 函数， 将此函数复制到js中
然后将 new 出的 wangEditor 对象和一个用户对象数组传递进去
示例如下：
```javascript
let editor = new wangEditor(...param);
const userList = [
    {
        name: "wangfupeng1988",
        url: "https://github.com/wangfupeng1988",
        img: "",
        type: "github",
    },
    {
        name: "fuxichen",
        url: "https://github.com/fuxichen",
        img: "",
        type: "github",
    },
];
init(editor, userList);
```

## 已知的问题
由于使用了 insertHTML 方法，所以可能存在 XSS 攻击问题，大家可自行修改（在95-98行）规避或另找解决方案
