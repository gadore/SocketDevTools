function showNotify(msg) {
    $id('notify').innerText = msg;
    $id('notify').style.display = 'block'
    setTimeout(function () {
        $id('notify').style.display = 'none'
    }, 2000)
}

function $id(id) {
    return document.getElementById(id)
}

function $class(className) {
    return document.getElementsByClassName(className)
}

function $tag(tag) {
    return document.getElementsByTagName(tag)
}

function $isNull(sth) {
    if (sth == '' || sth == null || sth == undefined || sth.length == 0) {
        return true
    } else {
        return false
    }
}

function $mkEle(ele){
    return document.createElement(ele)
}

function scrollToEnd(ele){
    ele.children[ele.children.length-1].scrollIntoView(false)
}

function $stringToByte(str) {
    var bytes = new Array();
    var len, c;
    len = str.length;
    for(var i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if(c >= 0x010000 && c <= 0x10FFFF) {
            bytes.push(((c >> 18) & 0x07) | 0xF0);
            bytes.push(((c >> 12) & 0x3F) | 0x80);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if(c >= 0x000800 && c <= 0x00FFFF) {
            bytes.push(((c >> 12) & 0x0F) | 0xE0);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if(c >= 0x000080 && c <= 0x0007FF) {
            bytes.push(((c >> 6) & 0x1F) | 0xC0);
            bytes.push((c & 0x3F) | 0x80);
        } else {
            bytes.push(c & 0xFF);
        }
    }
    return bytes;
}
