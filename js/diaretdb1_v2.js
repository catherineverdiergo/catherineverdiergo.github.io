function define_diaretdb1() {
    var diaretdb1 = {};
    var name = "diaretdb1";
    var curImgAnnotations = {};
    curImgAnnotations["centroids"] = [];
    curImgAnnotations["radius"] = [];
    curImgAnnotations["confidences"] = [];
    curImgAnnotations["markingTypes"] = [];
    curGroup = -1;
    var lastIdx = -1;
    var lastTextSize;
    currentImage = -1;

    diaretdb1.colorByMark = {
        "Disc":                 "#A1C5D1",
        "Fundus_area":          "#0AF570",
        "Haemorrhages":         "#F2C2D4",
        "Hard_exudates":        "#09E3E3",
        "IRMA":                 "#BFFF00",
        "Neovascularisation":   "#E9A1F0",
        "Red_small_dots":       "#E0DD7E",
        "Soft_exudates":        "#7BFA05"
    };

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
        context.beginPath();
    	context.arc(centroid.x, centroid.y, radius, 0, Math.PI * 2, false);
        context.closePath();
	    context.lineWidth = 1;
    	context.strokeStyle = color;
    	context.stroke();
    }

    diaretdb1.drawLegend = function(mainCanvas) {
        var canvas = document.getElementById('legendCanvas');
        if (canvas) {
            var canvasParent = canvas.parentElement;
            canvasParent.removeChild(canvas);
        }
        canvasParent = mainCanvas.parentElement;
        if (!canvas)
            canvas = document.createElement('canvas');
        canvas = document.createElement('canvas');
        canvas.id = 'legendCanvas';
        canvasParent.appendChild(canvas);
        canvas.width = 150;
        canvas.height = 200;
        canvas.style.position = 'fixed';
        canvas.style.top = '25px';
        canvas.style.right = '25%';
        var context = canvas.getContext("2d");
        context.beginPath();
        var i = 0;
        context.font = "12px Arial";
        for (var legend in diaretdb1.colorByMark) {
            context.fillStyle = diaretdb1.colorByMark[legend];
            context.fillRect(canvas.width-140, 10+20*i-10, 10, 10);
            context.fillText(legend,canvas.width-125,10+20*i);
            context.closePath();
            context.stroke();
            i += 1;
        }
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

    diaretdb1.redrawCircleAndSons = function(canvas,index,scale) {
      diaretdb1.drawAnnotationCircle(canvas,
                                curImgAnnotations["centroids"][index],
                                curImgAnnotations["radius"][index],
                                scale,
                                diaretdb1.colorByMark[curImgAnnotations["markingTypes"][index]]);
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
            context.clearRect(diaretdb1.lastTextSize.x,
                              diaretdb1.lastTextSize.y, 
                              diaretdb1.lastTextSize.width, 
                              diaretdb1.lastTextSize.height);
            var zoomCanvas = document.getElementById("zoomCanvas");
            if (zoomCanvas) {
              var canvasParent = zoomCanvas.parentElement;
              canvasParent.removeChild(zoomCanvas);
            }
            // context.stroke();
            context.closePath();
          }
          diaretdb1.redrawCircleAndSons(canvas,diaretdb1.lastIdx,scale);
        }
        if (idx != -1) {
          // console.log('write');
          diaretdb1.redrawCircleAndSons(canvas,idx,scale);
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
      //canvas.translate(10,10)
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
        var xmlFile = "/groundtruth/"+imageId+"_01_plain.xml";
    	Connect.open("GET", xmlFile, false);
  		Connect.setRequestHeader("Content-Type", "text/xml");
  		Connect.send(null);
  		var rootNode = Connect.responseXML;
  		var centroids = rootNode.getElementsByTagName("centroid");
  		var radius = rootNode.getElementsByTagName("radius");
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
            this.drawAnnotationCircle(canvas,centroid,rad,scale,diaretdb1.colorByMark[curImgAnnotations["markingTypes"][i]]);
            this.drawAnnotationCircle(canvas,centroid,rad,scale,diaretdb1.colorByMark[curImgAnnotations["markingTypes"][i]]);
        }
        diaretdb1.drawLegend(canvas);
      console.log('nb circles: '+curImgAnnotations["radius"].length+' ('+imageId+')');
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
        if (typeof diaretdb1.configBySymptom == "undefined")
            diaretdb1.loadGroups();
        curGroup = groupImages;
        var content_indi = "";
        var content_inner = "";
        $.each(diaretdb1['configBySymptom'][groupImages], function (i, obj) {
          content_indi += '<li data-target="#carousel-example-generic" data-slide-to="' + i + '"></li>';
          content_inner += '<div class="item">';
          content_inner += '<canvas id="circlecanvas'+i+'" width="825" height="634"></canvas>';
          content_inner += '<canvas id="rectcanvas'+i+'" width="825" height="634" style="position:fixed;left:19.7%"></canvas>';
          content_inner += '<div class="carousel-caption">';
          content_inner += obj+'.png';
          content_inner += '</div>';
          content_inner += '</div>';
        });
        content_inner += 'diaretdb1 Image Set : '+groupImages
        $('#car_indi').html(content_indi);
        $('#car_inner').html(content_inner);
        var img = diaretdb1['configBySymptom'][groupImages][0];
        var canvas1 = document.getElementById("circlecanvas"+0);
        if (!canvas1)
          console.log('canvas1 is null 1')
        diaretdb1.clearCanvas(canvas1);
        diaretdb1.loadImage(canvas1,'/images/'+img+'.png');
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
          diaretdb1.loadImage(canvas1,'/images/'+diaretdb1['configBySymptom'][curGroup][currentImage]+'.png');
          var canvas2 = document.getElementById("rectcanvas"+currentImage);
          if (!canvas2)
            console.log('canvas2 is null 2')
          diaretdb1.clearCanvas(canvas2);
          canvas2.style.top = canvas1.style.top;
          diaretdb1.loadImgAnnotations(diaretdb1['configBySymptom'][curGroup][currentImage],canvas2,0.55);
          diaretdb1.mouseListener(canvas2,0.55,canvas1);
          // console.log('slide event end!');
        });
    }

    return diaretdb1;
}

if(typeof(diaretdb1) === 'undefined'){
    window.diaretdb1 = define_diaretdb1();
}
