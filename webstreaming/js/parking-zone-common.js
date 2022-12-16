const ZOOM_OUT_MIN = 1;
const ZOOM_IN_MAX = 4;

var pzCanvasSizeRatio = 1; //에디팅 영역과 Canvas 크기의 비율
var scale = ZOOM_OUT_MIN; //확대/축소 시 스케일 펙터
var isMoved = false; //드래그 동작 체커
let pos = { top: 0, left: 0, x: 0, y: 0 };

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