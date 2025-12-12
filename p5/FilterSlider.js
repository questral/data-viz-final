
class FilterSlider {
    constructor(x1,y1,x2,y2, emotion, mini,maxi,v,spread) {
      this.p1 = createVector(x1,y1);
      this.p2 = createVector(x2,y2);
      this.mini = mini;
      this.maxi = maxi;
      this.v = constrain(map(v, mini,maxi, 0,1), 0,1);
      this.minSpread = 0.1; this.maxSpread = 2;
      this.spread = constrain(spread, this.minSpread,this.maxSpread);
      this.emotion = emotion;

      this.cBackground = color(160);
      this.cHandle = color(255);
  
      this.handleLength = 13;
      this.boundsLength = this.handleLength * 0.95;
      this.boundsZoneHeight = this.handleLength * 0.92;
      this.grabbedHandle = null;

      this.visible = false;
  
      this.id = filterSlidersCount;
      filterSlidersCount++;
    }
    
    constrainVs() {
      this.v = constrain(map(this.v, this.mini,this.maxi, 0,1), 0,1);
      this.spread = constrain(this.spread, this.minSpread,this.maxSpread);
    }
  
    display(scrollY) {
      if (scrollY < min(this.p1[1],this.p2[1]) || scrollY > max(this.p1[1],this.p2[1])+windowHeight+200) {
        return;
    }

      //draw filterSlider background
      strokeCap(ROUND);
      stroke(0); strokeWeight(5);
      line(this.p1.x,this.p1.y, this.p2.x,this.p2.y);
      stroke(this.visible ? this.cBackground : 100); strokeWeight(3);
      line(this.p1.x,this.p1.y, this.p2.x,this.p2.y);
  
      //calculating things
      let handleX = map(this.v, 0,1, this.p1.x,this.p2.x);
      let handleY = map(this.v, 0,1, this.p1.y,this.p2.y);
      let boundLeftV = constrain(this.v-(this.spread/2), 0,1); let boundRightV = constrain(this.v+(this.spread/2), 0,1);
      let range = dist(this.p1.x,this.p1.y, this.p2.x,this.p2.y);
      let boundLeftOffset = map(this.v-boundLeftV, 0,1, 0,range); let boundRightOffset = map(boundRightV-this.v, 0,1, 0,range); 
      let thisAngle = angleBetweenPoints(this.p1.x,this.p1.y, this.p2.x,this.p2.y);
      
      push();
      translate(handleX,handleY);
      rotate(thisAngle);
      
      //draw spread and bound lines
      fill(0,70); noStroke();
      quad(-boundLeftOffset,this.boundsZoneHeight/2, -boundLeftOffset,-this.boundsZoneHeight/2,
          boundRightOffset,-this.boundsZoneHeight/2, boundRightOffset,this.boundsZoneHeight/2)
      stroke(0); strokeWeight(3);
      line(-boundLeftOffset,this.boundsLength/2, -boundLeftOffset,-this.boundsLength/2);
      line(boundRightOffset,this.boundsLength/2, boundRightOffset,-this.boundsLength/2);
      
      //draw main handle
      stroke(0); strokeWeight(7);
      line(0,this.handleLength/2, 0,-this.handleLength/2);
      stroke(this.visible ? this.cHandle : 100); strokeWeight(5);
      line(0,this.handleLength/2, 0,-this.handleLength/2);
      pop();
  
      //draw labels
      fill(255); noStroke();
      let labelOffset = 10;
      textSize(12);
      textAlign(CENTER,TOP);
      text(this.mini, this.p1.x,this.p1.y+labelOffset);
      text(this.maxi, this.p2.x,this.p2.y+labelOffset);
      push();
      translate((this.p1.x + this.p2.x)/2, (this.p1.y + this.p2.y)/2);
      rotate(thisAngle);
      text(this.emotion, 0,labelOffset);
      pop();
      if (this.grabbedHandle != null) {
        textSize(16);
        textAlign(CENTER,BASELINE);
        text(round(map(this.v, 0,1, this.mini,this.maxi),2), handleX,handleY-labelOffset-(this.handleLength/4));
      }

      //draw visibility button
      let buttonBounds = this.getButtonBounds();
      let buttonX = buttonBounds['x']; let buttonY = buttonBounds['y'];
      let buttonW = buttonBounds['w']; let buttonH = buttonBounds['h'];
      fill(this.visible ? 200 : 120);
      stroke(0); strokeWeight(2);
      rect(buttonX,buttonY, buttonW,buttonH);
      textSize(12);
      textAlign(CENTER,CENTER);
      fill(0); noStroke();
      text((this.visible ? 'hide' : 'show'), buttonX+(buttonW/2),buttonY+(buttonH/2)-1);
    }

    getButtonBounds() {
      let x1 = this.p1.x; let y1 = this.p1.y;
      let x2 = this.p2.x; let y2 = this.p2.y;
      let buttonW = 50; let buttonH = 20;
      let buttonCX = max(x1,x2) + 10 + (buttonW/2);
      let buttonCY = (y1+y2)/2;
      let buttonX = buttonCX-(buttonW/2);
      let buttonY = buttonCY-(buttonH/2);
      return {'x':buttonX, 'y':buttonY, 'w':buttonW, 'h':buttonH}
    }
  
    fixDragStatus() {
      if (!mouseIsPressed) {
        this.grabbedHandle = null;
      }
    }
  
    checkHandlesDrag() {
      let thisAngle = angleBetweenPoints(this.p1.x,this.p1.y, this.p2.x,this.p2.y);
      
      let handleX = map(this.v, 0,1, this.p1.x,this.p2.x);
      let handleY = map(this.v, 0,1, this.p1.y,this.p2.y);
      let handlePoss = getEndpoints(handleX,handleY, thisAngle, this.handleLength/2);
      
      let boundsLeftX = map(constrain(this.v-(this.spread/2), 0,1), 0,1, this.p1.x,this.p2.x);
      let boundsLeftY = map(constrain(this.v-(this.spread/2), 0,1), 0,1, this.p1.y,this.p2.y);
      let boundsRightX = map(constrain(this.v+(this.spread/2), 0,1), 0,1, this.p1.x,this.p2.x);
      let boundsRightY = map(constrain(this.v+(this.spread/2), 0,1), 0,1, this.p1.y,this.p2.y);
      let boundsLeftPoss = getEndpoints(boundsLeftX,boundsLeftY, thisAngle, this.boundsLength/2);
      let boundsRightPoss = getEndpoints(boundsRightX,boundsRightY, thisAngle, this.boundsLength/2);
      
      let handleDist = distToLine(mouseX,mouseY, handlePoss['p1'],handlePoss['p2']);
      let boundsLeftDist = distToLine(mouseX,mouseY, boundsLeftPoss['p1'],boundsLeftPoss['p2']);
      let boundsRightDist = distToLine(mouseX,mouseY, boundsRightPoss['p1'],boundsRightPoss['p2']);
      let minBoundsDist = min(boundsLeftDist, boundsRightDist);
      let grabThreshold = 10;
      if (this.grabbedHandle == null) {
        if (handleDist <= grabThreshold || minBoundsDist <= grabThreshold) {
          if (boundsLeftDist <= handleDist || boundsRightDist <= handleDist) {
            this.grabbedHandle = (boundsLeftDist < boundsRightDist ? 'boundsLeft' : 'boundsRight');
          } else {
            this.grabbedHandle = 'handle';
          }
          this.visible = true;
          return this.grabbedHandle;
        }
      }
      return null;
    }

    checkButton() {
      let buttonBounds = this.getButtonBounds();
      let buttonX = buttonBounds['x']; let buttonY = buttonBounds['y'];
      let buttonW = buttonBounds['w']; let buttonH = buttonBounds['h'];
      if (inBox(mouseX,mouseY, buttonX,buttonY,buttonW,buttonH)) {
        this.visible = !this.visible;
      }
    }
    
    moveHandles() {
      if (this.grabbedHandle == 'handle') {
        this.updateV();
      } else if (this.grabbedHandle == 'boundsLeft' || this.grabbedHandle == 'boundsRight') {
        this.updateBounds();
      }
    }
  
    updateV() { //if one of this line's segments is closest to the mouse, this sets it as the active segment (to later add a node to)
      let thisAngle = angleBetweenPoints(this.p1.x,this.p1.y, this.p2.x,this.p2.y);
      let p3 = createVector(mouseX,mouseY);
      let p4 = createVector(mouseX + cos(thisAngle+HALF_PI), mouseY + sin(thisAngle+HALF_PI));
      let intersection = findIntersection(this.p1, this.p2, p3, p4);
      let uA = intersection["uA"];
      this.v = constrain(uA, 0,1);
    }
  
    updateBounds() { //if one of this line's segments is closest to the mouse, this sets it as the active segment (to later add a node to)
      let thisAngle = angleBetweenPoints(this.p1.x,this.p1.y, this.p2.x,this.p2.y);
      let p3 = createVector(mouseX,mouseY);
      let p4 = createVector(mouseX + cos(thisAngle+HALF_PI), mouseY + sin(thisAngle+HALF_PI));
      let intersection = findIntersection(this.p1, this.p2, p3, p4);
      let uA = intersection["uA"];
      if ((this.v < this.minSpread && this.grabbedHandle == 'boundsLeft') ||
          (this.v >= 1-this.minSpread && this.grabbedHandle == 'boundsRight')) {
        this.grabbedHandle = 'handle';
        this.updateV();
        return
      }
      this.spread = constrain(abs(uA - this.v)*2, this.minSpread,this.maxSpread);
    }
    
  }
  
  function getFilterSliderValues(filterSlider) {
    let handleV = map(filterSlider.v, 0,1, filterSlider.mini,filterSlider.maxi);
    let boundsLeftV = map(constrain(filterSlider.v-filterSlider.spread, 0,1), 0,1, filterSlider.mini,filterSlider.maxi);
    let boundsRightV = map(constrain(filterSlider.v+filterSlider.spread, 0,1), 0,1, filterSlider.mini,filterSlider.maxi);
    return {'v':handleV, 'left':boundsLeftV, 'right':boundsRightV, 'visible':this.visible};
  }