// ==UserScript==
// @name         wangEditor增强@人功能
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://www.wangeditor.com/
// @grant        none
// ==/UserScript==

(function () {
    "use strict";
    // 将已创建的编辑器清空重新生成， 拿到 对应编辑器对象
    document.querySelector("#div-demo").innerHTML = "";
    document.querySelector("#div-demo").removeAttribute("data-we-id");
    let wangEditor = window.wangEditor;
    window.wangEditor = function (...param) {
        let editor = new wangEditor(...param);
        // console.log(editor);
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
        return editor;
    };
    function init(editor, userList = []) {
        proxyHistorySave(editor.history);
        /**
         * 代理编辑器历史记录的保存方法过滤因使用获取光标位置逻辑产生的虚拟节点
         */
        function proxyHistorySave(history) {
            let save = history.save;
            history.save = (...params) => {
                let flag = params[0][0]?.addedNodes?.[0]?.getAttribute?.(
                    "data-data"
                );
                console.log(flag);
                if (flag == "qq632951357-charLen") {
                    return;
                }
                save.call(history, ...params);
            };
        }
        window.userList = userList;
        // editor.config.uploadImgShowBase64 = true;
        let onchange = editor.config.onchange;

        editor.config.onchange = function (...params) {
            changeHandle(...params);
            typeof onchange == "function" && onchange(...params);
        };

        let oldHtml = null;
        let currentIndex = 0;
        let tipBody;

        // 监听键盘按下回车事件
        let keyDownFun = (event) => {
            // console.log(event)
            // event.stopPropagation()
            if (
                event.isComposing ||
                event.keyCode === 229 ||
                ![13, 40, 38].includes(event.keyCode)
            ) {
                return;
            }
            event.preventDefault();
            if (event.keyCode == 13 && userList.length != 0) {
                confirmHandle();
                event.returnValue = false;
            } else if (event.keyCode == 40) {
                // down
                setCurrentIndex(currentIndex + 1);
            } else if (event.keyCode == 38) {
                // up
                setCurrentIndex(currentIndex - 1);
            }
        };
        function confirmHandle() {
            let range = document.getSelection().getRangeAt(0)
            // editor.cmd.do("forwardDelete");
            // 将 @ 符号选中
            // document
            //     .getSelection()
            //     .getRangeAt(0)
            //     .setStart(
            //         document.getSelection().focusNode,
            //         document.getSelection().focusOffset - 1
            //     );
            let text = range.startContainer.data || range.startContainer.textContent
            let startText = text.substr(0, range.endOffset - 1);
            let endText = text.substring(range.endOffset, text.length)
            console.log(startText, "---", endText)
            let a = document.createElement("a");
            a.href = userList[currentIndex].url;
            a.target = "_blank";
            a.class = "not-select111";
            a.style.userSelect = "all";
            a.setAttribute("contenteditable", "false");
            a.setAttribute("unselectable", "on");
            a.setAttribute("data-data", "qq632951357-link")
            a.innerHTML = "@" + userList[currentIndex].name + "&nbsp;";
            document.getSelection().focusNode.replaceWith(a)
            if (startText.length) {
                a.parentNode.insertBefore(document.createTextNode(startText), a)
            }
            if (endText.length) {
                insertAfter(document.createTextNode(endText), a)
            }

            // 将 @ 符号选中
            document
                .getSelection()
                .getRangeAt(0)
                .setStartAfter(
                    a
                );
            document
                .getSelection()
                .getRangeAt(0)
                .setEndAfter(
                    a
                );
            // editor.cmd.do(
            //     "insertHTML",
            //     `<a href="${userList[currentIndex].url}" target="_blank" class="not-select111" style="user-select: all;" contenteditable="false" unselectable="on" data-data="qq632951357-link">@${userList[currentIndex].name}&nbsp;</a>`
            // );
        }
        function confirmHandle2() {
            editor.cmd.do("forwardDelete");
            // 将 @ 符号选中
            document
                .getSelection()
                .getRangeAt(0)
                .setStart(
                    document.getSelection().focusNode,
                    document.getSelection().focusOffset - 1
                );
            editor.cmd.do(
                "insertHTML",
                `<a href="${userList[currentIndex].url}" target="_blank" class="not-select111" style="user-select: all;" contenteditable="false" unselectable="on" data-data="qq632951357-link">@${userList[currentIndex].name}&nbsp;</a>`
            );
        }

        function setCurrentIndex(index) {
            if (index > userList.length - 1 || index < 0) {
                return;
            }
            let list = document.querySelectorAll(
                ".option__item[data-data=qq632951357-option]"
            );
            list[currentIndex].classList.remove("select");
            list[index].classList.add("select")
            currentIndex = index;
            scrollTipBody(list[index]);
        }

        /**
         * 点击外部事件
         * @param {*} el 监听元素
         * @param {*} callback 回调函数
         */
        function clickoutside(el, callback) {
            let handle = function (event) {
                if (el && !el.contains(event.target)) {
                    typeof callback == "function" && callback(removeHandle);
                }
            };
            let removeHandle = function () {
                document.removeEventListener("click", handle);
            };
            document.addEventListener("click", handle);
            return removeHandle;
        }

        /**
         * 编辑器改变处理事件
         * @param {*} html 改变后数据
         */
        function changeHandle(html) {
            if (html == oldHtml || userList.length == 0) {
                return;
            }
            oldHtml = html;
            // html 即变化之后的内容
            // console.log(html);
            // 获取当前选区
            let range = document.getSelection();
            // console.log(range);
            // 判断选区的起始点和终点是否在同一个位置
            if (range?.focusNode?.isConnected) {
                currentIndex = 0;
                removeTipBody();
                document.removeEventListener("keydown", keyDownFun);
                if (range.focusOffset == 0) {
                    return;
                }

                // 获取选区前一个字符
                let char = range.focusNode.nodeValue?.substr(
                    range.focusOffset - 1,
                    1
                );

                if (char == "@") {
                    document.addEventListener("keydown", keyDownFun);
                    let info = getCursorOffset(
                        getParentNode(range.focusNode),
                        range
                    );
                    // console.log(info);

                    let clientRect = range.focusNode.parentNode.getBoundingClientRect();
                    // console.log(clientRect);
                    tipBody = createTipBody(
                        clientRect.top + clientRect.height,
                        clientRect.left + info.width
                    );
                    document.body.appendChild(tipBody);
                    createUserNode(userList, tipBody);
                    createBaseStyle();
                    clickoutside(tipBody, function (removeHandle) {
                        removeTipBody();
                        removeHandle();
                    });
                    // window.div = div;
                }
            }
        }
        /**
         * 创建用户节点
         * @param {*} list 用户列表
         * @param {*} parentNode 插入位置节点
         */
        function createUserNode(list = [], parentNode) {
            list.map((v, i) => {
                let optionItem = document.createElement("div");
                optionItem.dataset.data = "qq632951357-option";
                let optionItemClassHandle = optionItem.classList;
                optionItemClassHandle.add("option__item");
                let imgDiv = document.createElement("div");
                let imgDivClassHandle = imgDiv.classList;
                imgDivClassHandle.add("option__img-div");
                imgDiv.dataset.data = "qq632951357-option";
                let defaultImgUrl = "https://s3.ax1x.com/2021/01/22/s5qlgU.png";
                let githubImgUrl =
                    "https://avatars3.githubusercontent.com/" + v.name;
                let imgUrl =
                    v.img ||
                    (v.type == "github" ? githubImgUrl : defaultImgUrl);
                imgDiv.innerHTML = `<img class="option__img" data-data="qq632951357-option" src="${imgUrl}"/>`;
                optionItem.appendChild(imgDiv);
                if (i == 0) {
                    optionItemClassHandle.add("select");
                }
                let span = document.createElement("span");
                span.setAttribute("class", "option__span");
                span.setAttribute("data-data", "qq632951357-option");
                span.innerText = "@" + v.name;
                optionItem.appendChild(span);
                optionItem.onmouseover = (event) => {
                    optionItemClassHandle.add("mouse-select");
                };
                optionItem.onmouseout = (event) => {
                    optionItemClassHandle.remove("mouse-select");
                };
                optionItem.onclick = (event) => {
                    setCurrentIndex(i);
                    confirmHandle();
                };
                parentNode.appendChild(optionItem);
            });
        }
        /**
         * 删除提示框节点
         */
        function removeTipBody() {
            if (tipBody) {
                tipBody.remove();
                tipBody = null;
            }
        }
        /**
         * 创建提示框节点
         */
        function createTipBody(x, y) {
            let dom = document.createElement("div");
            dom.dataset.data = "qq632951357-tip";
            dom.setAttribute("class", "tip-body");

            dom.style.top = x + "px";
            dom.style.left = y + "px";
            // range.focusNode.parentNode.blur();
            return dom;
        }
        /**
         * 移动提示框的位置,使选中元素在可视区域内
         */
        function scrollTipBody(node) {
            if (tipBody) {
                if (
                    tipBody.scrollTop + tipBody.offsetHeight <=
                    node.offsetTop + node.offsetHeight
                ) {
                    tipBody.scrollTo(
                        0,
                        node.offsetTop -
                        (tipBody.offsetHeight - node.offsetHeight)
                    );
                } else if (tipBody.scrollTop > node.offsetTop) {
                    tipBody.scrollTo(0, node.offsetTop);
                }
            }
        }
        /**
         * 创建基础样式
         */
        function createBaseStyle() {
            let oldStyle = document.querySelector(
                "[data-data='qq632951357-style']"
            );
            if (!oldStyle) {
                // 为提示节点增加额外的样式
                let style = document.createElement("style");
                style.type = "text/css";
                style.dataset.data = "qq632951357-style";
                let cssText = `
                         .tip-body[data-data="qq632951357-tip"]::-webkit-scrollbar{display:none}
                         .tip-body[data-data="qq632951357-tip"]{width: 200px;height: 150px;background-color: white;position: fixed;display: flex;flex-direction: column;border-radius: 10px;padding: 0 0;box-shadow: 1px 1px 24px 1px rgba(0,0,0,0.1);z-index: 99999;overflow-y: auto;}
                         .option__item[data-data="qq632951357-option"]{padding: 4px 10px;display: flex;align-items: center;}
                         .option__item[data-data="qq632951357-option"].select{background-color: rgba(239, 239, 239, 1);}
                         .option__item[data-data="qq632951357-option"].mouse-select:not(.select){background-color: #f3f3f3;}
                         .option__img[data-data="qq632951357-option"]{width:20px;height:20px;}
                         .option__img-div[data-data="qq632951357-option"]{border-radius: 100%;overflow: hidden;margin-right: 5px;}
                         .option__span[data-data="qq632951357-option"]{overflow-x: hidden;text-overflow: ellipsis;max-width: calc(100% - 25px);}
                         .not-select{
                             -moz-user-select: none; /*火狐*/
                             -webkit-user-select: none; /*webkit浏览器*/
                             -ms-user-select: none; /*IE10*/
                             -khtml-user-select: none; /*早期浏览器*/
                             user-select: none;
                             -webkit-touch-callout: none;
                         }`;
                try {
                    style.appendChild(document.createTextNode(cssText));
                } catch (ex) {
                    style.styleSheet.cssText = cssText; //针对IE
                }
                let head = document.getElementsByTagName("head")[0];
                head.appendChild(style);
            }
        }

        // 获取某元素的父元素，且该父元素的直接父元素必须为编辑框正文节点
        function getParentNode(node) {
            // 获取编辑框正文节点
            let editorNode = document.querySelector(
                `[id="${editor.textElemId}"]`
            );
            if (editorNode == node.parentNode) {
                return node;
            } else {
                return getParentNode(node.parentNode);
            }
        }
        /**
         * 获取光标在元素中的偏移坐标
         * @param {*} node 节点
         * @param {*} range 当前选中状态数据对象
         */
        function getCursorOffset(node, range) {
            // console.log(range);
            let oldDiv = document.querySelector(
                "[data-data='qq632951357-charLen']"
            );
            if (oldDiv) {
                oldDiv.remove();
            }

            let maxWindow = parseFloat(window.getComputedStyle(node).width)
            let div = node.cloneNode(true);
            // div.setAttribute('id', 'qq632951357-charLen');
            div.style.position = "absolute";
            div.style.visibility = "hidden";
            div.setAttribute("data-data", "qq632951357-charLen");
            // console.log(node);
            // console.log(div);
            deleteNode(node, div, range);
            insertAfter(div, node);
            let style = window.getComputedStyle(div);
            let result = {
                width: parseFloat(style.width) % maxWindow,
                height: parseFloat(style.height),
            };
            // div.remove();
            return result;
        }
        /**
         * 删除多余节点
         * 删除光标后面的所有元素
         * @param {*} oldNode 旧节点
         * @param {*} node 新节点(备用节点)
         * @param {*} range 当前选中状态数据对象
         */
        function deleteNode(oldNode, node, range) {
            let flag = false;
            let childNodes = Array.from(node.childNodes)
            for (let i = 0, len = node.childNodes.length; i < len; i++) {
                if (oldNode.childNodes[i] == range.focusNode) {
                    flag = true;
                    childNodes[i].textContent = childNodes[
                        i
                    ].textContent.substr(0, range.focusOffset);
                } else {
                    if (!childNodes[i]) {
                        continue;
                    }
                    if (flag) {
                        childNodes[i].remove();
                    } else if (childNodes[i].childNodes.length != 0) {
                        deleteNode(oldNode, childNodes[i], range);
                    }
                }
            }
        }

        /**
         * 在元素插入在目标元素之后
         * @param {*} newElement 要插入的元素
         * @param {*} targentElement 目标元素
         */
        function insertAfter(newElement, targentElement) {
            let parent = targentElement.parentNode;
            if (parent.lastChild == targentElement) {
                parent.appendChild(newElement);
            } else {
                parent.insertBefore(newElement, targentElement.nextSibling);
            }
        }
    }
})();
