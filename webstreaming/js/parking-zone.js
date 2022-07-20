const MODE_EDITOR = 0;
const MODE_MONITOR = 1;
const CAPTURE_IMG_URL = 'http://115.94.37.213:8080/video/capture?mode=0&rand=';

var areas = new Array();
var scale = 1;
var areaIndex = -1;
var areaSelector = new Array();
var currentMode = MODE_EDITOR;

var isMoved = false;
var isClosed = false;

let pos = { top: 0, left: 0, x: 0, y: 0 };

var parkingZone;
var qdisPlayer;
var captureImg;
var canvas;
var ctx;

var ctrlPannel;
var areaSelect;

var btnZoomIn;
var btnZoomOut;
var btnBack;
var btnClose;
var btnClear;
var btnAllClear;

var btnLoadImgFile;
var btnLoadCaptureImg;
var btnModeToggle;
var btnTest;

window.addEventListener('DOMContentLoaded', () => {
    init();
    processFn();
});

function init(){
    parkingZone = document.getElementById('parking-zone');
    qdisPlayer = document.getElementById('qdis-player');
    captureImg = document.getElementById('capture-img');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    ctrlPannel = document.getElementById('control-pannel');
    areaSelect = document.getElementById('area-select');
    
    btnZoomIn = document.getElementById('btn-zoom-in');
    btnZoomOut = document.getElementById('btn-zoom-out');
    btnBack = document.getElementById('btn-back');
    btnClose = document.getElementById('btn-close');
    btnClear = document.getElementById('btn-clear');
    btnAllClear = document.getElementById('btn-all-clear');
    
    btnLoadImgFile = document.getElementById('btn-load-img-file');
    btnLoadCaptureImg = document.getElementById('btn-load-capture-img');
    btnModeToggle = document.getElementById('btn-mode-toggle');
    btnTest = document.getElementById('btn-test');
    
    parkingZone.addEventListener('wheel', wheelScrollHandler, false);
    parkingZone.addEventListener('mousedown', mouseDownHandler, false);
    canvas.addEventListener('click', getClickPosition, false);
    btnZoomIn.addEventListener('click', btnZoomInOnClick, false);
    btnZoomOut.addEventListener('click', btnZoomOutOnClick, false);
    btnBack.addEventListener('click', btnBackOnClick, false);
    btnClose.addEventListener('click', btnCloseOnClick, false);
    btnClear.addEventListener('click', btnClearOnClick, false);
    btnAllClear.addEventListener('click', btnAllClearOnClick, false);
    
    btnLoadImgFile.addEventListener('click', openImgFile, false);
    btnLoadCaptureImg.addEventListener('click', () => {setCapturedImage(CAPTURE_IMG_URL + parseInt(Math.random() * 999999999999999))}, false);
    btnModeToggle.addEventListener('click', changeMode, false);
    btnTest.addEventListener('click', sendTestData, false);

    qdisPlayer.style.display = 'none';

    ctrlPannel.style.top = parkingZone.offsetTop + 'px';
    ctrlPannel.style.left = (parkingZone.offsetLeft + parkingZone.clientWidth - 90) + 'px';
    
    setCapturedImage(CAPTURE_IMG_URL + parseInt(Math.random() * 999999999999999));
}

function changeMode(){
    switch (currentMode) {
        case MODE_EDITOR:
            setPlayerSource('rtsp://' + hostName + '/' + channel);

            qdisPlayer.style.display = 'block';

            captureImg.style.display = 'none';
            ctrlPannel.style.display = 'none';
            //canvas.style.display = 'none';

            btnLoadImgFile.disabled = true;
            btnLoadCaptureImg.disabled = true;
            btnModeToggle.innerText = 'Editor Mode';

            currentMode = MODE_MONITOR;
            break;
        case MODE_MONITOR:
            if (wsPlayer) {
                wsPlayer.stop();
            }

            qdisPlayer.style.display = 'none';

            captureImg.style.display = 'block';
            ctrlPannel.style.display = 'block';
            //canvas.style.display = 'block';

            btnLoadImgFile.disabled = false;
            btnLoadCaptureImg.disabled = false;
            btnModeToggle.innerText = 'Monitor Mode';

            currentMode = MODE_EDITOR;
            break;
    }

    console.log('currentMode = ', currentMode);
}

function mouseDownHandler(e) {
    console.log('mouseDownHandler', e);

    pos = {
        left: parkingZone.scrollLeft,
        top: parkingZone.scrollTop,
        x: e.clientX,
        y: e.clientY,
    };

    parkingZone.addEventListener('mousemove', mouseMoveHandler, false);
    parkingZone.addEventListener('mouseup', mouseUpHandler, false);
}

function mouseMoveHandler(e) {
    console.log('mouseMoveHandler', e);
    
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    if (Math.pow(Math.pow(dx, 2) + Math.pow(dy, 2), 0.5) > 3) {
        parkingZone.scrollTop = pos.top - dy;
        parkingZone.scrollLeft = pos.left - dx;

        parkingZone.style.cursor = 'grabbing';
        parkingZone.style.userSelect = 'none';

        isMoved = true;
    }
};

function mouseUpHandler() {
    console.log('mouseUpHandler');

    parkingZone.removeEventListener('mousemove', mouseMoveHandler, false);
    parkingZone.removeEventListener('mouseup', mouseUpHandler, false);

    parkingZone.style.cursor = 'default';
    parkingZone.style.removeProperty('user-select');
};

function wheelScrollHandler(event) {
    console.log('zoom', event);
    if (event.altKey) {
        event.preventDefault();

        scale -= scale * event.deltaY * 0.001;

        if (scale > 4) scale = 4;
        else if (scale < 1) scale = 1;

        changePreviewSize(event.layerX, event.layerY);
    }
}

function btnZoomInOnClick() {
    scale++;

    if (scale > 4) {
        scale = 4;
    }

    changePreviewSize();
}

function btnZoomOutOnClick() {
    scale--;

    if (scale < 1) {
        scale = 1;            
    }

    changePreviewSize();
}

function btnBackOnClick() {
    if (areaIndex != -1) {
        if (areas[areaIndex].length > 1) {
            areas[areaIndex].pop();
        } else if (areas[areaIndex].length > 0) {
            areas[areaIndex].pop();            
        }

        console.log('areaIndex = ', areaIndex);
        
        drawArea();
    }
}

function selectArea(){
    for (var i = 0; i < areaSelector.length; i++) {
        areaSelector[i].removeEventListener('click', areaSelectorClicked, false);
        areaSelect.removeChild(areaSelector[i]);
    }
    
    areaSelector = new Array();

    for (var i = 0; i < areas.length; i++) {
        if (areas[i].length == 0) {
            console.log('empty areaIndex = ', i);

            var btn = document.createElement("button");
            
            btn.innerText = i + 1;
            btn.value = i;
            btn.style.width = '30px';
            btn.addEventListener('click', areaSelectorClicked, false);

            areaSelector.push(btn);
            areaSelect.appendChild(btn);
        }
    }

    console.log('areas = ', areas);
}

function btnCloseOnClick() {
    areaIndex = -1;

    selectArea();
    drawArea();
}

function areaSelectorClicked(event) {
    console.log(event.path[0].value);
    areaIndex = event.path[0].value;

    selectArea();
    drawArea();
}

function btnClearOnClick() {
    if (areaIndex == areas.length - 1) {
        areas.pop();
        areaIndex = -1;
    } else {
        areas.splice(areaIndex, 1, new Array());
    }

    console.log('btnClearOnClick() areaIndex = ', areaIndex, 'areas = ', areas);

    drawArea();
}

function btnAllClearOnClick() {
    areas = new Array();
    areaIndex = -1;

    drawArea();
}

function changePreviewSize(layerX, layerY) {
    var width = parkingZone.offsetWidth;
    var height = parkingZone.offsetHeight;
    var clientWidth = parkingZone.clientWidth;
    var clientHeight = parkingZone.clientHeight;
    var scrollLeft = parkingZone.scrollLeft;
    var scrollTop = parkingZone.scrollTop;

    console.log('before scrollLeft = ' + scrollLeft + '   scrollTop = ' + scrollTop + '   scale = ' + scale + '   layerX = ' + layerX + '   layerY = ' + layerY);

    // var offsetX = (captureImg.offsetWidth - clientWidth) / 2 - scrollLeft;
    // var offsetY = (captureImg.offsetHeight - clientHeight) / 2 - scrollTop;

    var offsetX;
    var offsetY;

    if (currentMode == MODE_EDITOR) {
        offsetX = (captureImg.offsetWidth - clientWidth) / 2 - scrollLeft;
        offsetY = (captureImg.offsetHeight - clientHeight) / 2 - scrollTop;
    } else {
        offsetX = (qdisPlayer.offsetWidth - clientWidth) / 2 - scrollLeft;
        offsetY = (qdisPlayer.offsetHeight - clientHeight) / 2 - scrollTop;
    }

    captureImg.style.width = width * scale + 'px';
    captureImg.style.height = height * scale + 'px';

    qdisPlayer.style.width = width * scale + 'px';
    qdisPlayer.style.height = height * scale + 'px';

    canvas.style.width = width * scale + 'px';
    canvas.style.height = height * scale + 'px';

    // parkingZone.scrollLeft = (captureImg.offsetWidth - clientWidth) / 2 - offsetX;
    // parkingZone.scrollTop = (captureImg.offsetHeight - clientHeight) / 2 - offsetY;

    if (currentMode == MODE_EDITOR) {
        parkingZone.scrollLeft = (captureImg.offsetWidth - clientWidth) / 2 - offsetX;
        parkingZone.scrollTop = (captureImg.offsetHeight - clientHeight) / 2 - offsetY;
    } else {
        parkingZone.scrollLeft = (qdisPlayer.offsetWidth - clientWidth) / 2 - offsetX;
        parkingZone.scrollTop = (qdisPlayer.offsetHeight - clientHeight) / 2 - offsetY;
    }

    console.log('offsetX = ' + offsetX);
    console.log('after scrollLeft = ' + parkingZone.scrollLeft + '   scrollTop = ' + parkingZone.scrollTop);
}

function getClickPosition(event) {
    if (!isMoved && currentMode == MODE_EDITOR) {
        var selectedAreaIndex = getSelectedAreaIndex(event);

        if (areaIndex < 0) {
            if (selectedAreaIndex > -1){
                areaIndex = selectedAreaIndex;
            } else {
                areas.push(new Array());
                areaIndex = areas.length - 1;               

                areas[areaIndex].push({x: Math.round(event.layerX / scale), y: Math.round(event.layerY / scale)});
            }
        } else {
            if (selectedAreaIndex > -1){
                areaIndex = selectedAreaIndex;
            } else {
                areas[areaIndex].push({x: Math.round(event.layerX / scale), y: Math.round(event.layerY / scale)});
            }
        }

        selectArea();
        drawArea();

        console.log('areaIndex = ', areaIndex, 'areas = ', areas);
    } else {
        isMoved = false;
    }
}

function drawArea() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (i = 0; i < areas.length; i++){
        if (i == areaIndex) {
            ctx.strokeStyle = 'red';
            ctx.fillStyle = 'red';
        } else {
            ctx.strokeStyle = 'yellow';
            ctx.fillStyle = 'yellow';
        }

        drawLine(areas[i], i);
    }
}

function drawLine(points, index){
    if (points.length > 1) {
        ctx.beginPath();

        for (var i = 0; i < points.length; i++) {
            if (i == 0) {
                ctx.moveTo(points[i].x, points[i].y);
            } else if (i == points.length - 1) {
                ctx.lineTo(points[i].x, points[i].y);
                ctx.lineTo(points[0].x, points[0].y);
            } else {
                ctx.lineTo(points[i].x, points[i].y);
            }
        }

        ctx.stroke();

        for(var i = 0; i < points.length; i++) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        if (points.length > 2) {
            var maxX = Number.MIN_SAFE_INTEGER;
            var minX = Number.MAX_SAFE_INTEGER;
            var maxY = Number.MIN_SAFE_INTEGER;
            var minY = Number.MAX_SAFE_INTEGER;
            var midX = 0;
            var midY = 0;

            ctx.beginPath();

            for (var i = 0; i < points.length; i++){
                maxX = Math.max(maxX, points[i].x);
                maxY = Math.max(maxY, points[i].y);

                minX = Math.min(minX, points[i].x);
                minY = Math.min(minY, points[i].y);

                midX = (maxX + minX) / 2;
                midY = (maxY + minY) / 2;
            }

            // console.log('maxX = ', maxX, 'maxY = ', maxY, 'minX = ', minX, 'minY = ', minY, 'midX = ', midX, 'midY = ', midY);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '20px serif';
            ctx.fillText(index + 1, midX, midY);
            ctx.strokeText(index + 1, midX, midY);
        }
    } else if (points.length == 1) {
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function getAreas(){
    var value = JSON.stringify(areas.slice());

    return value;
}

function setAreas(dataString){
    areas = JSON.parse(dataString);
    areaIndex = -1;

    drawArea();

    console.log('areas', areas);
}

function getCurrentArea(){
    return areaIndex;
}

function setCurrentArea(index){
    areaIndex = index;
}

function setCapturedImage(src){
    captureImg.src = src;
}

function sendTestData(){
    dataString = '[[{"x":201,"y":141},{"x":505,"y":149},{"x":501,"y":341},{"x":206,"y":361}],[{"x":611,"y":67},' 
        + '{"x":804,"y":63},{"x":763,"y":180},{"x":620,"y":202}],[{"x":698,"y":302},{"x":874,"y":247},'
        + '{"x":881,"y":379},{"x":707,"y":416}],[{"x":815,"y":557},{"x":771,"y":638},{"x":852,"y":713},' 
        + '{"x":858,"y":680},{"x":837,"y":581}],[{"x":322,"y":454},{"x":311,"y":534},{"x":362,"y":624},' 
        + '{"x":437,"y":688},{"x":256,"y":697},{"x":193,"y":500}]]';
    setAreas(dataString);
}

function openImgFile(){
    var input = document.createElement("input");
     
    input.type = "file";
    input.accept = "image/*";
    input.id = "uploadInput";
  
    input.click();
    input.onchange = function (event) {
        loadImage(event.target.files[0]);
    };
}

function loadImage(file){
    var reader = new FileReader();

    reader.onload = function () {
    	var result = reader.result;
        setCapturedImage(result);
    };

    reader.readAsDataURL(file);
}

function getSelectedAreaIndex(event){
    var result = -1;

    for (var i = 0; i < areas.length; i++){
        if (checkIsInsidePoint(areas[i], Math.round(event.layerX / scale), Math.round(event.layerY / scale))) {
            result = i;
            break;
        }
    }

    return result;
}

function checkIsInsidePoint(points, x, y) {    
    var inside = false;

    for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
        var xi = points[i].x, yi = points[i].y;
        var xj = points[j].x, yj = points[j].y;
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
    }
    
    return inside;
}

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
                    if (currentMode == MODE_MONITOR) {
                        if (document.visibilityState === 'hidden') {
                            console.log('visibilitychanged HIDDEN!');
    
                            if (wsPlayer) {
                                wsPlayer.stop();
                            }
                        } else {
                            console.log('visibilitychanged VISIBLE!');
    
                            setPlayerSource('rtsp://' + hostName + '/' + channel);
                        }
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
        socket: 'ws://' + hostName + ':8088/',
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