const net = require('net')
const WebSocket = require('ws')
// 引用Server类:
const WebSocketServer = WebSocket.Server

//  state.websock.readyState =>
//  ###########################
//  #   0:connecting,         #
//  #   1:connected,          #
//  #   2:closing,            #
//  #   3:closed/openFailed   #
//  ###########################

let currentTabId = 0
let serverPortCount = 0
let sockets = {}
let timeInterval = 1000
let autoSend = false
let hexType = false
let headerSize = 0
let clientBank = new Array()

$id('WebSocketServerPort').onkeyup = function (e) {
    if (e.keyCode != 13) {
        return
    }
    var port = parseInt($id('WebSocketServerPort').value)

    if (isNaN(port) || port > 65535 || port < 1) {
        showNotify('port show be number in 0~65535')
        return
    }

    var tempSocket = createWebSocketServer(port)

    if (!$isNull(tempSocket)) {
        sockets[port] = tempSocket
        serverPortCount++
    } else {
        showNotify('socket is null')
        return
    }
}

function createWebSocketServer(port) {
    try {
        const wss = new WebSocketServer({port: port})
        const hostname = '0.0.0.0'
        let clients = {}
        let clientName = 0
        mkTag(port, port, 'server')
        let div = mkContentDiv('server', port)
        div.appendChild(contentCreater(`服务器运行在：http://${hostname}:${port}`, 'green'))
        $id('box').appendChild(div)
        clientBank[port] = new Array()
        $id('WebSocketServerContent').appendChild(ServerClientList(port))
        wss.on('connection', function (client) {
            client.name = ++clientName
            client.type = 'web'
            clients[client.name] = client
            clientBank[port][parseInt(client.name)] = client
            div.appendChild(contentCreater('[client connected!] >> ' + `${client._socket.remoteAddress.split(':')[3]}` + `${client._socket.remotePort}`, 'green'))

            scrollToEnd(div)

            clientHost = checkBoxCreater(client)

            clientHost.id = 'listCheck' + client._socket.remotePort

            $id('list' + port).appendChild(clientHost)

            client.on('message', function (message) {
                div.appendChild(contentCreater('[Server receive]:' + `${client._socket.remoteAddress.split(':')[3]}:${client._socket.remotePort}:${message}`, 'blue'))
                scrollToEnd(div)
                if(div.children.length>100){
                    div.innerHTML = ''
                }
            })
            client.onclose = function (client) {
                if (!$isNull($id('listCheck' + client._socket.remotePort)))
                    $id('list' + port).removeChild($id('listCheck' + client._socket.remotePort))
                delete clients[client.name]
                delete clientBank[port][client.name]
                div.appendChild(contentCreater(`${client._socket.remoteAddress.split(':')[3]}下线了`, 'red'))
                scrollToEnd(div)
            }
        })

        wss.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                showNotify('Port in use,change another one !')
            } else {
                showNotify(e)
            }
            socket.unref()
            socket.close()
            return undefined
        })

        return wss
    } catch (e) {
        showNotify(e)
    }
}

$id('SocketServerPort').onkeyup = function (e) {
    if (e.keyCode != 13) {
        return
    }
    var port = parseInt($id('SocketServerPort').value)

    if (isNaN(port) || port > 65535 || port < 1) {
        showNotify('port show be number in 0~65535')
        return
    }

    var tempSocket = createSocketServer(port)

    if (!$isNull(tempSocket)) {
        sockets[port] = tempSocket
        serverPortCount++
    } else {
        showNotify('socket is null')
        return
    }
}

$id('TCPSocketClientContent').onkeyup = function (e) {
    if (e.keyCode != 13)
        return

    var hostname = $id('clientHostName').value
    var port = parseInt($id('clientPort').value)

    if (net.isIP(hostname) != 4 && net.isIP(hostname) != 6) {
        showNotify('Not IP4 or IP6 Address')
        return
    }

    if (isNaN(port) || port > 65535 || port < 1) {
        showNotify('port show be number in 0~65535')
        return
    }

    var tempTabId = parseInt(Math.random() * 1000000)

    var tempSocket = createSocketClient(hostname, port, tempTabId)
    if (!$isNull(tempSocket)) {
        sockets[tempTabId] = tempSocket
        serverPortCount++
    } else
        return

    var tag = mkTag(port, tempTabId, 'client')

    setTimeout(function () {
        if (!tempSocket.readyStatus) {
            showNotify('connection time out')
        } else
            tag.title = '#' + tempSocket.localPort
    }, 5000)
}

function createSocketClient(hostname, port, id) {
    const socket = new net.Socket()

    socket.readyStatus = false

    socket.setEncoding = 'UTF-8'

    var div = mkContentDiv('client', id)

    div.appendChild(contentCreater('Client connecting...', 'gray'))

    scrollToEnd(div)

    mkContentDiv('client')

    socket.connect(port, hostname, function () {
        socket.readyStatus = true
        div.appendChild(contentCreater('[client#' + id + ']' + 'connect to ' + hostname + ':' + port + ' success!', 'green'))
        scrollToEnd(div)
        $id('box').appendChild(div)
    })

    socket.on('data', function (msg) {
        if (headerSize != 0&&hexType) {
            msg = msg.slice(headerSize, parseInt(msg[headerSize]))
        }
        div.appendChild(contentCreater('message receive:' + msg, 'blue'))
        scrollToEnd(div)
        if(div.children.length>100){
            div.innerHTML = ''
        }
    })

    socket.on('error', function (error) {
        div.appendChild(contentCreater('[client error]:' + error, 'red'))
        scrollToEnd(div)
        socket.readyStatus = false
        return
    })

    socket.on('close', function () {
        div.appendChild(contentCreater('[client ' + socket.localPort + ' disconnected]', 'red'))
        scrollToEnd(div)
        socket.readyStatus = false
    })

    socket.on('ready', function () {
        socket.readyStatus = true
    })

    return socket
}

function createSocketServer(Port) {
    try {
        const hostname = '0.0.0.0'
        let port = Port
        let clients = {}
        let clientName = 0

        const socket = new net.createServer()

        let div

        socket.on('connection', (client) => {
            client.name = ++clientName // 给每一个client起个名
            clients[client.name] = client // 将client保存在clients

            client.type = 'tcp'

            clientBank[port][parseInt(client.name)] = client

            div.appendChild(contentCreater('[client connected!] >> ' + `${client.remoteAddress}` + `${client.remotePort}`, 'green'))

            scrollToEnd(div)

            clientHost = checkBoxCreater(client)

            clientHost.id = 'listCheck' + client.remotePort

            $id('list' + port).appendChild(clientHost)

            client.on('data', function (msg) { //接收client发来的信息
                if (headerSize != 0 && hexType) {
                    msg = getMsgWithHeaderSize(msg, headerSize)
                }
                div.appendChild(contentCreater('[Server receive]:' + `${client.remoteAddress}:${client.remotePort}:${msg}`, 'blue'))
                scrollToEnd(div)
                if(div.children.length>100){
                    div.innerHTML = ''
                }
            })

            client.on('error', function (e) { //监听客户端异常
                div.appendChild(contentCreater('client error:' + e, 'red'))
                scrollToEnd(div)
                client.end()
            })

            client.on('close', function () {
                if (!$isNull($id('listCheck' + client.remotePort)))
                    $id('list' + port).removeChild($id('listCheck' + client.remotePort))
                delete clients[client.name]
                delete clientBank[port][client.name]
                div.appendChild(contentCreater(`${client.remoteAddress}下线了`, 'red'))
                scrollToEnd(div)
            })
        })

        socket.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                showNotify('Port in use,change another one !')
            } else {
                showNotify(e)
            }
            socket.unref()
            socket.close()
            return undefined
        })

        socket.listen(port, hostname, function () {
            mkTag(port, port, 'server')
            div = mkContentDiv('server', port)
            div.appendChild(contentCreater(`服务器运行在：http://${hostname}:${port}`, 'green'))
            $id('box').appendChild(div)
            clientBank[port] = new Array()
            $id('TCPSocketServerContent').appendChild(ServerClientList(port))
        })

        return socket
    } catch (err) {
        showNotify(err)
    }
}

$id('sendButton').onclick = function () {
    var content = $id('input').innerText
    if ($isNull(content)) {
        showNotify('do not send empty message')
        return
    }
    if ($isNull(sockets[currentTabId])) {
        showNotify('current socket not found!')
        return
    }
    try {
        var tempClientContentBox = $id('clientContent' + currentTabId)
        var tempServerContentBox = $id('serverContent' + currentTabId)

        if (headerSize != 0) {
            if (hexType) {
                var headerArr = new Array(headerSize)
                headerArr[headerSize - 2] = content.length / 256
                headerArr[headerSize - 1] = content.length % 256
                var headerBuffer = Buffer.from(headerArr)
                content = Buffer.from(content)
                var content = Buffer.concat([headerBuffer, content])
            } else {
                content = content.length+content
            }
        }

        if (!$isNull(tempClientContentBox))
            sockets[currentTabId].write(content, function () {
                tempClientContentBox.appendChild(contentCreater('[send success]:' + content, 'gray'))
                scrollToEnd(tempClientContentBox)
            })
        if (!$isNull(tempServerContentBox)) {
            var ckbox = $class('checkBox' + currentTabId)
            if (!$isNull(ckbox))
                for (var i = 0; i < ckbox.length; i++) {
                    if (ckbox[i].checked && !$isNull(clientBank[currentTabId][parseInt(ckbox[i].value)])){
                        var tempClient = clientBank[currentTabId][parseInt(ckbox[i].value)]
                        if(tempClient.type == 'tcp'){
                            tempClient.write(content, function () {
                                tempServerContentBox.appendChild(contentCreater('[send success]:' + content, 'gray'))
                                scrollToEnd(tempServerContentBox)
                            })
                        }
                        if(tempClient.type == 'web'){
                            tempClient.send(content,(err)=>{
                                if(err){
                                    tempServerContentBox.appendChild(contentCreater('[send error]:' + err, 'gray'))
                                }else{
                                    tempServerContentBox.appendChild(contentCreater('[send success]:' + content, 'gray'))
                                }
                                scrollToEnd(tempServerContentBox)
                            })
                        }
                    }
                }
        }
    } catch (e) {
        showNotify(e)
    }
}

function contentCreater(content, color) {
    var time = new Date()
    var timeStr = '['
    timeStr += time.getHours() + ':'
    timeStr += time.getMinutes() + ':'
    timeStr += time.getSeconds() + ']'
    var div = $mkEle('div')
    div.classList.add('log')
    div.classList.add(color)
    div.innerText = timeStr + '-' + content
    return div
}

function checkBoxCreater(client) {
    p = $mkEle('p')
    checkbox = $mkEle('input')
    checkbox.type = 'checkbox'
    checkbox.value = client.name
    var className = 'checkBox' + (client.localPort == undefined ? client._socket.localPort:client.localPort)
    checkbox.classList.add(className)
    checkbox.checked = true

    var address = client.remoteAddress == undefined ? client._socket.remoteAddress.split(':')[3]:client.remoteAddress

    var port = client.remotePort == undefined ? client._socket.remotePort:client.remotePort

    p.innerText = address + ' #' + port
    p.appendChild(checkbox)
    p.classList.add('listCheck')
    p.id = 'listCheck' + client.localPort == undefined ? client._socket.localPort:client.localPort

    return p
}

function ServerClientList(port) {
    var div = $mkEle('div')
    var title = $mkEle('div')
    var i = $mkEle('i')
    var textBox = $mkEle('div')
    var listBox = $mkEle('div')
    listBox.id = 'list' + port
    listBox.classList.add('checkBox')
    div.classList.add('clientList')
    div.id = 'listBox' + port
    title.classList.add('listTitle')
    title.id = 'listTitle' + port
    i.classList.add('fa')
    i.classList.add('fa-caret-down')
    textBox.style.display = 'inline'
    textBox.style.marginLeft = '5px'
    textBox.innerText = 'ClientList for Port:' + port
    title.appendChild(i)
    title.appendChild(textBox)
    div.appendChild(title)
    div.appendChild(listBox)
    listBox.style.display = 'block'
    title.onclick = function () {
        if (listBox.style.display == 'block') {
            listBox.style.display = 'none'
            i.classList.remove('fa-caret-down')
            i.classList.add('fa-caret-right')
        } else {
            listBox.style.display = 'block'
            i.classList.remove('fa-caret-right')
            i.classList.add('fa-caret-down')
        }
    }
    return div
}

function mkTag(port, tempTabId, type) {
    var tabTitle = type + ':' + port
    var tag = $mkEle('div')
    var icon = $mkEle('i')
    icon.classList.add('fa')
    icon.classList.add('fa-times')
    icon.id = 'close' + type + tempTabId
    icon.classList.add('closeTab')

    tag.id = type + 'Tab' + tempTabId
    currentTabId = tempTabId
    tag.innerText = tabTitle
    tag.classList.add('tab')
    tag.appendChild(icon)

    icon.onclick = function () {
        recycle(icon.id)
    }

    if (!$isNull($class('tabActive')[0]))
        $class('tabActive')[0].classList.remove('tabActive')

    tag.classList.add('tabActive')

    if (serverPortCount != 0)
        $id('tab').style.background = '#1e1f1c'

    $id('tab').appendChild(tag)

    tag.onclick = function () {
        if (tag.classList.contains('TabClosed')) {
            return
        }
        if (!$isNull($class('tabActive')[0]))
            $class('tabActive')[0].classList.remove('tabActive')

        $id(this.id).classList.add('tabActive')
        currentTabId = this.id.substring(9)

        if (!$isNull($class('contentBoxActive')[0]))
            $class('contentBoxActive')[0].classList.remove('contentBoxActive')
        if (!$isNull($id(this.id.substring(0, 6) + 'Content' + currentTabId)))
            $id(this.id.substring(0, 6) + 'Content' + currentTabId).classList.add('contentBoxActive')
    }
    return tag
}

function mkContentDiv(type, port) {
    var div = $mkEle('div')
    div.classList.add('contentBox')
    div.id = type + 'Content' + port
    if (!$isNull($class('contentBoxActive')[0]))
        $class('contentBoxActive')[0].classList.remove('contentBoxActive')
    div.classList.add('contentBoxActive')
    return div
}

function recycle(icon) {
    if (icon.substring(0, 5) != 'close')
        return;
    var type = icon.substring(5, 11)
    var id = icon.substring(11)
    $id(type + 'Tab' + id).classList.add('TabClosed')
    //recycle tag
    if (!$isNull($id(type + 'Tab' + id)))
        $id('tab').removeChild($id(type + 'Tab' + id))
    //recycle content
    if (!$isNull($id(type + 'Content' + id)))
        $id('box').removeChild($id(type + 'Content' + id))
    //recycle socket
    if (type == 'client') {
        Rport = sockets[id].remotePort
        Lport = sockets[id].localPort
        sockets[id].destroy()
        delete sockets[id]
        //recycle clientlist
        if (!$isNull($id('listCheck' + Lport)))
            $id('list' + Rport).removeChild($id('listCheck' + Lport))
    }
    if (type == 'server') {
        recycleSocketServer(id)
    }

    if (--serverPortCount < 1) {
        $id('tab').style.background = 'transparent'
    }
    return
}

function recycleSocketServer(port) {
    // destroy all clients (this will emit the 'close' event above)
    for (var i in clientBank[port]) {
        clientBank[port][i].destroy();
        //delete clientBank[port][i]
    }
    //recycle clientLists
    if (!$isNull($id('listBox' + port))){
        if(!$isNull($id('TCPSocketServerContent'))){
            if($id('TCPSocketServerContent').contains($id('listBox' + port)))
                $id('TCPSocketServerContent').removeChild($id('listBox' + port))
        }
        if(!$isNull($id('WebSocketServerContent'))){
            if($id('WebSocketServerContent').contains($id('listBox' + port)))
                $id('WebSocketServerContent').removeChild($id('listBox' + port))
        }
    }
    if ($isNull(sockets[port]))
        return
    sockets[port].close(function () {
        delete sockets[port]
    });
}

function getMsgWithHeaderSize(msg, size) {
    switch (size) {
        case 2:
            return msg.slice(headerSize, parseInt(msg[headerSize]) + parseInt(msg[headerSize - 1]) * 256)
            break
        case 4:
            return msg.slice(headerSize, parseInt(
                msg[headerSize]) + parseInt(msg[headerSize - 1]) * 256 + parseInt(msg[headerSize - 2]) * 256 * 256)
            break
    }
}
