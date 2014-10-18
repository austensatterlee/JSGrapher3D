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
    event.preventDefault();
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
    event.preventDefault();
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
            camAngles.phi = Math.min( 180, Math.max( -180, camAngles.phi ) );
            var theta = camAngles.theta * Math.PI / 360;
            var phi = camAngles.phi * Math.PI / 360;

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
    axesLines.forEach(function(e){scene.remove(e)});
    boundingBox.forEach(function(e){scene.remove(e)});
    for(var i=0;i<labels.length;i++){
        scene.remove(labels[i]);
    }
    for(var i=0;i<surfaceMeshes.length;i++){
        var currMesh = surfaceMeshes[i];
        surfaceMeshes[i] = makeFunctionMesh(currMesh.vShaderArray,currMesh.dispOptsStr);
        scene.remove(currMesh);
        delete(currMesh);
        scene.add(surfaceMeshes[i]);
    }

    axesLines = makeAxesLines();
    boundingBox = makeBoundingBox();
    // add the mesh to the scene
    axesLines.forEach(function(e){scene.add(e)});
    boundingBox.forEach(function(e){scene.add(e)});
    changeAxesOpacity($("#axesOpacity_slider").slider("value"));
}

var BTN_CSS = {'font' : 'inherit',
    'color' : 'inherit',
    'text-align' : 'left',
    'outline' : 'none',
    'cursor' : 'text'};

function addSurface(){
    var surfaceNum = surfaceMeshes.length;
    $newEqSpan = $("<span id='eqInSpan"+surfaceNum+"'></span>");
    $newEqSpan.insertBefore('#addRemEq_span');

    $newEqIn = $("<input type='text' id='eqIn"+surfaceNum+"' oninput='changeEq("+surfaceNum+")'>");
    $newEqIn.appendTo($newEqSpan);

    $newDispSelector = $("<select id='eqDispSel"+surfaceNum+"' onchange='updateSurfaceMaterial("+surfaceNum+")'>"
    +"<option value='normal'>normal</option>"
    +"<option value='wireframe'>wireframe</option>"
    +"<option value='ps'>particles</option>"
    +"</select>");
    $newDispSelector.appendTo($newEqSpan);

    var newMesh = makeFunctionMesh();
    surfaceMeshes.push(newMesh);
    scene.add(newMesh);
}

function deleteSurface(){
    var surfNum = surfaceMeshes.length-1;
    $("#eqInSpan"+surfNum).remove();
    scene.remove(surfaceMeshes[surfNum]);
    delete(surfaceMeshes.pop());
}

function updateSurfaceMaterial(meshNum){
    var meshNum = parseInt(meshNum);
    scene.remove(surfaceMeshes[meshNum]);
    surfaceMeshes[meshNum] = makeFunctionMesh(surfaceMeshes[meshNum].vShaderArray,$("#eqDispSel"+meshNum).val());
    scene.add(surfaceMeshes[meshNum]);
}

function changeAxesOpacity_event(event, ui){
    $("#opacitySlider_value").text(ui.value);
    changeAxesOpacity(ui.value);
}

function changeAxesOpacity(value){
    axesLines.forEach(
        function(e){
            e.material.opacity = value;
            e.material.needsUpdate = true;
        });
    boundingBox.forEach(
        function(e){
            e.material.opacity = value;
            e.material.needsUpdate = true;
        });
}

function updateLighting(lightingVar){
    for(var i=0;i<surfaceMeshes.length;i++){
        LightingVars[lightingVar] = $("#"+lightingVar).val();
    }
}