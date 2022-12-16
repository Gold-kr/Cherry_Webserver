var monitorAreas = new Array();//Monitor Mode 영역 데이터

/**
 * 휠 스크롤을 통한 스케일 변경 컨트롤
 * @param {*} event 
 */
function monitorModeWheelScrollHandler(event) {
    console.log('zoom', event);
    if (event.altKey) {
        event.preventDefault();

        scale -= scale * event.deltaY * 0.001;

        if (scale > ZOOM_IN_MAX) scale = ZOOM_IN_MAX;
        else if (scale < ZOOM_OUT_MIN) scale = ZOOM_OUT_MIN;

        changeMonitorModePreviewSize();
    }
}

/**
 * 스케일 조정된 이미지 화면 표시
 */
function changeMonitorModePreviewSize() {
    var width = parkingZone.offsetWidth;
    var height = parkingZone.offsetHeight;
    var clientWidth = parkingZone.clientWidth;
    var clientHeight = parkingZone.clientHeight;
    var scrollLeft = parkingZone.scrollLeft;
    var scrollTop = parkingZone.scrollTop;

    console.log('before scrollLeft = ' + scrollLeft + '   scrollTop = ' + scrollTop + '   scale = ' + scale);

    var offsetX;
    var offsetY;

    offsetX = (qdisPlayer.offsetWidth - clientWidth) / 2 - scrollLeft;
    offsetY = (qdisPlayer.offsetHeight - clientHeight) / 2 - scrollTop;

    qdisPlayer.style.width = width * scale + 'px';
    qdisPlayer.style.height = height * scale + 'px';

    canvasMonitor.style.width = width * scale + 'px';
    canvasMonitor.style.height = height * scale + 'px';

    parkingZone.scrollLeft = (qdisPlayer.offsetWidth - clientWidth) / 2 - offsetX;
    parkingZone.scrollTop = (qdisPlayer.offsetHeight - clientHeight) / 2 - offsetY;

    console.log('offsetX = ' + offsetX);
    console.log('after scrollLeft = ' + parkingZone.scrollLeft + '   scrollTop = ' + parkingZone.scrollTop);

    drawMonitorModeArea(ctxMonitor);
}

/**
 * 스케일을 최소값으로 변경
 */
function setMonitorModeDefaultScale() {
    scale = ZOOM_OUT_MIN
    changeMonitorModePreviewSize()
}

/**
 * 모드에 따른 영역 그리기
 */
function drawMonitorModeArea(ctx) {
    ctx.clearRect(0, 0, canvasMonitor.width, canvasMonitor.height);

    ctx.lineWidth = pzCanvasSizeRatio / scale;

    for (var i = 0; i < monitorAreas.length; i++){           
        ctx.strokeStyle = 'yellow';
        ctx.fillStyle = 'yellow';

        drawMonitorPath(ctxMonitor, monitorAreas[i], i);
    }
}

/**
 * MODE_MONITOR 에서 영역 그리기
 * @param {*} ctx
 * @param {*} path 
 * @param {*} index 
 */
function drawMonitorPath(ctx, path, index){
    console.log('index', index, 'Monitor path', path);

    var radius = pzCanvasSizeRatio * 3 / scale;

    ctx.strokeStyle = path.color;
    ctx.fillStyle = path.color;

    if (path.path.length > 1) {
        ctx.beginPath();

        for (var i = 0; i < path.path.length; i++) {
            if (i == 0) {
                ctx.moveTo(path.path[i].x, path.path[i].y);
            } else if (i == path.path.length - 1) {
                ctx.lineTo(path.path[i].x, path.path[i].y);
                ctx.lineTo(path.path[0].x, path.path[0].y);
            } else {
                ctx.lineTo(path.path[i].x, path.path[i].y);
            }
        }

        ctx.stroke();

        if (path.path.length > 2) {
            var maxX = Number.MIN_SAFE_INTEGER;
            var minX = Number.MAX_SAFE_INTEGER;
            var maxY = Number.MIN_SAFE_INTEGER;
            var minY = Number.MAX_SAFE_INTEGER;
            var midX = 0;
            var midY = 0;

            ctx.beginPath();

            for (var i = 0; i < path.path.length; i++){
                maxX = Math.max(maxX, path.path[i].x);
                maxY = Math.max(maxY, path.path[i].y);

                minX = Math.min(minX, path.path[i].x);
                minY = Math.min(minY, path.path[i].y);

                midX = (maxX + minX) / 2;
                midY = (maxY + minY) / 2;
            }

            var fontSize = 14 * pzCanvasSizeRatio / scale;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = fontSize + 'px serif';

            var lineHeight = ctx.measureText('M').width;

            ctx.fillText(index + 1, midX, midY - lineHeight * 0.7);
            ctx.strokeText(index + 1, midX, midY - lineHeight * 0.7);
            ctx.fillText(path.value, midX, midY + lineHeight * 0.7);
            ctx.strokeText(path.value, midX, midY + lineHeight * 0.7);
        }
    } else if (path.path.length == 1) {
        ctx.beginPath();
        ctx.arc(path.path[0].x, path.path[0].y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * MODE_MONITOR 데이터 대입
 * @param {*} dataString 
 */
function setMonitorAreas(dataString){
    monitorAreas = JSON.parse(dataString).areas;
    areaIndex = -1;

    console.log('monitorAreas', monitorAreas);

    drawMonitorModeArea(ctxMonitor);
}

/**
 * 특정 인덱스의 MODE_MONITOR 데이터 대입
 * @param {number} index 
 * @param {*} area
 */
function setMonitorData(index, area) {
    if (index >= 0 && index < monitorAreas.length){
        monitorAreas[index] = area;
    }
}

/**
 * 특정 인덱스의 MODE_MONITOR 데이터 색상 대입
 * @param {number} index 
 * @param {*} color 색상 hex 또는 html color 이름
 */
 function setAreaColor(index, color) {
    if (index >= 0 && index < monitorAreas.length){
        monitorAreas[index].color = color;
    }
}

/**
 * MODE_MONITOR 데이터 value 대입
 * @param {number[]} value 
 */
 function setValues(value) {
    if (value.length == monitorAreas.length){
        for (var i = 0; i < value.length; i++) {
            monitorAreas[i].value = value[i];
        }
    }
}

/**
 * 테스트용 데이터 String 현재 MODE_MONITOR 진입시 자동 적용되어 화면에 표시됨
 */
function sendTestData(){
    dataString = '{"areas":[{"color":"red", "value":30, "path":[{"x":201,"y":141},{"x":505,"y":149},{"x":701,"y":601},{"x":206,"y":361}]},' 
    + '{"color":"blue", "value":20, "path":[{"x":611,"y":67},{"x":804,"y":63},{"x":763,"y":180},{"x":620,"y":202}]},'
    + '{"color":"#ff00ff", "value":10, "path":[{"x":698,"y":302},{"x":874,"y":247},{"x":2881,"y":379},{"x":707,"y":416}]},' 
    + '{"color":"#00ff00", "value":25, "path":[{"x":815,"y":557},{"x":771,"y":638},{"x":852,"y":713},{"x":858,"y":680},{"x":837,"y":581}]},' 
    + '{"color":"#00ffff", "value":32, "path":[{"x":322,"y":454},{"x":311,"y":534},{"x":362,"y":624},{"x":437,"y":688},{"x":256,"y":2697},{"x":193,"y":500}]}]}';
    setMonitorAreas(dataString);
}

/**
 * MODE_MONITOR 상태에서 test 버튼 누를 경우 5번 영역 데이터의 정보가 변경되도록 하는 테스터
 */
function inputMonitorTestData() {
    var area = '{"color":"red", "value":30, "path":[{"x":322,"y":454},{"x":311,"y":534},{"x":362,"y":624},{"x":437,"y":688},{"x":256,"y":697},{"x":193,"y":500}]}';
    setMonitorData(4, JSON.parse(area));

    console.log('monitorAreas', monitorAreas);

    drawMonitorModeArea(ctxMonitor);
}

/**
 * MODE_MONITOR 상태에서 test 버튼 누를 경우 value값이 일괄 변경되도록 하는 테스터
 */
 function valueTestData() {
    var value = '[24, 10, 23, 41, 543]';
    setValues(JSON.parse(value));

    console.log('value', value);

    drawMonitorModeArea(ctxMonitor);
}

/**
 * MODE_MONITOR 상태에서 test 버튼 누를 경우 5번 영역 데이터의 색상만이 변경되도록 하는 테스터
 */
 function colorTestData() {
    var color = 'deeppink';
    setAreaColor(4, color);

    console.log('monitorAreas', monitorAreas);

    drawMonitorModeArea(ctxMonitor);
}

/////////////////// 소켓 스트리밍 초기화 //////////////////
var hostName;
var channel;
var codec;
var wsPlayer;

function processFn(event) {
    console.log('processFn()', event);

    // if (!'data' in event)
    //     return;

    // var sJson = event.data;
    // console.log(sJson);

    // TODO : URL, 채널, 영상정보 수신부 구현 필요. 현재 임시 상수 적용 http://115.94.37.213:8085
    hostName = '115.94.37.213';
    channel = 'ch0';
    codec = 'H264';

    // hostName = sJson.ip;
    // channel = sJson.name;

    if (codec == 'H265') {
        console.log('codec is H265. show nothing');
        // player.stop();
    } else if (codec == 'H264') {
        console.log('codec is H264');
        console.log('window.WsPlayerBuilder is ', window.WsPlayerBuilder);

        if (window.WsPlayerBuilder) {
            // setPlayerSource('rtsp://' + hostName + '/' + channel);

            // Tab switching and window minimization processing 
            // for browsers that use the chrome rendering engine.
            if (!!window.chrome) {
                document.addEventListener('visibilitychange', function () {
                    if (document.visibilityState === 'hidden') {
                        console.log('visibilitychanged HIDDEN!');

                        if (wsPlayer) {
                            wsPlayer.stop();
                        }
                    } else {
                        console.log('visibilitychanged VISIBLE!');

                        setPlayerSource('rtsp://' + hostName + '/' + channel);
                    }
                });
            }
        }
    }
}

function setPlayerSource(newSource) {
    console.log('setPlayerSource() !!!');

    if (wsPlayer) {
        wsPlayer.destroy();
    }

    let errHandler = function (err) {
        alert(err.message);
    };

    let formatHandler = function (format) {
        if (qdisPlayer) {
            qdisPlayer.removeAttribute('hidden');
        }
    }

    var option = {
        socket: 'ws://' + hostName + ':8085/',
        // socket: 'ws://115.94.37.213:8088/',
        redirectNativeMediaErrors: true,
        bufferDuration: 120,
        errorHandler: errHandler,
        videoFormatHandler: formatHandler
    };

    qdisPlayer.src = newSource;

    qdisPlayer.onclick = (event) => {
        console.log('qdisPlayer.onclick !!!', event);
        event.preventDefault();
    }

    qdisPlayer.ondblclick = () => {
        console.log('qdisPlayer.ondblclick !!!');
        qdisPlayer.requestFullscreen().catch(err => {
            alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
        });
    }

    wsPlayer = null;
    wsPlayer = WsPlayerBuilder.builder(qdisPlayer, option);
}