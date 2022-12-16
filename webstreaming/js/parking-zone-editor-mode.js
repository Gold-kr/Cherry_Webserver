const CAPTURE_IMG_URL = 'http://115.94.37.213:8085/video/capture?mode=0&rand=';
// const CAPTURE_IMG_URL = 'images/test_img.jpg';

var areaIndex = -1;//현재 선택된 영역 인덱스
var areaSelector = new Array();//데이터 없는 영역 버튼 유동적 생성정보 배열

var editAreas = new Array();//Edit Mode 영역 데이터

/**
 * 휠 스크롤을 통한 스케일 변경 컨트롤
 * @param {*} event 
 */
function editorModeWheelScrollHandler(event) {
    console.log('zoom', event);
    if (event.altKey) {
        event.preventDefault();

        scale -= scale * event.deltaY * 0.001;

        if (scale > ZOOM_IN_MAX) scale = ZOOM_IN_MAX;
        else if (scale < ZOOM_OUT_MIN) scale = ZOOM_OUT_MIN;

        changeEditorModePreviewSize();
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

    changeEditorModePreviewSize();
}

/**
 * btnZoomOut 클릭시 컨트롤
 */
function btnZoomOutOnClick() {
    scale--;

    if (scale < ZOOM_OUT_MIN) {
        scale = ZOOM_OUT_MIN;            
    }

    changeEditorModePreviewSize();
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
        drawEditorModeArea(ctxEditor);
    }
}

/**
 * btnEnter 클릭시 컨트롤
 */
function btnEnterOnClick() {
    areaIndex = -1;

    selectArea();
    drawEditorModeArea(ctxEditor);
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
    drawEditorModeArea(ctxEditor);
}

/**
 * btnAllClear 클릭시 동작
 */
function btnAllClearOnClick() {
    editAreas = new Array();
    areaIndex = -1;

    drawEditorModeArea(ctxEditor);
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
    drawEditorModeArea(ctxEditor);
}

/**
 * 스케일 조정된 이미지 화면 표시
 */
function changeEditorModePreviewSize() {
    var width = parkingZone.offsetWidth;
    var height = parkingZone.offsetHeight;
    var clientWidth = parkingZone.clientWidth;
    var clientHeight = parkingZone.clientHeight;
    var scrollLeft = parkingZone.scrollLeft;
    var scrollTop = parkingZone.scrollTop;

    console.log('before scrollLeft = ' + scrollLeft + '   scrollTop = ' + scrollTop + '   scale = ' + scale);

    var offsetX;
    var offsetY;

    offsetX = (captureImg.offsetWidth - clientWidth) / 2 - scrollLeft;
    offsetY = (captureImg.offsetHeight - clientHeight) / 2 - scrollTop;

    captureImg.style.width = width * scale + 'px';
    captureImg.style.height = height * scale + 'px';

    canvasEditor.style.width = width * scale + 'px';
    canvasEditor.style.height = height * scale + 'px';

    parkingZone.scrollLeft = (captureImg.offsetWidth - clientWidth) / 2 - offsetX;
    parkingZone.scrollTop = (captureImg.offsetHeight - clientHeight) / 2 - offsetY;

    console.log('offsetX = ' + offsetX);
    console.log('after scrollLeft = ' + parkingZone.scrollLeft + '   scrollTop = ' + parkingZone.scrollTop);

    drawEditorModeArea(ctxEditor);
}

/**
 * 클릭 이벤트 발생시 동작 정의
 * @param {*} event 
 */
function getClickPosition(event) {
    console.log('getClickPosition()');
    
    if (!isMoved) {
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
        drawEditorModeArea(ctxEditor);

        console.log('areaIndex = ', areaIndex, 'areas = ', editAreas);
    } else {
        isMoved = false;
    }
}

/**
 * 스케일을 최소값으로 변경
 */
function setEditorModeDefaultScale() {
    scale = ZOOM_OUT_MIN
    changeEditorModePreviewSize()
}

/**
 * 모드에 따른 영역 그리기
 */
function drawEditorModeArea(ctx) {
    ctx.clearRect(0, 0, canvasEditor.width, canvasEditor.height);

    ctx.lineWidth = pzCanvasSizeRatio / scale;

    for (var i = 0; i < editAreas.length; i++){
        if (i == areaIndex) {
            ctx.strokeStyle = 'red';
            ctx.fillStyle = 'red';               
        } else {
            ctx.strokeStyle = 'yellow';
            ctx.fillStyle = 'yellow';
        }            

        drawEditPath(ctxEditor, editAreas[i].path, i);
    }
}

/**
 * MODE_EDITOR 에서 영역 그리기
 */
function drawEditPath(ctx, points, index){
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

    dradrawEditorModeAreawArea(ctxEditor);
}

/**
 * 캡쳐이미지 표시
 * @param {url} src 
 */
function setCapturedImage(src){
    scale = ZOOM_OUT_MIN;
    changeEditorModePreviewSize();

    captureImg.src = src;
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