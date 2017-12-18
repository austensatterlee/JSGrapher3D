var USE_SHADERS = true;
// set the scene size
var WIDTH = 1024,
    HEIGHT = 768;

/* Graph parameters */
var AxesBounds={
    "Y_MAX" : 10,
    "Y_MIN" : -10,
    "X_MAX" : 10,
    "X_MIN" : -10,
    "Z_MAX" : 10,
    "Z_MIN" : -10,
    "LABEL_SPACING" : 1,
    "P_SPACING" : 0.1
}

var LightingVars={
    DIFFUSE_POWER: 5.0,
    SPECULAR_POWER: 1.0,
    SPECULAR_HARDNESS: 10.0
}

var CAM_RAD = Math.sqrt(Math.pow(AxesBounds["X_MAX"],2)+Math.pow(AxesBounds["Z_MAX"],2))/(Math.PI/4)*3;

/* Camera constants */
var camAngles = {
    theta: 0,
    phi: 0,
    finalTheta: 0,
    finalPhi: Math.asin(0),
    zAccel: 0,
    zVel: 0
}

// set some camera attributes
var VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 15000;

var vertexShaderStr =[
    "#ifdef GL_ES\n",
    "precision highp float;\n",
    "#endif\n",
    "varying vec3 pos;\n",
    "varying vec3 vNormal;\n",
    "varying vec3 vParameters;\n",
    "varying vec3 vHighlight;\n",
    "uniform float elapsedTime;\n",
    "uniform vec3 cameraPos;\n",
    "uniform float spacing;\n",
    "uniform float uNum;\n",
    "uniform float vNum;\n",
    "uniform vec2 Y_BOUNDS;\n",
    "uniform vec2 currHighlighted;\n",
    "attribute vec3 parameters;\n",
    "attribute vec3 highlight;\n",
    "vec3 computeNewPos(vec3 oldPos){\n",
    "float x = oldPos.x;\n",
    "float y = oldPos.y;\n",
    "float z = oldPos.z;\n",
    "float t = elapsedTime;\n",
    "return vec3(",
    "x",",",
    "0",",",
    "z",
    ");\n}",
    "vec3 computeNormal(){\n",
    "    vec3 curr = computeNewPos(position);\n",
    "    vec3 dX = computeNewPos(position+vec3(spacing,0,0));\n",
    "    vec3 dZ = computeNewPos(position+vec3(0,0,spacing));\n",
    "    vec3 n = cross((dZ-curr)/spacing,(dX-curr)/spacing);",
    "    return n;\n",
    "}\n",
    "void main(){\n",
    "vec3 newPos = computeNewPos(position);\n",
    "vNormal = computeNormal();\n",
    "vParameters = parameters;\n",
    "vHighlight = highlight;\n",
    "pos = newPos;\n",
    "float camDist = abs(pow(cameraPos.x,2.0)+pow(cameraPos.y,2.0)+pow(cameraPos.z,2.0));\n",
    "float dist = abs(pow(pos.x-cameraPos.x,2.0)+pow(pos.y-cameraPos.y,2.0)+pow(pos.z-cameraPos.z,2.0));",
    "gl_PointSize = 2.5*camDist/dist;\n",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos,1.0);}\n"
    ];

var Timer = function(timeSpeed){
    this.startTime = new Date().getTime();
    this.timeSpeed = timeSpeed;
    this.getElapsed = function(){
        var currTime = new Date().getTime();
        var deltaTime = currTime-this.startTime;
        return deltaTime*this.timeSpeed;
    }
    this.reset = function(){
        this.startTime = new Date().getTime();
    }
}
var AppTimer = new Timer(.001);


var renderer, camera, scene, surfaceMeshes, axesLines, boundingBox, labels;

function load(){
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    ASPECT = WIDTH / HEIGHT;
    // get the DOM element to attach to
    var $container = $('#container');

    // create a WebGL renderer, camera
    // and a scene
    renderer = new THREE.WebGLRenderer();
    // start the renderer
    renderer.setSize(WIDTH,HEIGHT);
    // attach the render-supplied DOM element
    //$container.width(WIDTH);
    //$container.height(HEIGHT);
    $container.append(renderer.domElement);

    camera = new THREE.PerspectiveCamera(  VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR  );
    // the camera starts at 0,0,0 so pull it back
    camera.position.set(0,0,0);
    setCamera(0,45);
    THREEx.WindowResize(renderer, camera);

    scene = new THREE.Scene();

    surfaceMeshes = [];
    axesLines = makeAxesLines();
    boundingBox = makeBoundingBox();
    labels = [];//makeAxisLabels();

    // and the camera
    scene.add(camera);
    axesLines.forEach(function(e){scene.add(e)});
    boundingBox.forEach(function(e){scene.add(e)});
    for(var i=0;i<labels.length;i++){
        scene.add(labels[i]);
    }
    $container.mousedown(onMouseDown);
    $container.mouseup(onMouseUp);
    $container.mousemove(onMouseMove);
    document.getElementById('container').addEventListener( 'mousewheel', mousewheel, false );
    document.getElementById('container').addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

    /* Set up jQuery UI Input */
    setupInput();

    /* Begin draw loop */
    requestAnimationFrame(draw);
}
var count=0;
function draw(){
    /* Give updated elapsed time to shader */
    if(USE_SHADERS){
        for(var i=0;i<surfaceMeshes.length;i++){
            surfaceMeshes[i].material.uniforms.elapsedTime.value = AppTimer.getElapsed();
            surfaceMeshes[i].material.uniforms.cameraPos.value = camera.position;
            surfaceMeshes[i].material.uniforms.Y_BOUNDS.value = new THREE.Vector2(AxesBounds.Y_MIN,AxesBounds.Y_MAX);
            /* update lighting */
            for(var j=0;j<Object.keys(LightingVars).length;j++){
                var currKey = Object.keys(LightingVars)[j];
                var currVal = LightingVars[currKey];
                surfaceMeshes[i].material.uniforms[currKey].value = currVal;
            }
        }
    }
    count+=5;
    if(count>surfaceMeshes[0].geometry.vertices.length)
        count=0;
    surfaceMeshes[0].material.uniforms.currHighlighted.value = new THREE.Vector2(surfaceMeshes[0].geometry.vertices[count].x,surfaceMeshes[0].geometry.vertices[count].z);
    // draw!
    try {
        renderer.render(scene, camera);
    } catch (e) {
    }
    requestAnimationFrame(draw);
}

function changeEq(meshNum){
    if(USE_SHADERS)
        changeEq_Shader(meshNum);
    else
        changeEq_Manual();
}

function changeEq_Shader(meshNum){
    var meshNum = parseInt(meshNum);
    var EQ_LINE = 22;
    var VAR_MAPPING = {'x':0,'y':2,'z':4};
    var newEq = $("#eqIn"+meshNum).val();
    var system = newEq.split(";");
    /* Set to defaults first */
    var vertexShaderArray = surfaceMeshes[meshNum].vShaderArray;
    vertexShaderArray[EQ_LINE+VAR_MAPPING['x']]='x';
    vertexShaderArray[EQ_LINE+VAR_MAPPING['y']]='y';
    vertexShaderArray[EQ_LINE+VAR_MAPPING['z']]='z';
    for(var i=0;i<system.length;i++){
        var eqArray = system[i].split("=");
        if(eqArray.length>1){
            var eq = eqArray[1];
            eq = eq.replace(/u/g,"x");
            eq = eq.replace(/v/g,"z");
            vertexShaderArray[EQ_LINE+VAR_MAPPING[eqArray[0]]] = eq;
        }
    }
    surfaceMeshes[meshNum].material.vertexShader = vertexShaderArray.join('');
    surfaceMeshes[meshNum].material.needsUpdate = true;
    AppTimer.reset();
}

function changeEq_Manual(){
    for(var i=0;i<surfaceMeshes.geometry.vertices.length;i++){
        var x = surfaceMeshes.geometry.vertices[i].x;
        var z = surfaceMeshes.geometry.vertices[i].z;
        var t = AppTimer.getElapsed();
        surfaceMeshes.geometry.vertices[i].y = 10*Math.sin(.25*x+t)+10*Math.cos(.25*z+t);
    }
    surfaceMeshes.geometry.verticesNeedUpdate = true;
}

