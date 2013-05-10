/**
 * User: Austen
 * Date: 3/6/13
 * Time: 1:51 PM
 * To change this template use File | Settings | File Templates.
 */
var MouseEnum = {
    LEFT : 1,
    MID : 2,
    RIGHT : 3,
    SCROLL: 4
}

/* Struct containing references to variables bound to specific mouse buttons
 * These variables will be changed when button they are bound to is clicked and the mouse is moved
 * Variables are bound to a MouseEnum
 */
var MouseVariableBindings = {
    1 : [],
    2 : [],
    3 : []
}

var ctx;

/* Creates a new mouseControlled variable and binds it to a specified button
 * Variables name is passed as a string
 * initVal can be any type
 * mouseEnum_BoundButton is a MouseEnum
 */
function mouseControlled(str_Name,num_initVal,mouseEnum_BoundButton){
    this.name = str_Name;
    this.val = num_initVal;
    if(mouseEnum_BoundButton!=null){
        MouseVariableBindings[mouseEnum_BoundButton].push(this);
    }
    this.toString = function(){
        return this.name+": "+this.val[0]+", "+this.val[1];
    }

}

function bindMouseVariable(mouseEnum_BoundButton,mouseControlled_var){
    MouseVariableBindings[mouseEnum_BoundButton].push(mouseControlled_var.name);
    BoundVariables[mouseControlled_var.name] = mouseControlled_var;
}

/* Event/input variables */
var mouseButtons=[];
var mouseClickPos = vec2.fromValues(0,0);

var onMouseDown = function(event){
    mouseButtons.push(event.button+1);
    lastMousePos = null;
    vec2.set(dVar,0,0);
    vec2.set(mouseClickPos,event.pageX,event.pageY);
}

var onMouseUp = function(event){
    /* Save final theta, phi values*/
    camAngles.finalTheta = camAngles.theta;
    camAngles.finalPhi = camAngles.phi;

    /* Remove all instances of released button from mouseButtons array */
    while(mouseButtons.indexOf(event.button+1)!=-1){
        mouseButtons.splice(mouseButtons.indexOf(event.button+1),1);
    }
}

function handleInputEvents(){
    if(mouseButtons.indexOf(MouseEnum.LEFT)!=-1){

    }

    if(mouseButtons.indexOf(MouseEnum.RIGHT)!=-1 && lastMousePos!=null){

    }
}

var lastMousePos = null;
var dMousePos = vec2.create();
var dVar = vec2.fromValues(0,0);

var onMouseMove = function(event){
    var currMousePos = vec2.fromValues(event.pageX,event.pageY);
    var dMousePosDir = vec2.create();
    var dMousePosSqr = vec2.create();
    if(lastMousePos!=null){
        vec2.sub(dMousePos,currMousePos,mouseClickPos);
        vec2.normalize(dMousePosDir,dMousePos);
        vec2.scale(dMousePosDir,dMousePosDir,10);

        if(mouseButtons.indexOf(MouseEnum.LEFT)!=-1){
            camAngles.theta = (camAngles.finalTheta-(dMousePos[0]));
            camAngles.phi = (camAngles.finalPhi+(dMousePos[1]));
            camAngles.phi = Math.min( 180, Math.max( 0, camAngles.phi ) );
            var theta = camAngles.theta * Math.PI / 360;
            var phi = camAngles.phi * Math.PI / 360;

            $("#genConsole").text("dMouse: "+"<"+dMousePos[0]+","+dMousePos[1]+">, Theta: "+camAngles.theta+" Phi: "+camAngles.phi);
            camera.position.z = CAM_RAD * Math.cos(phi)*Math.cos(theta);
            camera.position.x = CAM_RAD * Math.cos(phi)*Math.sin(theta);
            camera.position.y = CAM_RAD * Math.sin(phi);
            camera.lookAt(new THREE.Vector3(0,0,0));//new THREE.Vector3((AxesBounds["XZ_MAX"]-AxesBounds["XZ_MIN"])/2,0,(AxesBounds["XZ_MAX"]-AxesBounds["XZ_MIN"])/2));
            camera.updateMatrix();
        }
    }
    lastMousePos = currMousePos;
}

function mousewheel( event ) {
    event.preventDefault();
    event.stopPropagation();
    var delta = 0;
    if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
        delta = event.wheelDelta / 40;
    } else if ( event.detail ) { // Firefox
        delta = - event.detail / 3;
    }

    CAM_RAD += -delta;
    setCamera();
}

/* Sets the camera onto a sphere of radius CAM_RAD centered on the origin */
function setCamera(theta,phi){
    if(!theta){
        theta = camAngles.finalTheta;
    }
    if(!phi){
        phi = camAngles.finalPhi;
    }
    camera.position.z = CAM_RAD * Math.cos(phi*Math.PI/360)*Math.cos(theta*Math.PI/360);
    camera.position.x = CAM_RAD * Math.cos(phi*Math.PI/360)*Math.sin(theta*Math.PI/360);
    camera.position.y = CAM_RAD * Math.sin(phi*Math.PI/360);
    camera.lookAt(new THREE.Vector3(0,0,0));//new THREE.Vector3((AxesBounds["XZ_MAX"]-AxesBounds["XZ_MIN"])/2,0,(AxesBounds["XZ_MAX"]-AxesBounds["XZ_MIN"])/2));
    camera.updateMatrix();

    camAngles.finalTheta = theta;
    camAngles.finalPhi = phi;
}

function getSign(num){
    if(num>=0)
        return 1;
    if(num<0)
        return 0;
}

/* User input */
function changeBounds(){
    for(var i=0;i<Object.keys(AxesBounds).length;i++){
        var newVal = $("#"+Object.keys(AxesBounds)[i]).val();
        AxesBounds[Object.keys(AxesBounds)[i]] = parseFloat(newVal);
    }
    console.log(AxesBounds);
    scene.remove(boundingBox[0]);
    scene.remove(boundingBox[1]);
    for(var i=0;i<labels.length;i++){
        scene.remove(labels[i]);
    }
    for(var i=0;i<surfaceMeshes.length;i++){
        scene.remove(surfaceMeshes[i]);
    }

    for(var i=0;i<surfaceMeshes.length;i++){
        surfaceMeshes[i] = makeFunctionMesh(surfaceMeshes[i].vShaderArray,surfaceMeshes[i].dispOptsStr);
        scene.add(surfaceMeshes[i]);
    }
    boundingBox = makeBoundingBox();
    // add the mesh to the scene
    scene.add(boundingBox[0]);
    scene.add(boundingBox[1]);
}

var BTN_CSS = {'font' : 'inherit',
    'color' : 'inherit',
    'text-align' : 'left',
    'outline' : 'none',
    'cursor' : 'text'};

function addSurface(){
    var surfaceNum = surfaceMeshes.length;
    $newEqIn = $("<input type='text' id='eqIn"+surfaceNum+"' oninput='changeEq("+surfaceNum+")'>");
    $newEqIn.insertBefore('#addEq_btn');
    $newEqIn.button().css(BTN_CSS);

    $newDispSelector = $("<select id='eqDispSel"+surfaceNum+"' onchange='updateSurfaceMaterial("+surfaceNum+")'>"
    +"<option value='normal'>normal</option>"
    +"<option value='wireframe'>wireframe</option>"
    +"<option value='ps'>particles</option>"
    +"</select>");
    $newDispSelector.insertAfter($newEqIn);
    var newMesh = makeFunctionMesh();
    surfaceMeshes.push(newMesh);
    scene.add(newMesh);
}

function updateSurfaceMaterial(meshNum){
    var meshNum = parseInt(meshNum);
    scene.remove(surfaceMeshes[meshNum]);
    surfaceMeshes[meshNum] = makeFunctionMesh(surfaceMeshes[meshNum].vShaderArray,$("#eqDispSel"+meshNum).val());
    scene.add(surfaceMeshes[meshNum]);
}

function changeAxesOpacity(event, ui){
    $("#opacitySlider_value").text(ui.value);
    boundingBox[0].material.opacity = ui.value;
    boundingBox[0].material.needsUpdate = true;
    boundingBox[1].material.opacity = ui.value;
    boundingBox[1].material.needsUpdate = true;
}