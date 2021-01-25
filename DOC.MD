---
# 主题列表：juejin, github, smartblue, cyanosis, channing-cyan, fancy, hydrogen, condensed-night-purple, greenwillow, v-green, vue-pro, healer-readable, mk-cute, jzman, geek-black, awesome-green, qklhk-chocolate
# 贡献主题：https://github.com/xitu/juejin-markdown-themes
theme: juejin
highlight:
---

# wangEditor 编辑器@人功能插件
## 介绍
这个插件是增强wangEditor编辑器，为其增加了 @人 的功能  
在tampermonkey下使用纯原生js开发,所以代码会比较多且low  
但是插件的使用方式较为复杂，而且可配置性比较低啊😄  
代码写的不规范，大家见谅
## 效果演示
> 演示效果是在[wangEditor官网](https://www.wangeditor.com/)测试，操作使用的是tampermonkey所以步骤略有不同
![Image text](https://raw.githubusercontent.com/fuxichen/WangEditor-call-people/main/bandicam%202021-01-24%2017-44-35-382.gif) 
## git仓库
> https://github.com/fuxichen/WangEditor-call-people.git
## 使用方式
> 由于我仓库里的是tampermonkey脚本，所以真实开发中还不能直接用这个js文件。/(ㄒoㄒ)/~~  

> 解决方案：在js代码中有一个 init 函数， 将此函数复制到js中。然后将 new 出的 wangEditor 对象和一个用户对象数组传递进去
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
## 实现功能
> 在编辑器的 onchange 回调函数中判断输入 '@' 字符 则弹出一个选择面板，显示列表用户。按上下键可以切换选中。鼠标左击某用户或者按下回车键则在编辑器中插入该用户的信息。点击选择面板外部则销毁选择面板。
## 其中需要解决的问题
1. 判断光标位置。显示选择面板需在当前输入光标的右下角，怎么知道当前光标的位置信息是首先需要解决的问题。（是光标位置，不是鼠标位置）
2. 如何处理用户输入的'@'字符，最终插入的是一个url链接，而链接的title包含了@，这样就导致出现`@@fuxichen`的情况，所以我们需要将用户输入的'@'字符删除。
3. 判断元素没在显示区域内，并将元素滚动至显示区域中。当用户列表超过5个后，会有部分用户被隐藏，使用上下键切换选中时只是样式改变，元素并不会滚动，将会导致选中的记录不可见。
4. 因判断光标逻辑的特殊性，导致在编辑器撤销时会出现兼容问题。
## 前置处理
### 创建基础样式
选择框样式是模仿的mac端的qq还是微信的@人样式来着，很久之前写的有点忘了  
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e9f8d513064348e3b9063e0eeddaaa7d~tplv-k3u1fbpfcp-watermark.image)
效果图  
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/737e85ca26694452ba37c5c121690280~tplv-k3u1fbpfcp-watermark.image)
### 创建Class处理器
因为需要修改 class 的地方比较多， 然后js元素修改class比较麻烦所以需要这个处理器  
传入一个node节点后处理器会维护一个`classList`变量用于存储当前元素的class列表。  
使用`add(xxx)`为元素添加class  
使用`remove(xxx)`为元素删除class。  
使用`getClassList()`获取当前元素的class列表  
使用`has(xxx)`判断当前class是否已经存在

同时为了防止在开发过程中开发者强制修改元素样式，导致处理器维护的class列表与实际不一致。所以还使用了 MutationObserver 监听元素的 class 改变，实时更新`classList`。
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8a9e7e892be44dfbbd523b90e7b62322~tplv-k3u1fbpfcp-watermark.image)
### 点击元素外部事件
通过监听document的点击事件判断触发事件的dom元素是否包含在被监听的元素中，如果包含则触发回调函数。函数会将取消监听的方法返回，并且在调用回调函数时传递，方便删除监听事件
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/28b2aba9778d41b48e68a9b6b52cde06~tplv-k3u1fbpfcp-watermark.image)
### 创建和删除提示框节点
就是创建一个div并设置`class`和删除这个div的方法
创建提示框节点需要传入提示框节点显示的位置
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4339e572382243fda1a7d112d1b8b185~tplv-k3u1fbpfcp-watermark.image)
### 获取最大祖先节点
编辑器new出来后会生成一些id，并且这些id会在html中绑定，我们想获取最大祖先节点只从当前节点需要一层一层向上遍历直到找到一个节点的父元素id为编辑器编辑区域唯一id的元素
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0050f48878fe4511ac2a7e466bf1cc25~tplv-k3u1fbpfcp-watermark.image)
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c82d1191fad4961a88281c961021d5b~tplv-k3u1fbpfcp-watermark.image)
## 主函数
```javascript
function init(editor, userList = []) {
  let oldHtml = null; // 记录编辑器上次的数据
  let currentIndex = 0; // 记录当前选中的用户下标
  let tipBody; // 保持选择框节点
}
```
## 监听onchange事件
首先监听编辑器的onchange事件，因为可能实际开发中开发者也会监听这个事件，为了避免代码冲突所以我这里将原来的方法备份，再用我的方法替换，并在我的方法中调用原方法。这样两个方法都能得到执行。  
本来打算用proxy代理onchange这个方法的，但是怕出现和编辑器内部逻辑冲突所以没有使用代理(就是懒O(∩_∩)O)。  
大家在使用过程中也应当避免这个问题。

1. 首先通过选区的起始点和终点判断是否是正常输入状态![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8da664807e644419b7e93f5dfd32c17a~tplv-k3u1fbpfcp-watermark.image)还是还是选区状态![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/85f2474f14ae45439fd4fea5b3ebf9ce~tplv-k3u1fbpfcp-watermark.image)  
2. 然后初始化选择用户下标，并删除旧的提示框元素、删除键盘监听事件
3. 获取光标的前一个字符判断是否是'@'字符
4. 添加键盘监听事件、获取光标位置信息、获取光标当前所在节点
5. 创建提示框并添加到`document`中并创建用户节点列表和创建基础样式。
6. 为提示框绑定点击元素外部事件，在回调中将提示框节点删除
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/282cc42fef004ba2827832b0472e1011~tplv-k3u1fbpfcp-watermark.image)
## 获取光标位置
前面说到创建提示框需要传入显示位置(输入光标（非鼠标指针）的右下角)，
因为输入光标在哪个位置都有可能。所以我们需要知道当前输入光标的位置。
### 获取y坐标
获取y坐标比较简单所以我们先讲。
首先通过审查元素知道编辑器插入的文本会被`p`标签包起来  
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e4f6630cbdf5403185c1171b2bf82a6c~tplv-k3u1fbpfcp-watermark.image)  
y坐标就等于`p.top`加上`p.height`  
那么我们只要知道这个p元素的位置就能知道y坐标  
通过查看mdn文档知道输入状态其实是一个特殊的选区(选区的起始点和终点是在同一个位置)
所以我们通过`let range = document.getSelection()`先获取到当前选区，通过`range.focusNode`可以得到焦点所在节点信息(因为我们输入的是'@'字符，所以当前得到的是text标记的元素![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0daac2f332624e028cc5d381e890b905~tplv-k3u1fbpfcp-watermark.image)，我们无法通过text标记元素得到坐标和宽高等信息)。需要再通过`range.focusNode.parentNode`获取到焦点所在的父元素(p元素)。  
拿到文本的父元素后就能通过`getBoundingClientRect`得到元素的位置信息
### 获取x坐标
获取x坐标比较麻烦，因为我们输入的一行中有很多可能
1. 前面有文本
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/125b812d28aa47ca80d53e5803294be9~tplv-k3u1fbpfcp-watermark.image)  
2. 后面有文本  
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/43997b7ddc6b4833a566767fd8f505a1~tplv-k3u1fbpfcp-watermark.image)  
2. 存在图片  
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/96192e8aef1f45f28a905b5d2ea792e6~tplv-k3u1fbpfcp-watermark.image)  
3. 存在其他行内标签  
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/204d6e1d70bc4a60ad44df91d415f92b~tplv-k3u1fbpfcp-watermark.image)  
等等众多可能，我们没有办法概括所有可能

我们知道在编辑器中，一行肯定是一个块级元素，以p标签为例，那么我们能不能将p标签通过`cloneNode`复制一份设置为隐藏，并插入到下一行（为了避免一些从父类继承下来的css样式丢失，所以必须这么做）。然后将其修改为行内元素，这样光标的x坐标就等于p标签的width。
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/54104774f3cd47afbeeee13f8af45043~tplv-k3u1fbpfcp-watermark.image)
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/960c27d8c9a640e9806e5b223f194d90~tplv-k3u1fbpfcp-watermark.image)  
如果光标后面有文本或其他元素。我们只需要将光标后面的标签或文本删除即可。
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b5dd4346d82646e98bb2756ecb849a83~tplv-k3u1fbpfcp-watermark.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a0632d1e3104c54b8fff9ca48af8697~tplv-k3u1fbpfcp-watermark.image)
因为光标所在节点可能在某行中嵌套了很多层,我们需要使用`getParentNode`方法获取最大祖先节点  
`<p><span>@</span></p>`
## 创建用户节点列表
代码很多，但逻辑非常简单。
1. 循环传递的用户列表，并创建对应的元素，将元素插入到提示框中。  
如果用户列表没有指定`img`(头像地址)则使用默认头像。如果指定了`type='github'`，则会将`name`属性作为github的用户名，并加载github上的头像
2. 添加鼠标移入移出动画
3. 添加点击事件
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/70e44c2c505c4f079ca05f574906bd35~tplv-k3u1fbpfcp-watermark.image)
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4584aee4898a4537a2427ffdce883fd3~tplv-k3u1fbpfcp-watermark.image)
## 监听按键按下
键盘按下的回调事件中如果不是按下上下方向键和回车键，就不进行处理  
否则拦截默认处理动作
如果调用的是上下键则将当前选中用户下标加减并调用`setCurrentIndex`方法
如果是回车键则调用`confirmHandle`插入数据
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b969241cf0f447caa4c21f550b7299f3~tplv-k3u1fbpfcp-watermark.image)
## setCurrentIndex方法
非常简单，就只是切换样式，然后调用`scrollTipBody`方法
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9c23b7707b0a4608aa4ffd95aca80c06~tplv-k3u1fbpfcp-watermark.image)
## confirmHandle方法
通过设置选区将用户输入的'@'字符选中。调用编辑器插入一个`<a>`标签。
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/33109402c78d4b46b0c2a706bc968a40~tplv-k3u1fbpfcp-watermark.image)
## 将选中元素滚动到可视区域内
通过滚动区域的滚动距离属性和当前元素的位置进行比较来判断当前元素是否在可视区域中。  
其中注意点是要判断元素是被隐藏在滚动区域的上边(从最后一个元素往第一个元素滚时)还是下边(从第一个元素往最后一个元素滚时)，这两种情况的滚动行为不一样。  
当元素被隐藏在上边时，我们直接滚动到元素位置，元素将在可视区域的顶部。  
当元素被隐藏在下边时，我们需要滚动到元素位置减去滚动区域高度，这样就能将元素放在可视区域的底部。
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/652dd89a47f342fe8776df8aa563f4e7~tplv-k3u1fbpfcp-watermark.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/85fc3bb804334c78ac0bafa2c251dbb4~tplv-k3u1fbpfcp-watermark.image)
## 处理编辑器撤销时出现的兼容问题
我们在获取光标位置的时候复制了一个节点并插入到后面，在拿到数据后又把节点销毁了  
由于编辑器是历史记录功能会将此步骤记录下来，在撤销时就会发生历史记录报错的问题。  
原因可能是在撤销回'@'字符时，由于我们监听到了数据改变会再次执行显示提示框，继而又会新增和删除一次节点，导致历史记录出现了问题（我猜测的）  
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/71df8d57625d41c3a19562c323485897~tplv-k3u1fbpfcp-watermark.image)  
为了解决这个问题，我在github上查看源码并找到了历史记录的处理类`wangEditor/src/editor/history/index.ts`
其中有个save方法，我就大胆猜测(我没有看全部源码),每次编辑器改变都会调用这个方法去保存历史记录  
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3198416cf642442ba054e6123160cdb0~tplv-k3u1fbpfcp-watermark.image)  
然后向上找到调用这个类的地方`wangEditor/src/editor/index.ts`  
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f9b0d50fab42470395ef93a16481b043~tplv-k3u1fbpfcp-watermark.image)  
发现存在this里  
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6a8c44146236482ba9c1234347b59f96~tplv-k3u1fbpfcp-watermark.image)  
在控制台输出验证一下  
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aef1e062f90e42498761e7e21d33a56c~tplv-k3u1fbpfcp-watermark.image)  
之前在插入节点时特地插入了一个特殊的数据字段，所以我们只需要判断传递进来的参数是包含这个字段的元素直接返回，不进行处理  
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a7f34db92414e25907339681bcbe554~tplv-k3u1fbpfcp-watermark.image)
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/20adb8abfc0840adad4caff440d38681~tplv-k3u1fbpfcp-watermark.image)
