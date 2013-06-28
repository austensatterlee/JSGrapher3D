/**
 * User: Austen
 * Date: 5/9/13
 * Time: 4:54 PM
 */

function makeBoundingBox(){

    var X_DISPLACE = AxesBounds["X_MAX"]-AxesBounds["X_MIN"];
    var Z_DISPLACE = AxesBounds["Z_MAX"]-AxesBounds["Z_MIN"];
    var Y_DISPLACE = AxesBounds["Y_MAX"]-AxesBounds["Y_MIN"];
    X_GEOMETRY = new THREE.PlaneGeometry(X_DISPLACE,Y_DISPLACE,X_DISPLACE,Y_DISPLACE);

    Z_GEOMETRY = new THREE.PlaneGeometry(Z_DISPLACE,Y_DISPLACE,Z_DISPLACE,Y_DISPLACE);


    var material = new THREE.MeshBasicMaterial( {color: 0xFFFFFF,wireframe:true,transparent:true, opacity: parseFloat($("#opacitySlider_value").text()), blending: THREE.NormalBlending } );

    var X_MESH = new THREE.Mesh(X_GEOMETRY, material);
    var Z_MESH = new THREE.Mesh(Z_GEOMETRY, material);
//    X_MESH.position.set(X_DISPLACE/2+AxesBounds["X_MIN"],Y_DISPLACE/2+AxesBounds["Y_MIN"],0);
//    Z_MESH.position.set(0,Y_DISPLACE/2+AxesBounds["Y_MIN"],Z_DISPLACE/2+AxesBounds["Z_MIN"]);
    Z_MESH.position.set(AxesBounds["X_MIN"],Y_DISPLACE/2+AxesBounds["Y_MIN"],(AxesBounds["Z_MIN"]+AxesBounds["Z_MAX"])/2);
    X_MESH.position.set((AxesBounds["X_MIN"]+AxesBounds["X_MAX"])/2,Y_DISPLACE/2+AxesBounds["Y_MIN"],AxesBounds["Z_MIN"]);
    Z_MESH.rotation.set(0,Math.PI/2,0);

    return [X_MESH,Z_MESH];
}

function makeAxesLines(){
    var X_DISPLACE = AxesBounds["X_MAX"]-AxesBounds["X_MIN"];
    var Z_DISPLACE = AxesBounds["Z_MAX"]-AxesBounds["Z_MIN"];
    var Y_DISPLACE = AxesBounds["Y_MAX"]-AxesBounds["Y_MIN"];

    var x_arrow = new THREE.ArrowHelper(new THREE.Vector3(AxesBounds["X_MAX"],0,0),new THREE.Vector3(AxesBounds["X_MIN"],0,0));
    var z_arrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,AxesBounds["Z_MAX"]),new THREE.Vector3(0,0,AxesBounds["Z_MIN"]));
    var y_arrow = new THREE.ArrowHelper(new THREE.Vector3(0,AxesBounds["Y_MAX"],0),new THREE.Vector3(0,AxesBounds["Y_MIN"],0));

    var X_GEOMETRY = new THREE.CylinderGeometry(0.05,0.05,X_DISPLACE,4,X_DISPLACE,false);
    var Z_GEOMETRY = new THREE.CylinderGeometry(0.05,0.05,Z_DISPLACE,4,Z_DISPLACE,false);
    var Y_GEOMETRY = new THREE.CylinderGeometry(0.05,0.05,Y_DISPLACE,4,Y_DISPLACE,false);

    var x_material = new THREE.MeshBasicMaterial({color:0xFFFF99,wireframe:false,transparent:true,opacity:1.0});
    var z_material = new THREE.MeshBasicMaterial({color:0xFF99FF,wireframe:false,transparent:true,opacity:1.0});
    var y_material = new THREE.MeshBasicMaterial({color:0x99FFFF,wireframe:false,transparent:true,opacity:1.0});

    var X_AXIS = new THREE.Mesh(X_GEOMETRY,x_material);
    var Z_AXIS = new THREE.Mesh(Z_GEOMETRY,z_material);
    var Y_AXIS = new THREE.Mesh(Y_GEOMETRY,y_material);

    X_AXIS.position.set(AxesBounds["X_MIN"]+X_DISPLACE/2,0,0);
    Z_AXIS.position.set(0,0,AxesBounds["Z_MIN"]+Z_DISPLACE/2);
    Y_AXIS.position.set(0,AxesBounds["Y_MIN"]+Y_DISPLACE/2,0);

    X_AXIS.rotation.set(0,0,Math.PI/2);
    Z_AXIS.rotation.set(Math.PI/2,0,0);
    Y_AXIS.rotation.set(0,0,0);

    return [Y_AXIS,X_AXIS,Z_AXIS];
}

function makeAxisLabels_old(){
    var labels = [];
    /* Make XZ-axis labels */
    var XZ_NUM = (AxesBounds["XZ_MAX"]-AxesBounds["XZ_MIN"])/AxesBounds["LABEL_SPACING"];
    for(var i=AxesBounds["XZ_MIN"];i<=AxesBounds["XZ_MAX"];i+=AxesBounds["LABEL_SPACING"]){
        var label = makeLabel(i,i,0,(AxesBounds["XZ_MAX"]-AxesBounds["XZ_MIN"]),1);
        //label.scale.set(1.0,1.0,1.0);
        labels.push(label);
    }
    /* Make Y-axis labels */
    var Y_NUM = (AxesBounds["Y_MAX"]-AxesBounds["Y_MIN"])/AxesBounds["LABEL_SPACING"];
    for(var i=AxesBounds["Y_MIN"];i<=AxesBounds["Y_MAX"];i+=AxesBounds["LABEL_SPACING"]){
        if(i!=0){
            var label = makeLabel(i,AxesBounds["XZ_MIN"],i,(AxesBounds["XZ_MAX"]-AxesBounds["XZ_MIN"]),1);
            //label.scale.set(1.0,1.0,1.0);
            labels.push(label);
        }
    }
    /* Make Z-axis labels */
//    for(var i=AxesBounds["XZ_MIN"];i<=AxesBounds["XZ_MAX"];i+=AxesBounds["LABEL_SPACING"]){
//        var label = makeLabel(i,(AxesBounds["XZ_MAX"]-AxesBounds["XZ_MIN"]),0,i,1);
//        //label.scale.set(1.0,1.0,1.0);
//        labels.push(label);
//    }
    return labels;
}

function makeLabel(text,posX,posY,posZ,size){
    var size = size*128;
    var canvas1 = document.createElement('canvas');
    canvas1.width=canvas1.height=250;
    var context1 = canvas1.getContext('2d');
    context1.font = size+"px Arial";
    context1.fillStyle = "rgba(255,255,255,0.95)";
    context1.fillText(text, 0, size);
    var metrics = context1.measureText(text);
    context1.strokeStyle = "rgba(255,255,255,0.95)";
    context1.lineWidth = 2;
    context1.moveTo(0,size/2);
    context1.lineTo(size,size/2);
    //context1.stroke();

    // canvas contents will be used for a texture
    var texture1 = new THREE.Texture(canvas1)
    texture1.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( { map: texture1, useScreenCoordinates: false, alignment: THREE.SpriteAlignment.center } );//useScreenCoordinates: false, alignment: THREE.SpriteAlignment.topLeft

    var sprite1 = new THREE.Sprite( spriteMaterial );
    //sprite1.scale.set(size,size,1.0);
    sprite1.position.set( posX,posY,posZ );
    return sprite1;
}

function setupInput(){
    $("#userInput").accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });
    $("#addEq_btn").button({icons: {
        primary: "ui-icon-circle-plus"
    },text:false});

    $("#remEq_btn").button({icons: {
        primary: "ui-icon-circle-minus"
    },text:false});
    $("#remEq_btn").css({'background': '#a32d00'});

    addSurface();
    $("#axesOpacity_slider").slider({
        min:0.0,
        max:1.0,
        value:1.0,
        step: 0.1,
        slide: changeAxesOpacity_event
    })

    for(var i=0;i<Object.keys(AxesBounds).length;i++){
        $("#"+Object.keys(AxesBounds)[i]).val(AxesBounds[Object.keys(AxesBounds)[i]]);
    }

    /* set up lighting variables from lighting dictionary */
    var $lightTab = $("#lighting_tab");
    for(var i=0;i<Object.keys(LightingVars).length;i++){
        var currKey = Object.keys(LightingVars)[i];
        var currVal = LightingVars[currKey];
        $("<span><label>"+currKey+"</label><input type='text' id='"+currKey+"' oninput=\"updateLighting('"+currKey+"')\"></span>").appendTo($lightTab);
        $("#"+currKey).val(currVal);
    }
}

function makeFunctionMesh(vShaderArray,dispOptsStr){
    if(!vShaderArray){
        vShaderArray = vertexShaderStr;
    }
    if(!dispOptsStr){
        dispOptsStr="";
    }

    var dispOpts = dispOptsStr.split(",");
    // create the grid's material

    var X_DISPLACE = -AxesBounds["X_MIN"];//+(AxesBounds["X_MAX"]-AxesBounds["X_MIN"])/2;
    var Z_DISPLACE = -AxesBounds["Z_MIN"];//+(AxesBounds["Z_MAX"]-AxesBounds["Z_MIN"])/2;
    /* Todo: fix vertex placement for boundary values indivisible by P_SPACING */
    var xNum = Math.ceil((AxesBounds["X_MAX"]-AxesBounds["X_MIN"])/AxesBounds["P_SPACING"]);
    var zNum = Math.ceil((AxesBounds["Z_MAX"]-AxesBounds["Z_MIN"])/AxesBounds["P_SPACING"]);

    shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            elapsedTime: {type: 'f', value: 0},
            cameraPos: {type: 'v3', value: [0,0,0]},
            spacing: {type: 'f', value: AxesBounds["P_SPACING"]},
            uNum: {type: 'f', value: xNum},
            vNum: {type: 'f', value: zNum},
            Y_BOUNDS: {type: 'v2',value: [AxesBounds.Y_MIN,AxesBounds.Y_MAX]},
            currHighlighted: {type: 'v2', value: []},
            /* Lighting uniforms */
            DIFFUSE_POWER: {type: 'f', value: 1.0},
            SPECULAR_POWER: {type: 'f', value: 1.0},
            SPECULAR_HARDNESS: {type: 'f', value: 1.0},
            LIGHT_Y : {type: 'f', value: 20.0}
        },
        attributes: {
            parameters: {type: 'v3', value: []},
            highlight: {type: 'v3', value: []}
        },
        vertexShader: vShaderArray.join(''),
        fragmentShader: $("#fragmentshader").text(),
        //blending: THREE.NormalBlending,
        transparent: false,
        wireframe: dispOpts.indexOf("wireframe")!=-1
    })

    gridGeometry = new THREE.Geometry();
    var count=0;
    for(var i=0;i<=xNum;i+=1){
        for(var j=0;j<=zNum;j+=1){
            var x=i*AxesBounds["P_SPACING"];
            var z=j*AxesBounds["P_SPACING"];
            gridGeometry.vertices.push(new THREE.Vector3(x-X_DISPLACE,count,z-Z_DISPLACE));
            shaderMaterial.attributes.parameters.value.push(new THREE.Vector3(i,j,count));
            shaderMaterial.attributes.highlight.value.push(new THREE.Vector3(0,0,0));
            if(i>0&&j>0){
                gridGeometry.faces.push(new THREE.Face3(count,count-1,count-zNum-1,new THREE.Vector3(0,1,0)));
                gridGeometry.faces.push(new THREE.Face3(count-zNum-1,count-1,count,new THREE.Vector3(0,-1,0)));

                gridGeometry.faces.push(new THREE.Face3(count-1,count-zNum-2,count-zNum-1,new THREE.Vector3(0,1,0)));
                gridGeometry.faces.push(new THREE.Face3(count-zNum-1,count-zNum-2,count-1,new THREE.Vector3(0,-1,0)));
            }
            count+=1;
        }
    }

    var gridObjPS;
    if(dispOpts.indexOf("ps")==-1)
        gridObjPS = new THREE.Mesh(gridGeometry, shaderMaterial );
    else
        gridObjPS = new THREE.ParticleSystem(gridGeometry,shaderMaterial);

    gridObjPS.position.set(0,0,0);
    gridObjPS.vShaderArray = vShaderArray.slice(0);
    gridObjPS.dispOptsStr = dispOptsStr;
    gridObjPS.material.uniforms.currHighlighted.value = new THREE.Vector2(1.0,1.0);
    gridObjPS.material.uniforms.currHighlighted.needsUpdate = true;
    //gridObjPS.xNum = xNum;
    //gridObjPS.zNum = zNum;
    return gridObjPS;
}