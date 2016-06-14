function define_diaretdb1() {
    var diaretdb1 = {};
    var name = "diaretdb1";
    var curImgAnnotations = {};
    curImgAnnotations["centroids"] = [];
    curImgAnnotations["radius"] = [];
    curImgAnnotations["confidences"] = [];
    curImgAnnotations["markingTypes"] = [];
    curGroup = -1;
    // curImgAnnotations["inclusions"] = {};
    var lastIdx = -1;
    var lastTextSize;
    // groupNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    currentImage = -1;
    groups = [
    'diaret1',
    'diaret2',
    'diaret3',
    'diaret4',
    'diaret5',
    'diaret6',
    'diaret7',
    'diaret8',
    'diaret9'
  ];
    // groupsPrepared = [false, false, false, false, false, false, false]
    diaret_images = [
    [
      "image001",
      "image002",
      "image003",
      "image004",
      "image005",
      "image006",
      "image007",
      "image008",
      "image009",
      "image010"
    ],
    [
      "image011",
      "image012",
      "image013",
      "image014",
      "image015",
      "image016",
      "image017",
      "image018",
      "image019",
      "image020"
    ],
    [
      "image021",
      "image022",
      "image023",
      "image024",
      "image025",
      "image026",
      "image027",
      "image028",
      "image029",
      "image030"
    ],
    [
      "image031",
      "image032",
      "image033",
      "image034",
      "image035",
      "image036",
      "image037",
      "image038",
      "image039",
      "image040"
    ],
    [
      "image041",
      "image042",
      "image043",
      "image044",
      "image045",
      "image046",
      "image047",
      "image048",
      "image049",
      "image050"
    ],
    [
      "image051",
      "image052",
      "image053",
      "image054",
      "image055",
      "image056",
      "image057",
      "image058",
      "image059",
      "image060"
    ],
    [
      "image061",
      "image062",
      "image063",
      "image064",
      "image065",
      "image066",
      "image067",
      "image068",
      "image069",
      "image070"
    ],
    [
      "image071",
      "image072",
      "image073",
      "image074",
      "image075",
      "image076",
      "image077",
      "image078",
      "image079",
      "image080"
    ],
    [
      "image081",
      "image082",
      "image083",
      "image084",
      "image085",
      "image086",
      "image087",
      "image088",
      "image089"
    ]
  ];

    diaretdb1.greet = function() {
        console.log("Hello from the " + name + " library.");
    }

    diaretdb1.loadGroups = function() {
    	var Connect = new XMLHttpRequest();
        var jsonFile = "/groundtruth/imagesBySymptom.json";
    	Connect.open("GET", jsonFile, false);
  		Connect.setRequestHeader("Content-Type", "text/json");
  		Connect.send();
  		diaretdb1['configBySymptom'] = JSON.parse(Connect.responseText);
        jsonFile = "/groundtruth/symptomsByImage.json";
    	Connect.open("GET", jsonFile, false);
  		Connect.setRequestHeader("Content-Type", "text/json");
  		Connect.send();
  		diaretdb1['configByImage'] = JSON.parse(Connect.responseText);
    }

    diaretdb1.getMousePos = function(canvas, evt) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }

    diaretdb1.getMouseInCircleIndex = function(point) {
      var result = -1;
      for (var i=0;i<curImgAnnotations["centroids"].length;i++) {
        var centroid = curImgAnnotations["centroids"][i];
        var dist2 = Math.pow(point.x-centroid.x,2)+Math.pow(point.y-centroid.y,2);
        var radius = curImgAnnotations["radius"][i];
        if (dist2 <= Math.pow(radius,2)) {
          result = i;
          break;
        }
      }
      return result;
    }

    diaretdb1.parseCentroid = function(centroidAsElement) {
    	var result = {};
        var coordsCollection = centroidAsElement.childNodes[0];
    	var coordsAsText = coordsCollection.textContent.toString();
    	var coords = coordsAsText.split(",");
    	var coordsInt = [];
    	coordsInt[0] = parseInt(coords[0]);
    	coordsInt[1] = parseInt(coords[1]);
    	result["x"] = coordsInt[0];
    	result["y"] = coordsInt[1];
    	return result;
    }

    diaretdb1.scalify = function(value, scale) {
    	return parseInt(value*scale);
    }

    diaretdb1.unscalify = function(value, scale) {
      return parseInt(value/scale);
    }

    diaretdb1.drawAnnotationCircle = function(canvas, centroid, radius, scale, color) {
    	var context = canvas.getContext("2d");
      // context.beginPath();
      // context.clearRect(centroid.x - radius - 1, centroid.y - radius - 1, radius * 2 + 2, radius * 2 + 2);
      // context.closePath();
        context.beginPath();
    	context.arc(centroid.x, centroid.y, radius, 0, Math.PI * 2, false);
        context.closePath();
	    context.lineWidth = 1;
    	context.strokeStyle = color;
    	context.stroke();
    }

    diaretdb1.drawText = function(text, canvas, centroid, radius) {
      var context = canvas.getContext("2d");
      context.font="16px Verdana";
      context.fillStyle = '#FFFFFF'
      context.beginPath();
      context.fillText(text,canvas.width-140,canvas.height-20);
      diaretdb1.lastTextSize = {
        x: canvas.width-140,
        y: canvas.height-20-17,
        width: context.measureText(text).width,
        height: 20,
      };
      context.closePath();
    }

    diaretdb1.redrawCircleAndSons = function(canvas,index,scale,color1,color2) {
      diaretdb1.drawAnnotationCircle(canvas,
                                curImgAnnotations["centroids"][index],
                                curImgAnnotations["radius"][index],
                                scale,
                                color1);
      // if (curImgAnnotations["inclusions"][""+index]) {
      //   for (var i=curImgAnnotations["inclusions"][""+index].length-1;i>=0;i--) {
      //     this.redrawCircleAndSons(canvas,curImgAnnotations["inclusions"][""+index][i],scale,color2,color2);
      //   }
      // }
    }

    diaretdb1.mouseListener = function(canvas,scale,mainCanvas) {
      diaretdb1.lastIdx = -1;
      canvas.addEventListener('mousemove', function(evt) {
        var mousePos = diaretdb1.getMousePos(canvas, evt);
        var idx = diaretdb1.getMouseInCircleIndex(mousePos);
        // console.log("idx="+idx);
        if (diaretdb1.lastIdx != -1) {
          // console.log('erase');
          if (diaretdb1.lastTextSize) {
            var context = canvas.getContext("2d");
            context.beginPath();
            // console.log(diaretdb1.lastTextSize.x+","+
            //                   diaretdb1.lastTextSize.y+","+
            //                   diaretdb1.lastTextSize.width+","+
            //                   diaretdb1.lastTextSize.height);
            context.clearRect(diaretdb1.lastTextSize.x, 
                              diaretdb1.lastTextSize.y, 
                              diaretdb1.lastTextSize.width, 
                              diaretdb1.lastTextSize.height);
            var zoomCanvas = document.getElementById("zoomCanvas");
            if (zoomCanvas) {
              var canvasParent = zoomCanvas.parentElement;
              canvasParent.removeChild(zoomCanvas);
              // var zoomContext = zoomCanvas.getContext("2d");
              // zoomContext.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);
            }
            // context.stroke();
            context.closePath();
          }
          diaretdb1.redrawCircleAndSons(canvas,diaretdb1.lastIdx,scale,'#BFFF00','#BFFF00');
          // diaretdb1.drawAnnotationCircle(canvas,
          //                           curImgAnnotations["centroids"][diaretdb1.lastIdx],
          //                           curImgAnnotations["radius"][diaretdb1.lastIdx],
          //                           scale,
          //                           '#BFFF00');
        }
        if (idx != -1) {
          // console.log('write');
          diaretdb1.redrawCircleAndSons(canvas,idx,scale,'#DEE3F6','#BFFF00');
          // diaretdb1.drawAnnotationCircle(canvas,
          //                           curImgAnnotations["centroids"][idx],
          //                           curImgAnnotations["radius"][idx],
          //                           scale,
          //                           '#DEE3F6');
          diaretdb1.drawText(curImgAnnotations["markingTypes"][idx],
                              canvas,
                              curImgAnnotations["centroids"][idx],
                              curImgAnnotations["radius"][idx]);
          diaretdb1.imageExtract(mainCanvas,idx,scale);
        }
        diaretdb1.lastIdx = idx;
        // var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
        // console.log(idx+","+diaretdb1.lastIdx);
      }, false);
    }

    diaretdb1.getBackgroundImageData = function(canvas) {
      var url = canvas.style.backgroundImage;
      var img = new Image();
      img.src = url;
      return img;
    }

    diaretdb1.imageExtract = function(mainCanvas, index, scale) {
      var centroid = curImgAnnotations["centroids"][index];
      var x = diaretdb1.unscalify(centroid.x,scale);
      var y = this.unscalify(centroid.y,scale);
      var radius = curImgAnnotations["radius"][index];
      var r = this.unscalify(radius,scale);
      var rect = {
        x: x - r - 1,
        y: y - r - 1,
        width: r * 2 + 2,
        height: r * 2 + 2
      };
      var rect2 = {
        x: centroid.x - radius - 1,
        y: centroid.y - radius - 1,
        width: radius * 2 + 2,
        height: radius * 2 + 2
      };
      var canvas = document.getElementById('zoomCanvas');
      if (canvas) {
        var canvasParent = canvas.parentElement;
        canvasParent.removeChild(canvas);
      }
      canvasParent = mainCanvas.parentElement;
      if (!canvas)
        canvas = document.createElement('canvas');
      canvas.id = 'zoomCanvas';
      canvasParent.appendChild(canvas);
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.position = 'fixed';
      canvas.style.bottom = '50px';
      canvas.style.right = '19.9%';
      var context = canvas.getContext('2d');
      var mainContext = mainCanvas.getContext('2d');
      var img = mainContext.getImageData(rect2.x,rect2.y,rect2.width,rect2.height);
      context.putImageData(img,0,0);
      context.scale(1.0/scale,1.0/scale);
      context.drawImage(canvas,0,0);
      context.moveTo(0,1);
      context.lineTo(rect2.width-3,1);
      context.lineTo(rect2.width-3,rect2.height-3);
      context.lineTo(1,rect2.height-3);
      context.lineTo(1,1);
      context.lineWidth = 2;
      context.strokeStyle = '#ffffff';
      context.stroke();
    }

    diaretdb1.addCircle = function(centroid,radius,markingType) {
      for (var i=0;i<curImgAnnotations["radius"].length;i++) {
        if (curImgAnnotations["radius"][i] > radius)
          break;
      }
      if (i==curImgAnnotations["radius"].length) {
        curImgAnnotations["centroids"].push(centroid);
        curImgAnnotations["radius"].push(radius);
        curImgAnnotations["markingTypes"].push(markingType.textContent.toString());
      }
      else {
        curImgAnnotations["centroids"].splice(i,0,centroid);
        curImgAnnotations["radius"].splice(i,0,radius);
        curImgAnnotations["markingTypes"].splice(i,0,markingType.textContent.toString());
      }
      return i;
    }

    /**
    * Check if circle i is included or not in circle j (i<j)
    */
    diaretdb1.isIncluded = function(i,j) {
      var result = false;
      var centroidi = curImgAnnotations["centroids"][i];
      var centroidj = curImgAnnotations["centroids"][j];
      var radiusi = curImgAnnotations["radius"][i];
      var radiusj = curImgAnnotations["radius"][j];
      var d = Math.sqrt(Math.pow(centroidj.x-centroidi.x,2)+Math.pow(centroidj.y-centroidi.y,2));
      if (d < radiusj) { // i centroid included in j circle
        if (radiusi <= radiusj-d)
          result = true;
      }
    }

    // diaretdb1.loadInclusions = function() {
    //   for (var i=0;i<curImgAnnotations["radius"].length;i++) {
    //     for (var j=i+1;j<curImgAnnotations["radius"].length;j++) {
    //       if (this.isIncluded(i,j)) {
    //         if (!curImgAnnotations["inclusions"][""+j])
    //           curImgAnnotations["inclusions"][""+j] = [];
    //         curImgAnnotations["inclusions"][""+j].push(i);
    //         break;
    //       }
    //     }
    //   }
    // }

    /**
    * Load diagnosis data from related xml file
    * Each element of diagnosis feature is stored in curImgAnnotations hashmap
    * in memory
    */
    diaretdb1.loadImgAnnotations = function(imageId, canvas, scale) {
        canvas.style.position = 'fixed';
        // canvas.style.top = canvas.style.top;
        canvas.style.left = '19.7%';
    	var Connect = new XMLHttpRequest();
        var xmlFile = "/groundtruth/"+name+"_"+imageId+"_01_plain.xml";
    	Connect.open("GET", xmlFile, false);
  		Connect.setRequestHeader("Content-Type", "text/xml");
  		Connect.send(null);
  		var rootNode = Connect.responseXML;
  		// var rootNode = xmlDoc.childNodes[0];
  		var centroids = rootNode.getElementsByTagName("centroid");
  		var radius = rootNode.getElementsByTagName("radius");
  		// var confidences = rootNode.getElementsByTagName("confidence");
  		var markingtypes = rootNode.getElementsByTagName("markingtype");
      var color = '#BFFF00';
      curImgAnnotations["centroids"] = [];
      curImgAnnotations["radius"] = [];
      curImgAnnotations["confidences"] = [];
      curImgAnnotations["markingTypes"] = [];
  		for (var i=0;i<centroids.length;i++) {
        var centroid = this.parseCentroid(centroids[i]);
        centroid.x = this.scalify(centroid.x,scale);
        centroid.y = this.scalify(centroid.y,scale);
        var rad = parseInt(radius[i].textContent);
        rad = this.scalify(rad,scale);
        rad = Math.max(rad,10);
        this.addCircle(centroid,rad,markingtypes[i]);
  		}
      for (var i=curImgAnnotations["radius"].length-1;i>=0;i--) {
        var centroid = curImgAnnotations["centroids"][i];
        var rad = curImgAnnotations["radius"][i];
        var x = centroid.x;
        var y = centroid.y;
        var context = canvas.getContext("2d");
        this.drawAnnotationCircle(canvas,centroid,rad,scale,color);
      }
      console.log('nb circles: '+curImgAnnotations["radius"].length+' ('+imageId+')');
      // this.loadInclusions();
    }

    /**
    * Load and image stored at the given imageUrl and draw it in the given canvas
    * image's size is adjusted to canvas's size
    */
    diaretdb1.loadImage = function(canvas,imageUrl) {
      var context = canvas.getContext('2d');
      var img = new Image();
      img.addEventListener('load', function(){
        context.beginPath();
        context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
        context.closePath();
      }, false);
      img.src = imageUrl;
    }

    diaretdb1.clearCanvas = function(canvas) {
      var context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    diaretdb1.initCarousel=function(groupImages) {
        diaretdb1.loadGroups();
        curGroup = groupImages;
        var content_indi = "";
        var content_inner = "";
        $.each(diaret_images[groupImages], function (i, obj) {
          content_indi += '<li data-target="#carousel-example-generic" data-slide-to="' + i + '"></li>';
          content_inner += '<div class="item">';
          // content_inner += '<img src="images/diaretdb1_'+obj+'.png" alt="diaretdb1_image001.png" width="60%" height="60%">';
          content_inner += '<canvas id="circlecanvas'+i+'" width="825" height="634"></canvas>';
          content_inner += '<canvas id="rectcanvas'+i+'" width="825" height="634" style="position:fixed;left:19.7%"></canvas>';
          content_inner += '<div class="carousel-caption">';
          content_inner += 'diaretdb1_'+obj+'.png';
          content_inner += '</div>';
          content_inner += '</div>';
        });
        content_inner += 'diaretdb1 Image Set '+(groupImages+1)
        $('#car_indi').html(content_indi);
        $('#car_inner').html(content_inner);
        // for (var i=0;i<diaret_images[groupImages].length;i++) {
        //   var img = diaret_images[groupImages][i];
        //   var canvas1 = document.getElementById("circlecanvas"+i);
        //   diaretdb1.loadImage(canvas1,'images/diaretdb1_'+img+'.png');
        //   if (i==0) {
        //     var canvas2 = document.getElementById("rectcanvas"+i);
        //     canvas2.style.top = canvas1.style.top;
        //     diaretdb1.loadImgAnnotations(img,canvas2,0.55);
        //     diaretdb1.mouseListener(canvas2,0.55,canvas1);
        //   }
        // }
        var img = diaret_images[groupImages][0];
        var canvas1 = document.getElementById("circlecanvas"+0);
        if (!canvas1)
          console.log('canvas1 is null 1')
        diaretdb1.clearCanvas(canvas1);
        diaretdb1.loadImage(canvas1,'/images/diaretdb1_'+img+'.png');
        var canvas2 = document.getElementById("rectcanvas"+0);
        if (!canvas2)
          console.log('canvas2 is null 1')
        diaretdb1.clearCanvas(canvas2);
        canvas2.style.top = canvas1.style.top;
        diaretdb1.loadImgAnnotations(img,canvas2,0.55);
        diaretdb1.mouseListener(canvas2,0.55,canvas1);
        currentImage = 0;
        $('#car_inner .item').first().addClass('active');
        $('#car_indi > li').first().addClass('active');
        $('#carousel-example-generic').carousel({
//           interval: 10000
            interval: false
        });
        $('#carousel-example-generic').bind('slide.bs.carousel', function (e) {
          // console.log('slide event!');
          currentImage = $(e.relatedTarget).index();
          var canvas1 = document.getElementById("circlecanvas"+currentImage);
          if (!canvas1)
            console.log('canvas1 is null 2')
          diaretdb1.clearCanvas(canvas1);
          diaretdb1.loadImage(canvas1,'/images/diaretdb1_'+diaret_images[curGroup][currentImage]+'.png');
          var canvas2 = document.getElementById("rectcanvas"+currentImage);
          if (!canvas2)
            console.log('canvas2 is null 2')
          diaretdb1.clearCanvas(canvas2);
          canvas2.style.top = canvas1.style.top;
          diaretdb1.loadImgAnnotations(diaret_images[curGroup][currentImage],canvas2,0.55);
          diaretdb1.mouseListener(canvas2,0.55,canvas1);
          // console.log('slide event end!');
        });
    }

    return diaretdb1;
}

if(typeof(diaretdb1) === 'undefined'){
    window.diaretdb1 = define_diaretdb1();
}
