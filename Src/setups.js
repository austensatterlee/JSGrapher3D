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

    var material = new THREE.MeshBasicMaterial( {color: 0xFFFFFF,wireframe:true,transparent:true, opacity: 1.0, blending: THREE.NormalBlending } );

    var X_MESH = new THREE.Mesh(X_GEOMETRY, material);
    var Z_MESH = new THREE.Mesh(Z_GEOMETRY, material);
    X_MESH.position.set(X_DISPLACE/2+AxesBounds["X_MIN"],Y_DISPLACE/2+AxesBounds["Y_MIN"],0);
    Z_MESH.position.set(0,Y_DISPLACE/2+AxesBounds["Y_MIN"],Z_DISPLACE/2+AxesBounds["Z_MIN"]);
    Z_MESH.rotation.set(0,Math.PI/2,0);

    return [X_MESH,Z_MESH];
}

function makeAxisLabels(){
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
    $("button").button();
    addSurface();
    $("#axesOpacity_slider").slider({
        min:0.0,
        max:1.0,
        value:1.0,
        step: 0.1,
        slide: changeAxesOpacity
    })

    for(var i=0;i<Object.keys(AxesBounds).length;i++){
        $("#"+Object.keys(AxesBounds)[i]).val(AxesBounds[Object.keys(AxesBounds)[i]]);
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
    basicMaterial = new THREE.MeshLambertMaterial(
        {
            color: 0xFFAAAAFF,
            blending: THREE.AdditiveBlending,
            transparent: false
        });
    shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            elapsedTime: {type: 'f', value: 0},
            cameraPos: {type: 'v3', value: [0,0,0]}
        },
        attributes: {
            parameters: {type: 'v2', value: [0,0]}
        },
        vertexShader: vShaderArray.join(''),
        fragmentShader: $("#fragmentshader").text(),
        //blending: THREE.NormalBlending,
        transparent: false,
        wireframe: dispOpts.indexOf("wireframe")!=-1
    })

    gridGeometry = new THREE.Geometry();
    var X_DISPLACE = -AxesBounds["X_MIN"];//+(AxesBounds["X_MAX"]-AxesBounds["X_MIN"])/2;
    var Z_DISPLACE = -AxesBounds["Z_MIN"];//+(AxesBounds["Z_MAX"]-AxesBounds["Z_MIN"])/2;
    var xNum = (AxesBounds["X_MAX"]-AxesBounds["X_MIN"])/AxesBounds["P_SPACING"];
    var zNum = (AxesBounds["Z_MAX"]-AxesBounds["Z_MIN"])/AxesBounds["P_SPACING"];
    var count=0;
    //var P_NUM = 500;
    for(var i=0;i<xNum;i+=1){
        for(var j=0;j<zNum;j+=1){
            var x=i*AxesBounds["P_SPACING"];
            var z=j*AxesBounds["P_SPACING"];
            var xNext = (i+1)*AxesBounds["P_SPACING"];
            var zNext= (j+1)*AxesBounds["P_SPACING"];
            gridGeometry.vertices.push(new THREE.Vector3(x-X_DISPLACE,0,zNext-Z_DISPLACE));
            shaderMaterial.attributes.parameters.value.push(new THREE.Vector2(x-X_DISPLACE,zNext-Z_DISPLACE));

            gridGeometry.vertices.push(new THREE.Vector3(xNext-X_DISPLACE,0,zNext-Z_DISPLACE));
            shaderMaterial.attributes.parameters.value.push(new THREE.Vector2(xNext-X_DISPLACE,zNext-Z_DISPLACE));

            gridGeometry.vertices.push(new THREE.Vector3(xNext-X_DISPLACE,0,z-Z_DISPLACE));
            shaderMaterial.attributes.parameters.value.push(new THREE.Vector2(xNext-X_DISPLACE,z-Z_DISPLACE));

            gridGeometry.vertices.push(new THREE.Vector3(x-X_DISPLACE,0,z-Z_DISPLACE));
            shaderMaterial.attributes.parameters.value.push(new THREE.Vector2(x-X_DISPLACE,z-Z_DISPLACE));

            gridGeometry.faces.push(new THREE.Face4(count,count+1,count+2,count+3,new THREE.Vector3(0,1,0)));
            gridGeometry.faces.push(new THREE.Face4(count+3,count+2,count+1,count,new THREE.Vector3(0,-1,0)));
            count+=4;
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
    return gridObjPS;
}