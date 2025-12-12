
class UMAP {
    constructor(x,y,w,h, zoom, data, intersection, filterSliders) {
        this.x = x; this.y = y;
        this.w = w; this.h = h;
        // this.zoom = zoom
        this.data = data

        let metadata = data['metadata']
        // this.originX = this.w/2; this.originY = this.h/2;
        this.minX = metadata['minX']; this.minY = metadata['minY'];
        this.maxX = metadata['maxX']; this.maxY = metadata['maxY'];
        let dataW = this.maxX-this.minX; let dataH = this.maxY-this.minY;
        let startMargin = 40;
        let availableW = this.w-(startMargin*2); let availableH = this.h-(startMargin*2);
        this.zoom = constrainScale(dataW,dataH, availableW,availableH);
        this.startZoom = this.zoom;
        this.translateX = (-this.minX*this.zoom)+startMargin; this.translateY = (-this.minY*this.zoom)+startMargin;
        this.translateX += (availableW-(dataW*this.zoom))/2; this.translateY += (availableH-(dataH*this.zoom))/2;

        this.intersection = intersection;
        this.filterSliders = filterSliders;
    }

    getRadius(freq) {
        let scaleAmount = 1.5; //(this.zoom/this.startZoom) * (30/(this.zoom/2))*1.3;
        let dotSize = map(freq, 1,40, 5*scaleAmount,40*scaleAmount);
        dotSize = constrain(dotSize, 2, 40*scaleAmount);
        // dotSize *= 1/scaleAmount;
        return dotSize;
    }

    findPointBounds(word) {
        let wordData = this.data['words'][word]
        let wordX = wordData['x']; let wordY = wordData['y'];
        let newX = (wordX*this.zoom)+this.translateX; let newY = (wordY*this.zoom)+this.translateY;
        let freq = wordData['freq'];
        let newR = this.getRadius(freq);
        return {'x':newX, 'y':newY, 'r':newR};
    }

    display(scrollY, buffer, hovered) {
        if (scrollY < this.y || scrollY > this.y+this.h+windowHeight+200) {
            return;
        }

        let closestWord = null;
        if (hovered) {
            closestWord = hovered;
        }

        push();
        translate(this.x,this.y);

        buffer.background(100);
        let dataW = (this.maxX-this.minX)*this.zoom; let dataH = (this.maxY-this.minY)*this.zoom;
        let cX = ((this.minX*this.zoom)+this.translateX)+(dataW/2);
        let cY = ((this.minY*this.zoom)+this.translateY)+(dataH/2);
        let gridSpacing = this.zoom * 1;
        buffer.stroke(0,80); buffer.strokeWeight(1);
        let lineX, lineY;
        lineX = cX+gridSpacing;
        while (lineX < this.w) {
            buffer.line(lineX,0, lineX,this.h);
            lineX += gridSpacing;
        }
        lineX = cX;
        while (lineX > 0) {
            buffer.line(lineX,0, lineX,this.h);
            lineX -= gridSpacing;
        }
        lineY = cY+gridSpacing;
        while (lineY < this.h) {
            buffer.line(0,lineY, this.w,lineY);
            lineY += gridSpacing;
        }
        lineY = cY;
        while (lineY > 0) {
            buffer.line(0,lineY, this.w,lineY);
            lineY -= gridSpacing;
        }

        let words = this.data['words']
        for (let word in words) {
            let freq = word['freq'];
            let pointBounds = this.findPointBounds(word);
            let x = pointBounds['x']; let y = pointBounds['y']; let r = pointBounds['r'];
            if (!inBox(x,y, -r,-r,this.w+(r*2),this.h+(r*2))) {
                continue
            }

            buffer.fill(100); buffer.stroke(0); buffer.strokeWeight(1);
            buffer.circle(x,y, r);
        }
        for (let word in words) {
            let pointBounds = this.findPointBounds(word);
            let x = pointBounds['x']; let y = pointBounds['y']; let r = pointBounds['r'];
            if (!inBox(x,y, -r,-r,this.w+(r*2),this.h+(r*2))) {
                continue
            }

            if (!checkCompliance(word)) {
                continue;
            }

            buffer.fill(250); buffer.stroke(0); buffer.strokeWeight(1);
            buffer.circle(x,y, r);
        }

        for (let word in words) {
            let pointBounds = this.findPointBounds(word);
            let x = pointBounds['x']; let y = pointBounds['y']; let r = pointBounds['r'];
            if (!inBox(x,y, -r,-r,this.w+(r*2),this.h+(r*2))) {
                continue
            }

            if (!checkCompliance(word)) {
                continue;
            }

            let relativeScale = this.zoom/this.startZoom;
            buffer.fill(250); buffer.stroke(0); buffer.strokeWeight(1); buffer.strokeJoin(ROUND);
            buffer.textSize(5 + (relativeScale*4)); buffer.textAlign(LEFT,CENTER);
            buffer.text(word, x+(r/2)+3,y-2);
        }

        image(buffer, 0,0);
        noFill(); stroke(0); strokeWeight(2);
        rect(0,0, this.w,this.h)

        fill(255); noStroke();
        textAlign(LEFT,BASELINE);
        textSize(12);
        text('Scroll to zoom. Drag to pan.',20,this.h-20);
        pop();

        this.constrainTranslate();

        if (closestWord != null) {
            let freq = words[closestWord]['freq'];
            setTooltip(closestWord, freq);
        }
    }

    pan(xAmount, yAmount) {
        this.translateX += xAmount; this.translateY += yAmount;
        this.constrainTranslate();
    }

    zoomAtPoint(amount, x,y) {
        amount *= 0.03;
        let minZoom = 20; let maxZoom = 400;
        let xDiff = this.translateX - x;
        let yDiff = this.translateY - y;
        let newX = this.translateX + (xDiff*amount);
        let newY = this.translateY + (yDiff*amount);
        if (this.zoom * (1+amount) > maxZoom) {
            // this.zoom = maxZoom;
        } else if (this.zoom * (1+amount) < minZoom) {
            // this.zoom = minZoom;
        } else {
            this.zoom *= 1+amount;
            this.zoom = constrain(this.zoom, minZoom,maxZoom);
            this.translateX = newX; this.translateY = newY;
        }
        this.constrainTranslate();
    }

    constrainTranslate() {
        let dataW = (this.maxX-this.minX)*this.zoom; let dataH = (this.maxY-this.minY)*this.zoom;
        let cX = ((this.minX*this.zoom)+this.translateX)+(dataW/2);
        let cY = ((this.minY*this.zoom)+this.translateY)+(dataH/2);
        // let relativeScale = this.zoom/this.startZoom;
        let escapeThreshold = min(dataW, dataH) * 0.4;
        // push();
        // translate(this.x,this.y);
        // fill(0);
        // circle(cX,cY,10);
        // noFill();
        // rect(-escapeThreshold,-escapeThreshold,this.w+(escapeThreshold*2),this.h+(escapeThreshold*2));
        // pop();
        if (inBox(cX,cY, -escapeThreshold,-escapeThreshold,this.w+(escapeThreshold*2),this.h+(escapeThreshold*2))) {
            return;
        }
        // print('out of bounds');
        if (-escapeThreshold > cX) {
            this.translateX -= cX+escapeThreshold;
        } else if (cX > this.w+escapeThreshold) {
            this.translateX -= cX-(this.w+escapeThreshold);
        }
        if (-escapeThreshold > cY) {
            this.translateY -= cY+escapeThreshold;
        } else if (cY > this.h+escapeThreshold) {
            this.translateY -= cY-(this.h+escapeThreshold);
        }
    }

    findDotHover() {
        if (!inBox(mouseX,mouseY, umap.x,umap.y,umap.w,umap.h)) {
            return;
        }

        let hoverThresholdDist = 5;
        let words = this.data['words']
        let closestWord = null;
        let closestWordDist = null;
        let closestWordR = 0;
        for (let word in words) {
            let pointBounds = this.findPointBounds(word);
            let x = pointBounds['x']; let y = pointBounds['y'];
            let r = (pointBounds['r']/2);
            x += this.x; y += this.y;
            let distToWord = dist(mouseX,mouseY, x,y) - r;

            if ((closestWordDist == null || distToWord <= closestWordDist)) {
                closestWordDist = distToWord;
                closestWord = word;
                closestWordR = r;
            }
        }

        if (closestWordDist < hoverThresholdDist) {
            return closestWord;
        }
        return null;
    }
    
}

function constrainScale(sourceW,sourceH, frameW,frameH) {
    let sourceAspect = sourceW/sourceH;
    let frameAspect = frameW/frameH;
    let scaleFactor;
    
    if (frameW != null || frameH != null) {
      if (frameW == null) {
        scaleFactor = frameH/sourceH;
      } else if (frameH == null) {
        scaleFactor = frameW/sourceW;
      } else {  
        if (sourceAspect >= frameAspect) { //if the source is proportionally wider than the frame
          scaleFactor = frameW/sourceW;
        } else { //if the frame is proportionally wider than the img
          scaleFactor = frameH/sourceH;
        }
    
      }
    } else {
      return null;
    }
    
    return scaleFactor;
  }