const MODE_EDITOR = 0;
const MODE_MONITOR = 1;
const CAPTURE_IMG_URL = 'http://115.94.37.213:8085/video/capture?mode=0&rand=';
// const CAPTURE_IMG_URL = 'images/test_img.jpg';
const ZOOM_OUT_MIN = 1;
const ZOOM_IN_MAX = 4;

var pzCanvasSizeRatio = 1;//에디팅 영역과 Canvas 크기의 비율
var editAreas = new Array();//Edit Mode 영역 데이터
var monitorAreas = new Array();//Monitor Mode 영역 데이터
var scale = ZOOM_OUT_MIN;//확대/축소 시 스케일 펙터
var areaIndex = -1;//현재 선택된 영역 인덱스
var areaSelector = new Array();//데이터 없는 영역 버튼 유동적 생성정보 배열
var currentMode = MODE_EDITOR;//현재 화면 모드

var isMoved = false;//드래그 동작 체커

let pos = { top: 0, left: 0, x: 0, y: 0 };

// var parkingZone;//영상 영역 <div>
// var qdisPlayer;//소켓 스트리밍 플레이어
// var captureImg;//캡쳐이미지 표시 <img>
// var canvas;//영역 표시 <canvas>
// var ctx;//canvas Context

// var ctrlPannel;//우상단 컨트롤 패널
// var areaSelect;//데이터 없는 영역 유동 버튼 배치 <div>

// var btnZoomIn;
// var btnZoomOut;
// var btnBack;
// var btnEnter;
// var btnClear;
// var btnAllClear;

// var btnLoadImgFile;
// var btnLoadCaptureImg;
// var btnModeToggle;
// var btnTest;

// window.addEventListener('DOMContentLoaded', () => {
//     init();
//     processFn();
// });

/**
 * 각종 html Element 초기화 및 바인딩
 */
// function init(){
//     parkingZone = document.getElementById('parking-zone');
//     qdisPlayer = document.getElementById('qdis-player');
//     captureImg = document.getElementById('capture-img');
//     canvas = document.getElementById('canvas');
//     ctx = canvas.getContext('2d');
    
//     pzCanvasSizeRatio = canvas.offsetWidth / parkingZone.offsetWidth;

//     console.log('pzCanvasSizeRatio =', pzCanvasSizeRatio, 'canvas.offsetWidth =', canvas.offsetWidth, 'parkingZone.offsetWidth =', parkingZone.offsetWidth);

//     // canvas 크기를 편집창 사이즈에 맞춰 조정
//     canvas.style.width = parkingZone.offsetWidth + 'px';
//     canvas.style.height = parkingZone.offsetHeight + 'px';
    
//     ctrlPannel = document.getElementById('control-pannel');
//     areaSelect = document.getElementById('area-select');
    
//     btnZoomIn = document.getElementById('btn-zoom-in');
//     btnZoomOut = document.getElementById('btn-zoom-out');
//     btnBack = document.getElementById('btn-back');
//     btnEnter = document.getElementById('btn-close');
//     btnClear = document.getElementById('btn-clear');
//     btnAllClear = document.getElementById('btn-all-clear');
    
//     btnLoadImgFile = document.getElementById('btn-load-img-file');
//     btnLoadCaptureImg = document.getElementById('btn-load-capture-img');
//     btnModeToggle = document.getElementById('btn-mode-toggle');
//     btnTest = document.getElementById('btn-test');
    
//     parkingZone.addEventListener('wheel', wheelScrollHandler, false);
//     parkingZone.addEventListener('mousedown', mouseDownHandler, false);
//     captureImg.addEventListener('load', () => {
//         // 이미지 로드 완료 이벤트 리스너        
//     }, false);
//     canvas.addEventListener('click', getClickPosition, false);
//     btnZoomIn.addEventListener('click', btnZoomInOnClick, false);
//     btnZoomOut.addEventListener('click', btnZoomOutOnClick, false);
//     btnBack.addEventListener('click', btnBackOnClick, false);
//     btnEnter.addEventListener('click', btnEnterOnClick, false);
//     btnClear.addEventListener('click', btnClearOnClick, false);
//     btnAllClear.addEventListener('click', btnAllClearOnClick, false);
    
//     btnLoadImgFile.addEventListener('click', openImgFile, false);
//     btnLoadCaptureImg.addEventListener('click', () => {setCapturedImage(CAPTURE_IMG_URL + parseInt(Math.random() * 999999999999999))}, false);
//     btnModeToggle.addEventListener('click', changeMode, false);
//     btnTest.addEventListener('click', getAreas, false);

//     qdisPlayer.style.display = 'none';

//     ctrlPannel.style.top = parkingZone.offsetTop + 'px';
//     ctrlPannel.style.left = (parkingZone.offsetLeft + parkingZone.clientWidth - 90) + 'px';
    
//     setCapturedImage(CAPTURE_IMG_URL + parseInt(Math.random() * 999999999999999));
// }

/**
 * 모드 체인지시 동작 컨트롤
 */
function changeMode(){
    switch (currentMode) {
        case MODE_EDITOR:
            setPlayerSource('rtsp://' + hostName + '/' + channel);

            qdisPlayer.style.display = 'block';

            captureImg.style.display = 'none';
            ctrlPannel.style.display = 'none';

            btnLoadImgFile.disabled = true;
            btnLoadCaptureImg.disabled = true;
            btnModeToggle.innerText = 'Editor Mode';

            // Monitor 데이터 수신부 적용 필요
            sendTestData();

            currentMode = MODE_MONITOR;
            break;
        case MODE_MONITOR:
            if (wsPlayer) {
                wsPlayer.stop();
            }

            qdisPlayer.style.display = 'none';

            captureImg.style.display = 'block';
            ctrlPannel.style.display = 'block';

            btnLoadImgFile.disabled = false;
            btnLoadCaptureImg.disabled = false;
            btnModeToggle.innerText = 'Monitor Mode';

            currentMode = MODE_EDITOR;
            break;
    }

    drawArea();

    console.log('currentMode = ', currentMode);
}

/**
 * 마우스 터치 발생시 동작 컨트롤
 * @param {*} e 
 */
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

/**
 * 마우스 이동시 동작 컨트롤
 * @param {*} e 
 */
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

/**
 * 마우스 릴리즈 시 동작 컨트롤
 */
function mouseUpHandler() {
    console.log('mouseUpHandler');

    parkingZone.removeEventListener('mousemove', mouseMoveHandler, false);
    parkingZone.removeEventListener('mouseup', mouseUpHandler, false);

    parkingZone.style.cursor = 'default';
    parkingZone.style.removeProperty('user-select');
};

/**
 * 휠 스크롤을 통한 스케일 변경 컨트롤
 * @param {*} event 
 */
function wheelScrollHandler(event) {
    console.log('zoom', event);
    if (event.altKey) {
        event.preventDefault();

        scale -= scale * event.deltaY * 0.001;

        if (scale > ZOOM_IN_MAX) scale = ZOOM_IN_MAX;
        else if (scale < ZOOM_OUT_MIN) scale = ZOOM_OUT_MIN;

        changePreviewSize();
    }
}

/**
 * btnZoomIn 클릭시 컨트롤
 */
function btnZoomInOnClick() {
    scale++;

    if (scale > ZOOM_IN_MAX) {
        scale = ZOOM_IN_MAX;
    }

    changePreviewSize();
}

/**
 * btnZoomOut 클릭시 컨트롤
 */
function btnZoomOutOnClick() {
    scale--;

    if (scale < ZOOM_OUT_MIN) {
        scale = ZOOM_OUT_MIN;            
    }

    changePreviewSize();
}

/**
 * btnBack 클릭시 컨트롤
 */
function btnBackOnClick() {
    if (areaIndex != -1) {
        if (editAreas[areaIndex].path.length > 1) {
            editAreas[areaIndex].path.pop();
        } else if (editAreas[areaIndex].path.length > 0) {
            editAreas[areaIndex].path.pop();            
        }

        console.log('areaIndex = ', areaIndex);
        
        selectArea();
        drawArea();
    }
}

/**
 * btnEnter 클릭시 컨트롤
 */
function btnEnterOnClick() {
    areaIndex = -1;

    selectArea();
    drawArea();
}

/**
 * btnClear 클릭시 동작
 */
function btnClearOnClick() {
    console.log('before btnClearOnClick() areaIndex = ', areaIndex, 'areas = ', editAreas);

    if (areaIndex == editAreas.length - 1) {
        editAreas.pop();
        areaIndex = -1;
    } else {
        editAreas.splice(areaIndex, 1, {path: new Array()});
    }

    console.log('after btnClearOnClick() areaIndex = ', areaIndex, 'areas = ', editAreas);

    selectArea();
    drawArea();
}

/**
 * btnAllClear 클릭시 동작
 */
function btnAllClearOnClick() {
    editAreas = new Array();
    areaIndex = -1;

    drawArea();
}

/**
 * 데이터 없는 영역 버튼 유동적 생성
 */
function selectArea(){
    for (var i = 0; i < areaSelector.length; i++) {
        areaSelector[i].removeEventListener('click', areaSelectorClicked, false);
        areaSelect.removeChild(areaSelector[i]);
    }
    
    areaSelector = new Array();

    for (var i = 0; i < editAreas.length; i++) {
        if (editAreas[i].path.length < 3) {
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

    console.log('areas = ', editAreas);
}

/**
 * 데이터 없는 영역 버튼 클릭시 areaIndex 변경
 * @param {*} event 
 */
function areaSelectorClicked(event) {
    console.log(event.path[0].value);
    areaIndex = event.path[0].value;

    selectArea();
    drawArea();
}

/**
 * 스케일 조정된 이미지 화면 표시
 */
function changePreviewSize() {
    var width = parkingZone.offsetWidth;
    var height = parkingZone.offsetHeight;
    var clientWidth = parkingZone.clientWidth;
    var clientHeight = parkingZone.clientHeight;
    var scrollLeft = parkingZone.scrollLeft;
    var scrollTop = parkingZone.scrollTop;

    console.log('before scrollLeft = ' + scrollLeft + '   scrollTop = ' + scrollTop + '   scale = ' + scale);

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

    if (currentMode == MODE_EDITOR) {
        parkingZone.scrollLeft = (captureImg.offsetWidth - clientWidth) / 2 - offsetX;
        parkingZone.scrollTop = (captureImg.offsetHeight - clientHeight) / 2 - offsetY;
    } else {
        parkingZone.scrollLeft = (qdisPlayer.offsetWidth - clientWidth) / 2 - offsetX;
        parkingZone.scrollTop = (qdisPlayer.offsetHeight - clientHeight) / 2 - offsetY;
    }

    console.log('offsetX = ' + offsetX);
    console.log('after scrollLeft = ' + parkingZone.scrollLeft + '   scrollTop = ' + parkingZone.scrollTop);

    drawArea();
}

/**
 * 클릭 이벤트 발생시 동작 정의
 * @param {*} event 
 */
function getClickPosition(event) {
    if (!isMoved && currentMode == MODE_EDITOR) {
        var selectedAreaIndex = getSelectedAreaIndex(event);

        if (areaIndex < 0) {
            if (selectedAreaIndex > -1){
                areaIndex = selectedAreaIndex;
            } else {
                editAreas.push({path: new Array()});
                areaIndex = editAreas.length - 1;               

                editAreas[areaIndex].path.push({x: Math.round(event.layerX / scale * pzCanvasSizeRatio), y: Math.round(event.layerY / scale * pzCanvasSizeRatio)});
            }
        } else {
            if (selectedAreaIndex > -1 && areaIndex != selectedAreaIndex){
                areaIndex = selectedAreaIndex;
            } else {
                editAreas[areaIndex].path.push({x: Math.round(event.layerX / scale * pzCanvasSizeRatio), y: Math.round(event.layerY / scale * pzCanvasSizeRatio)});
            }
        }

        selectArea();
        drawArea();

        console.log('areaIndex = ', areaIndex, 'areas = ', editAreas);
    } else {
        isMoved = false;
    }
}

/**
 * 모드에 따른 영역 그리기
 */
function drawArea() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = pzCanvasSizeRatio / scale;

    if (currentMode == MODE_EDITOR) {
        for (var i = 0; i < editAreas.length; i++){
            if (i == areaIndex) {
                ctx.strokeStyle = 'red';
                ctx.fillStyle = 'red';               
            } else {
                ctx.strokeStyle = 'yellow';
                ctx.fillStyle = 'yellow';
            }            
    
            drawEditPath(editAreas[i].path, i);
        }
    } else {
        for (var i = 0; i < monitorAreas.length; i++){           
            ctx.strokeStyle = 'yellow';
            ctx.fillStyle = 'yellow';

            drawMonitorPath(monitorAreas[i], i);
        }
    }
}

/**
 * MODE_EDITOR 에서 영역 그리기
 */
function drawEditPath(points, index){
    console.log('index', index, 'points', points);

    var radius = pzCanvasSizeRatio * 3 / scale;

    if (points.length > 1) {
        ctx.beginPath();

        for (var i = 0; i < points.length; i++) {
            if (i == 0) {
                ctx.moveTo(points[i].x, points[i].y);
            } else if (i == points.length - 1) {
                ctx.lineTo(points[i].x, points[i].y);

                if (index != areaIndex) {                    
                    ctx.lineTo(points[0].x, points[0].y);
                }
            } else {
                ctx.lineTo(points[i].x, points[i].y);
            }
        }

        ctx.stroke();

        for(var i = 0; i < points.length; i++) {
            if (areaIndex == index) {
                ctx.beginPath();
                ctx.arc(points[i].x, points[i].y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
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

            var fontSize = 16 * pzCanvasSizeRatio / scale;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = fontSize + 'px serif';
            ctx.fillText(index + 1, midX, midY);
            ctx.strokeText(index + 1, midX, midY);
        }
    } else if (points.length == 1) {
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * MODE_MONITOR 에서 영역 그리기
 * @param {*} path 
 * @param {*} index 
 */
function drawMonitorPath(path, index){
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
 * MODE_EDITOR 데이터 반환
 * @returns {JSONstring} MODE_EDITOR 데이터
 */
function getAreas(){
    // 배열의 깊은 복사
    var temp = JSON.stringify(editAreas.slice());
    var value = JSON.parse(temp);

    // 점 3개 미만은 좌표 삭제
    for (var i = 0; i < value.length; i++) {
        if (value[i].path.length < 3) {
            value[i].path = new Array();
        }
    }

    console.log('value', value);

    return JSON.stringify(value);
}

/**
 * MODE_EDITOR 데이터 대입
 * @param {JSONstring} dataString 
 */
function setEditAreas(dataString){
    editAreas = JSON.parse(dataString).areas;
    areaIndex = -1;

    console.log('editAreas', editAreas);

    drawArea();
}

/**
 * MODE_MONITOR 데이터 대입
 * @param {*} dataString 
 */
function setMonitorAreas(dataString){
    monitorAreas = JSON.parse(dataString).areas;
    areaIndex = -1;

    console.log('monitorAreas', monitorAreas);

    drawArea();
}

/**
 * 캡쳐이미지 표시
 * @param {url} src 
 */
function setCapturedImage(src){
    scale = ZOOM_OUT_MIN;
    changePreviewSize();

    captureImg.src = src;
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

    drawArea();
}

/**
 * MODE_MONITOR 상태에서 test 버튼 누를 경우 value값이 일괄 변경되도록 하는 테스터
 */
 function valueTestData() {
    var value = '[24, 10, 23, 41, 543]';
    setValues(JSON.parse(value));

    console.log('value', value);

    drawArea();
}

/**
 * MODE_MONITOR 상태에서 test 버튼 누를 경우 5번 영역 데이터의 색상만이 변경되도록 하는 테스터
 */
 function colorTestData() {
    var color = 'deeppink';
    setAreaColor(4, color);

    console.log('monitorAreas', monitorAreas);

    drawArea();
}

/**
 * 저장장치의 이미지 파일을 선택하여 Load
 */
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

/**
 * 선택된 이미지파일을 로드하여 화면에 표시
 * @param {*} file 
 */
function loadImage(file){
    var reader = new FileReader();

    reader.onload = function () {
    	var result = reader.result;
        setCapturedImage(result);
    };

    reader.readAsDataURL(file);
}

/**
 * 영역 내부 선택시 영역 선택된 영역의 인덱스를 반환
 * @param {*} event 
 * @returns 
 */
function getSelectedAreaIndex(event){
    var result = -1;

    for (var i = 0; i < editAreas.length; i++){
        if (checkIsInsidePoint(editAreas[i].path, Math.round(event.layerX / scale * pzCanvasSizeRatio), Math.round(event.layerY / scale * pzCanvasSizeRatio))) {
            result = i;
            break;
        }
    }

    return result;
}

/**
 * 주어진 점이 지정된 경로 내부의 점인지 확인하여 여부를 반환
 * @param {*} points 
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
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

    // TODO : URL, 채널, 영상정보 수신부 구현 필요. 현재 임시 상수 적용
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