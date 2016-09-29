
/*
Code by Dan Gries
rectangleworld.com

For more information about the mathematics behind the orbits animated in this application, see the links within the page.

Uses:
jQuery (http://jquery.com/)
jQueryUI (http://jqueryui.com/)
jQuery UI Touch Punch by David Furfero (http://touchpunch.furf.com/) - enables the use of touch events on jQuery UI elements
UltButtons by Fabrício Matté (http://ultcombo.github.io/UltButtons/) - Improves jQuery UI Checkbox/Radio Buttons functionality.
*/

var G = 6.67*Math.pow(10, -2);

window.addEventListener("load", windowLoadHandler, false);

//for debug messages
function trace(message) {
    try {
        console.log(message);
    }
    catch (exception) {
        return;
    }
}

function windowLoadHandler() {
    canvasApp();
}

function canvasApp() {
        
    var particles;
    var numParticles;
    var orbitName;
    var jsonData;
    var numOrbits;
    var tInc;
    var tIncMin, tIncMax;
    var xMin, xMax, yMin, yMax;
    var xPixRate, yPixRate;
    var time;
    var particleRad;
    var bgColor;
    var request;
    var running;
    var fadeAlpha;
    var trailWidth;
    var trajectoriesOn;
    var colorLookup;
    var defaultParticleColor;
    var timeFactor;
    var staticOrbitColor;
    var staticOrbitWidth;
    var trailColorLookup;
    
    var staticOrbitDrawPointsX;
    var staticOrbitDrawPointsY;
    
    var staticOrbitMinDrawDistance;
    
    var endPixX;
    var endPixY;
    
    var displayCanvas = document.getElementById("displayCanvas");
    var context = displayCanvas.getContext("2d");
    
    var particleLayerCanvas = document.getElementById("particleLayerCanvas");
    var particleLayerContext = particleLayerCanvas.getContext("2d");
    
    var orbitLayerCanvas = document.getElementById("orbitLayerCanvas");
    var orbitLayerContext = orbitLayerCanvas.getContext("2d");
    
    var displayWidth = displayCanvas.width;
    var displayHeight = displayCanvas.height;
    
    var startStopButton = document.getElementById("startStopButton");
    startStopButton.addEventListener("click", startStopButtonHandler, true);
    
    var trajectoryButton = document.getElementById("trajectoryButton");
    trajectoryButton.addEventListener("click", trajectoryButtonHandler, true);
    
    var btnNextOrbit = document.getElementById("btnNextOrbit");
    btnNextOrbit.addEventListener("click", nextOrbit, true);
    
    var btnPrevOrbit = document.getElementById("btnPrevOrbit");
    btnPrevOrbit.addEventListener("click", prevOrbit, true);
    
    //requestAnimationFrame shim for multiple browser compatibility by Eric Möller,
    //http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    //For an alternate version, also see http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/ 
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                       || window[vendors[x]+'CancelRequestAnimationFrame'];
        }
     
        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
     
        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());
    
    init();
    
    function init() {
        particleRad = 5.5;
        trailWidth = 2;
        bgColor = "#000000";
        fadeScreenColor = "rgba(0,0,0,0.02)";
        staticOrbitColor = "rgba(130,180,270,0.3)";
        //staticOrbitColor = "rgba(255,0,255,0.8)"; //TESTING
        staticOrbitWidth = trailWidth;
        defaultParticleColor = "#ee6600";
        defaultTrailColor = "#dd5500";
        
        staticOrbitMinDrawDistance = 2;
        
        setColorLookupList();
        
        //The line below is commented out because I decided to keep it simple and load the JSON within a separate JavaScript file.
        //getJSON("test.json", setData);
        
        setData(testData);
        
        trajectoriesOn = true;
        
        //jquery ui elements
        //speed slider
        $("#speedSlider").slider({
          value: 0.33,
          orientation: "horizontal",
          range: "min",
          max: 1,
          step: 0.005,
          slide: speedSliderHandler,
          change: speedSliderHandler,
          animate: true
        });
        
        //style existing buttons
        $(".buttonType1").button();
        $(".buttonType2").button();
        
        tIncMin = 0.001;
        tIncMax = 0.07;

        //set first orbit (includes makeParticles)
        setOrbit(0);
        
        startAnimation();
    }
    
    function setColorLookupList() {
        colorLookup = ["#ff7006","#50ce4d","#a253c4","#ef1010","#25b5bc","#E86A96","#edc832","#ad6530","#00773f","#d6d6d6"];
        
        trailColorLookup = [];
        
        //darkening colors for trails
        var i,r,g,b,colorString,c, newColor,newColorString;
        var len = colorLookup.length;
        var darkenFactor = 0.8;
        for (i = 0; i < len; i++) {
            colorString = colorLookup[i];
            colorString = colorString.replace("#", "");
            c = parseInt(colorString,16);
            r = (c & (255 << 16)) >> 16;
            g = (c & (255 << 8)) >> 8;
            b = (c & 255); 
            
            r = Math.floor(r*darkenFactor);
            g = Math.floor(g*darkenFactor);
            b = Math.floor(b*darkenFactor);
                        
            newColor = (r << 16) | (g << 8) | b;
            
            newColorString = newColor.toString(16);
            while (newColorString.length < 6) {
                newColorString = "0" + newColorString;
            }
            newColorString = "#" + newColorString;
            trailColorLookup.push(newColorString);
        }
    }
    
    function incrementOrbit(inc) {
        //find out what is checked
        currentIndex = $('input[name=orbitGroup]:checked').index('input[name=orbitGroup]');
        currentIndex = (currentIndex + inc + numOrbits) % numOrbits;
        
        //make new selection
        $('input[name=orbitGroup]')[currentIndex].checked = true;
        $("#orbitRadio").buttonset('refresh');
        
        //scroll
        //how much is currently scrolled:
        var currentScroll = $('#radioContainer').scrollTop();
        //the current position of the selected radio button:
        var rowPos = $('input[name=orbitGroup]:checked').position();
        //rollTop sets how many pixels of area to be above viewable area:
        var scrollAmount = currentScroll + rowPos.top;
        //stop any currently running animations:
        $('#radioContainer').stop();
        //animate scroll:
        $('#radioContainer').animate({scrollTop:scrollAmount + "px"});
        
        
        //set orbit
        setOrbit(currentIndex);
    }
    
    function nextOrbit(evt) {
        incrementOrbit(1);
    }
    function prevOrbit(evt) {
        incrementOrbit(-1);
    }
    
    function setPlotWindow(windowObject) {
        xMin = windowObject.xMin;
        xMax = windowObject.xMax;
        yMin = windowObject.yMin;
        yMax = windowObject.yMax;
        xPixRate = displayWidth/(xMax - xMin);
        yPixRate = displayHeight/(yMin - yMax);
    }
    
    function populateOrbitRadioButtons(dataObject) {
        var i;
        numOrbits = dataObject.orbits.length;
        var orbitRadio = document.getElementById("orbitRadio");
        for (i = 0; i < numOrbits; i++) {
            
            //radio button
            var input = document.createElement('input');
            input.type = "radio";
            input.value = i;
            input.id = "radio"+i;
            if (i == 0) {
                input.checked = "checked";
            }
            input.name = "orbitGroup";
            
            //label for the button
            var label = document.createElement('label');
            label.setAttribute("for",input.id);
            label.className = "radioLabel";
            label.innerHTML = dataObject.orbits[i].name;
            
            //add to DOM
            orbitRadio.appendChild(input);
            orbitRadio.appendChild(label);
            orbitRadio.appendChild(document.createElement('br'));
        }
        
        //jQuery: convert radio button group to buttonset.
        $("#orbitRadio").buttonset();
        
        //must attach listener via jQuery to make more responsive
        $("input[name='orbitGroup']").change(
            function() {
                setOrbit($("input[name='orbitGroup']:checked").val());
            }
        );    
            
        //changes button rounded corner style to fit vertical alignment style
        $('label:first', "#orbitRadio").removeClass('ui-corner-left').addClass('ui-corner-top');
        $('label:last', "#orbitRadio").removeClass('ui-corner-right').addClass('ui-corner-bottom');
    }
    
    function startAnimation() {
        running = true;
        (function animloop(){
          request = requestAnimationFrame(animloop);
          onTimer();
        })();
    }
    function stopAnimation() {
        running = false;
        cancelAnimationFrame(request);
    }
    
    function startStopButtonHandler(e) {
        if (running) {
            stopAnimation();
            running = false;
            startStopButton.value = "go";
        }
        else {
            startAnimation();
            running = true;
            startStopButton.value = "stop";
        }
    }
    
    function trajectoryButtonHandler(e) {
        if (trajectoriesOn) {
            trajectoriesOn = false;
            trajectoryButton.value = "show trajectories";
            clearScreen();
        }
        else {
            setStartPositions();
            trajectoriesOn = true;
            trajectoryButton.value = "hide trajectories";
        }
    }

    
    function onTimer() {
        if (trajectoriesOn) {
            //fade
            context.fillStyle = fadeScreenColor;
            context.fillRect(0,0,displayWidth,displayHeight);
        }
        
        //clear particle layer
        clearParticleLayer();
        
        time = (time + tInc) % (2*Math.PI);
        
        //update particles
        updateParticlePositions(tInc);
        
        //draw particles
        drawParticles();
    }
    
    function clearScreen() {
        context.fillStyle = bgColor;
        context.fillRect(0,0,displayWidth,displayHeight);
        orbitLayerContext.clearRect(0,0,displayWidth+1,displayHeight+1);
    }
    
    function clearParticleLayer() {
        particleLayerContext.clearRect(0,0,displayWidth+1,displayHeight+1);
    }
    
    function makeParticles(colors) {
        var i;
        
        particles = [];
        
        for (i = 0; i<numParticles; i++) {
            var phase = Math.PI*2*i/numParticles;
            var color;
            var trailColor;
            if (i<colors.length) {
                color = colorLookup[colors[i]];
                trailColor = trailColorLookup[colors[i]];
            }
            else {
                color = defaultParticleColor;
                trailColor = defaultTrailColor;
            }
                    
            var p = {
                    x: 0,
                    y: 0,
                    lastX: 0,
                    lastY: 0,
                    phase: phase,
                    color: color,
                    trailColor: trailColor
            }
            particles.push(p);
        }
        
        //setParticlePositions(time); // TODO: what does this do?
        resetLastPositions();
    }
    
    function resetLastPositions() {
        //set initial last positions
        for (i = 0; i<numParticles; i++) {
            particles[i].lastX = particles[i].x;
            particles[i].lastY = particles[i].y;
        }
    }
    
    function setStartPositions() {
        var pixX;
        var pixY;
        var j;
        endPixX = [];
        endPixY = [];
        staticOrbitDrawPointsX = [];
        staticOrbitDrawPointsY = [];
        for (i = 0; i<numParticles; i++) {
            j = (i + 1) % numParticles;
            pixX = xPixRate*(particles[j].x - xMin);
            pixY = yPixRate*(particles[j].y - yMax);
            endPixX.push(pixX);
            endPixY.push(pixY);
            staticOrbitDrawPointsX.push(xPixRate*(particles[i].x - xMin));
            staticOrbitDrawPointsY.push(yPixRate*(particles[i].y - yMax));
        }
    }
    
    function drawLastSegments() {
        var i;
        var p;
        var pixX;
        var pixY;
        orbitLayerContext.strokeStyle = staticOrbitColor;
        orbitLayerContext.lineWidth = staticOrbitWidth;

        for (i = 0; i < numParticles; i++) {
            p = particles[i];
            pixX = xPixRate*(p.x - xMin);
            pixY = yPixRate*(p.y - yMax);
            
            orbitLayerContext.beginPath();
            orbitLayerContext.moveTo(endPixX[i],endPixY[i]);
            orbitLayerContext.lineTo(staticOrbitDrawPointsX[i], staticOrbitDrawPointsY[i]);
            orbitLayerContext.stroke();
        }
    }
    
    function drawParticles() {
        var i;
        var len;
        var pixX;
        var pixY;
        var lastPixX;
        var lastPixY;
        var p;
        var dx;
        var dy;
        
        context.lineCap = "round";
        
        len = particles.length;
        for (i = 0; i < len; i++) {
            p = particles[i];
            pixX = xPixRate*(p.x - xMin);
            pixY = yPixRate*(p.y - yMax);
            lastPixX = xPixRate*(p.lastX - xMin);
            lastPixY = yPixRate*(p.lastY - yMax);
                        
            //particle
            particleLayerContext.strokeStyle = "rgba(0,0,0,0.5)"
            particleLayerContext.lineWidth = 2;
            particleLayerContext.fillStyle = p.color;
            particleLayerContext.beginPath();
            particleLayerContext.arc(pixX,pixY,particleRad+1,0,Math.PI*2,false);
            particleLayerContext.closePath();
            particleLayerContext.fill();
            particleLayerContext.stroke();
            
            if (trajectoriesOn) {
                //trail
                context.strokeStyle = p.trailColor;
                context.lineWidth = trailWidth;
                context.beginPath();
                context.moveTo(lastPixX,lastPixY);
                context.lineTo(pixX, pixY);
                context.stroke();
                
                orbitLayerContext.strokeStyle = staticOrbitColor;
                orbitLayerContext.lineWidth = staticOrbitWidth;

                dx = staticOrbitDrawPointsX[i] - pixX;
                dy = staticOrbitDrawPointsY[i] - pixY;
                if (dx*dx + dy*dy > staticOrbitMinDrawDistance*staticOrbitMinDrawDistance) {
                    orbitLayerContext.beginPath();
                    orbitLayerContext.moveTo(staticOrbitDrawPointsX[i],staticOrbitDrawPointsY[i]);
                    orbitLayerContext.lineTo(pixX, pixY);
                    orbitLayerContext.stroke();
                    staticOrbitDrawPointsX[i] = pixX;
                    staticOrbitDrawPointsY[i] = pixY;
                }
            }
        }

    }
    
    function setInitialParticlePositions(initial_data) {
        console.log("TODO: implement setInitialParticlePositions"); // TODO
        len = particles.length;
        for (i = 0; i < len; i++) {
            particles[i].lastX = initial_data[i].x
            particles[i].lastY = initial_data[i].y;
            particles[i].x = initial_data[i].x;
            particles[i].y = initial_data[i].y;
            particles[i].speed_x = initial_data[i].v_x;
            particles[i].speed_y = initial_data[i].v_y;
            particles[i].mass = initial_data[i].mass;
        }
        console.log(particles)
    }

     // composante en x de l’acceleration de m1 due a l’attraction exercee par m2
    function accGravit_x(x1,y1,mass1, x2, y2, mass2) {
        diff_x = x2 - x1;
        diff_y = y2 - y1;
        acc = G * mass2 / (diff_x*diff_x + diff_y*diff_y);
        return acc * Math.sin(Math.atan2(diff_x, diff_y));
    }

    // composante en y de l’acceleration de m1 due a l’attraction exercee par m2
    function accGravit_y(x1,y1,mass1, x2, y2, mass2) {
        diff_x = x2 - x1;
        diff_y = y2 - y1;
        acc = G * mass2 / (diff_x*diff_x + diff_y*diff_y);
        return acc * Math.sin(Math.atan2(diff_y, diff_x));
    }

    function updateParticlePositions(dInc) {
        var i;
        var len;
        len = particles.length;
        //RK step1
        interm1 = []; // va contenir k_1 (= 4 nombres) pour chaque particule, k_1 = f(y)
        for (i = 0; i < len; i++) {
            x1 = particles[i].x;
            y1 = particles[i].y;
            speed_x = particles[i].speed_x;
            speed_y = particles[i].speed_y;
            mass1 = particles[i].mass;
            interm1[i] = {};
            interm1[i].dx = speed_x;
            interm1[i].dy = speed_y;
            interm1[i].dvx = 0;
            interm1[i].dvy = 0;
            for(j=0; j < len; j++) {
                if (i == j)
                    continue;
                x2 = particles[j].x;
                y2 = particles[j].y;
                mass2 = particles[j].mass;
                interm1[i].dvx += accGravit_x(x1,y1,mass1, x2, y2, mass2);
                interm1[i].dvy += accGravit_y(x1,y1,mass1, x2, y2, mass2);
            }
        }

        //RK step2
        interm2 = []; // va contenir k_2 (= 4 nombres) pour chaque particule, k_2 = f(y + dInc/2 * k_1) 
        for (i = 0; i < len; i++) {
            x1 = particles[i].x + dInc/2 * interm1[i].dx;
            y1 = particles[i].y + dInc/2 * interm1[i].dy;
            speed_x = particles[i].speed_x+ dInc/2*interm1[i].dvx;
            speed_y = particles[i].speed_y + dInc/2*interm1[i].dvy;
            mass1 = particles[i].mass;
            interm2[i] = {};
            interm2[i].dx = speed_x ;
            interm2[i].dy = speed_y;
            interm2[i].dvx = 0;
            interm2[i].dvy = 0;
            for(j=0; j < len; j++) {
                if (i == j)
                    continue;
                x2 = particles[j].x + dInc/2 * interm1[j].dx;
                y2 = particles[j].y+ dInc/2 * interm1[j].dy;
                mass2 = particles[j].mass;
                interm2[i].dvx += accGravit_x(x1,y1,mass1, x2, y2, mass2);
                interm2[i].dvy += accGravit_y(x1,y1,mass1, x2, y2, mass2);
            }
        }

        //RK step 3
        interm3 = []; // va contenir k_3 (= 4 nombres) pour chaque particule, k_3 = f(y + dInc/2 * k_2) 
        for (i = 0; i < len; i++) {
            x1 = particles[i].x + dInc/2 * interm2[i].dx;
            y1 = particles[i].y + dInc/2 * interm2[i].dy;
            speed_x = particles[i].speed_x + dInc/2 * interm2[i].dvx;
            speed_y = particles[i].speed_y + dInc/2 * interm2[i].dvy;
            mass1 = particles[i].mass;
            interm3[i] = {};
            interm3[i].dx = speed_x ;
            interm3[i].dy = speed_y;
            interm3[i].dvx = 0;
            interm3[i].dvy = 0;
            for(j=0; j < len; j++) {
                if (i == j)
                    continue;
                x2 = particles[j].x + dInc/2 * interm2[j].dx;
                y2 = particles[j].y + dInc/2 * interm2[j].dy;
                mass2 = particles[j].mass;
                interm3[i].dvx += accGravit_x(x1,y1,mass1, x2, y2, mass2);
                interm3[i].dvy += accGravit_y(x1,y1,mass1, x2, y2, mass2);
            }
        }

        //RK step 4
        interm4 = []; // va contenir k_4 (=4 nombres) pour chaque particule ; k_2 = f(y + dInc * k_3) 
        for (i = 0; i < len; i++) {
            x1 = particles[i].x + dInc * interm3[i].dx;
            y1 = particles[i].y + dInc * interm3[i].dy;
            speed_x = particles[i].speed_x + dInc * interm3[i].dvx;
            speed_y = particles[i].speed_y + dInc * interm3[i].dvy;
            mass1 = particles[i].mass;
            interm4[i] = {};
            interm4[i].dx = speed_x ;
            interm4[i].dy = speed_y;
            interm4[i].dvx = 0;
            interm4[i].dvy = 0;
            for(j=0; j < len; j++) {
                if (i == j)
                    continue;
                x2 = particles[j].x + dInc * interm3[j].dx;
                y2 = particles[j].y + dInc * interm3[j].dy;
                mass2 = particles[j].mass;
                interm4[i].dvx += accGravit_x(x1,y1,mass1, x2, y2, mass2);
                interm4[i].dvy += accGravit_y(x1,y1,mass1, x2, y2, mass2);
            }
        }

        // calcul de la configuration suivante a l’aide de k_1…k_4
        for (i = 0; i < len; i++) {
            particles[i].lastX = particles[i].x;
            particles[i].lastY = particles[i].y;
            particles[i].speed_x += dInc/6*(interm1[i].dvx + 2*interm2[i].dvx + 2*interm3[i].dvx + interm4[i].dvx);
            particles[i].speed_y += dInc/6*(interm1[i].dvy + 2*interm2[i].dvy + 2*interm3[i].dvy + interm4[i].dvy);
            particles[i].x += dInc/6*(interm1[i].dx + 2*interm2[i].dx + 2*interm3[i].dx + interm4[i].dx);
            particles[i].y += dInc/6*(interm1[i].dy + 2*interm2[i].dy + 2*interm3[i].dy + interm4[i].dy);
        }
    }    
    
    function speedSliderHandler() {
        setTInc();    
    }
    
    function setTInc() {
        tInc = timeFactor*(tIncMin + (tIncMax - tIncMin)*$("#speedSlider").slider("value"));
    }
    
    function setOrbit(orbitIndex) {
        
        var orbitObject = jsonData.orbits[orbitIndex];
        
        setPlotWindow(orbitObject.plotWindow);
        
        setInfoText(orbitObject.info);
        
        numParticles = orbitObject.particles.length;
        
        var colors;
        if (!orbitObject.colors) {
            if (numParticles < colorLookup.length) {
                //if fewer than color list, default will be to do different colors.
                colors = [];
                for (var i = 0; i < numParticles; i++) {
                    colors.push(i);
                }
            }
            else {
                //if more than color list, set to empty array,then default will be to make all same color.
                colors = [];
            }
        }
        else {
            colors = orbitObject.colors;
        }
        makeParticles(colors);
        clearScreen();
                
        if (!orbitObject.timeInterval) {
            timeFactor = 1;    
        }
        else {
            timeFactor = 1./orbitObject.timeInterval;
        }
        
        time = 0;
        
        setInitialParticlePositions(orbitObject.particles);
        resetLastPositions();
        setStartPositions();
        
        //if stopped, draw particles in correct place
        if (!running) {
            clearParticleLayer();
            drawParticles();    
        }
        setTInc();
        
    }
    
    function setInfoText(windowObject) {
        var infoHeader = windowObject.header;
        var infoDescription = windowObject.description;
        var infoComment = windowObject.comment;
        var headerSpan = document.getElementById("infoBoxHeader");
        var descriptionSpan = document.getElementById("infoBoxDescription");
        var commentSpan = document.getElementById("infoBoxComment");
        headerSpan.innerHTML = infoHeader;
        descriptionSpan.innerHTML = infoDescription;
        commentSpan.innerHTML = infoComment;
    }
    
    //function to split arrays
    function separateArray(array) {
        var returnObj = {even: [], odd: []};
        var i;
        var len = array.length;
        for (i = 0; i < len; i = i + 2) {
            returnObj.even.push(array[i]);
            returnObj.odd.push(array[i+1]);
        }
        return returnObj;
    }    
    
    
    function setData(dataObject) {
        jsonData = dataObject;
        numOrbits = jsonData.orbits.length;
        populateOrbitRadioButtons(dataObject);
    }
    
    /*
    function getJSON(url, callback) {
        var request = new XMLHttpRequest();
        request.open("GET", url);
        request.onreadystatechange = function() {
            if (request.readyState === 4 && request.status === 200) {
                callback(JSON.parse(request.responseText));
            }
        };
        request.send(null);
    }
    */    
}


