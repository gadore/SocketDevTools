var ipc = require('electron').ipcRenderer;

const fixedCourse = 3
let wsWidth = $id('workspace').offsetWidth
let psWidth = $id('paramsSetting').offsetWidth

let wsHeight = "100%"
let canResize = false
let drag = false
let editHeight = 230
let changedPsWidth = 300//do not delete this varable,use in other js file!!!!
let onfocus = true
let timeTicker

window.onresize = function () {
  AutoSetWindowSize()
}

//windows max min hide func 
if (!$isNull($id('closeBtn'))) {
  $id('closeBtn').onclick = function () {
    ipc.send('window-close');
  }
}
if (!$isNull($id('maxBtn'))) {
  $id('maxBtn').onclick = function () {
    ipc.send('window-max');
  }
}
if (!$isNull($id('hideBtn'))) {
  $id('hideBtn').onclick = function () {
    ipc.send('window-hide');
  }
}

//Windows drag handler
$id('workspace').onmousemove = function () {
  if (event.clientX - 60 - psWidth >= -fixedCourse &&
    event.clientX - 60 - psWidth <= fixedCourse) {
    this.style.cursor = 'ew-resize'
    canResize = true
  } else {
    this.style.cursor = 'default'
  }
  if (drag && canResize && onfocus) {
    psWidth = event.clientX - 60;
    changedPsWidth = psWidth
    AutoSetWindowSize();
  }
}

$id('workspace').onmousedown = function () {
  if (canResize && onfocus)
    drag = true
  this.onmouseup = function () {
    if (canResize) {
      drag = false;
      canResize = false;
    }
  }
}

$id('tab').onwheel = function (event) {
  event.preventDefault();
  //设置鼠标滚轮滚动时屏幕滚动条的移动步长  
  var step = 50;
  if (event.deltaY < 0) {
    //向上滚动鼠标滚轮，屏幕滚动条左移  
    this.scrollLeft -= step;
  } else {
    //向下滚动鼠标滚轮，屏幕滚动条右移  
    this.scrollLeft += step;
  }

}

//bottom bar 
$id('showInputSend').onclick = function () {
  if ($id('output').style.display == 'block') {
    $id('output').style.display = 'none'
    editHeight = 0
    AutoSetWindowSize()
    $id('showInputSend').innerText = 'ShowInput'
  } else {
    $id('output').style.display = 'block'
    editHeight = 230
    AutoSetWindowSize()
    $id('showInputSend').innerText = 'HideInput'
  }
}

//当前窗口得到焦点 
window.onfocus = function () {
  setTimeout(function () {
    onfocus = true
  }, 200)
  canResize = false
  drag = false
  return
};

//当前窗口失去焦点 
window.onblur = function () {
  onfocus = false
};

//bottom button


//Function area

function init() {
  psWidth = $id('paramsSetting').offsetWidth
  AutoSetWindowSize()
}

function AutoSetWindowSize() {
  wsWidth = $id('root').offsetWidth - 60
  wsHeight = $tag('body')[0].offsetHeight - 50
  $id('workspace').style.width = wsWidth + 'px'
  if (psWidth < 236 && psWidth != 0)
    psWidth = 236
  if(psWidth > 350 && psWidth != 0)
    psWidth = 350
  $id('box').style.height = wsHeight - 45 - editHeight + 'px'
  $id('topContainer').style.height = wsHeight + 'px'
  $id('mainDisplay').style.width = wsWidth - psWidth + 'px'
  $id('paramsSetting').style.width = psWidth + 'px'
}

function headerSizeChange(){
  headerSize = parseInt($id('headerSize').options[$id('headerSize').selectedIndex].value)
}

function encodingChange(){
  hexType = $id('encoding').options[$id('encoding').selectedIndex].value == 'true' ? true : false
}

function timeIntervalChange(){
  timeInterval = parseInt($id('timeInterval').options[$id('timeInterval').selectedIndex].value)
  window.clearInterval(timeTicker)
  timeTicker = setInterval(function(){if(!autoSend){return} sendMessage()},timeInterval)
}

function autoSendChange(){
  autoSend = $id('autoSend').options[$id('autoSend').selectedIndex].value == 'true' ? true : false
}


timeTicker = setInterval(function () {if(!autoSend){return} sendMessage()}, timeInterval)

