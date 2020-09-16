let btnBox = {}
let contentsBox = {}
let activeBtn = 'TCPSocketClient'

$id('sideBar').appendChild(sideBtnCreater('TCPSocketClient', 'fa-globe'))
$id('sideBar').appendChild(sideBtnCreater('TCPSocketServer', 'fa-cog'))
$id('sideBar').appendChild(sideBtnCreater('WebSocketServer', 'fa-bug'))
$id('sideBar').appendChild(sideBtnCreater('WebSocketClient', 'fa-cloud'))

btnBox = $class('sideBtn')
contentsBox = $class('contents')
$id('TCPSocketClient').style.color = 'white'

$('.sideBtn').on('click', function () {
    if (this.id == activeBtn) {
        if ($id('paramsSetting').style.display == 'inline') {
            psWidth = 0
            $id('paramsSetting').style.display = 'none'
            AutoSetWindowSize()
        } else {
            psWidth = changedPsWidth
            $id('paramsSetting').style.display = 'inline'
            AutoSetWindowSize()
        }
    }
    
    for (var i = 0; i < btnBox.length; i++) {
        if (btnBox[i].id === this.id) {
            btnBox[i].style.color = 'white'
            activeBtn = this.id
            var contentId = this.id + 'Content'
            for(var j = 0; j < contentsBox.length; j++){
                contentsBox[j].style.display = 'none'
            }
            var tempContent = $id(contentId)
            if(tempContent!=null){
                tempContent.style.display = 'block'
            }
        } else {
            btnBox[i].style.color = 'gray'
        }
    }
    $id('subBarTitle').innerText = this.id
})

//function area
function sideBtnCreater(idName, className) {
    var div = $mkEle('div')
    div.id = idName
    div.classList.add('sideBtn')
    var i = $mkEle('i')
    i.classList.add('fa')
    i.classList.add('fa-3x')
    i.classList.add(className)
    i.setAttribute("aria-hidden", 'true')
    div.appendChild(i)
    return div
}
