
class ScatterPlot {
    constructor(x,y,w,h, xAxisTitle,xMin,xMax,xTickSize, yAxisTitle,yMin,yMax,yTickSize, emotion,data, preview) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.xAxisTitle = emotion; this.xMin = xMin; this.xMax = xMax; this.xTickSize = xTickSize;
        this.yAxisTitle = 'freq'; this.yMin = yMin; this.yMax = yMax; this.yTickSize = yTickSize;
        this.emotion = emotion;
        this.data = data;
        this.preview = (preview ? preview : false)

        this.id = scatterPlotCount;
        scatterPlotCount++;
    }

    display(scrollY, hovered) {
        if (scrollY < this.y || scrollY > this.y+this.h+windowHeight+200) {
            return;
        }

        let closestWord = null;
        if (hovered) {
            closestWord = hovered;
        }
        
        push();
        translate(this.x,this.y);

        //draw bounding box
        if (!this.preview && inBox(mouseX,mouseY, this.x,this.y,this.w,this.h)) {
            fill(200,20); stroke(200); strokeWeight(1);
            let boundingBoxMargin = 5;
            rect(-boundingBoxMargin,-boundingBoxMargin, this.w+(boundingBoxMargin*2),this.h+(boundingBoxMargin*2));
        }
        
        //draw axes
        stroke(0); strokeWeight(2);
        line(0,0, 0,this.h);
        line(0,this.h, this.w,this.h);

        //draw ticks
        let tickLength = 3;
        let tickOffset = 3;
        let xTickSpacing = (this.w/(this.xMax-this.xMin)) * this.xTickSize;
        let yTickSpacing = (this.h/(this.yMax-this.yMin)) * this.yTickSize;
        textSize(12);
        let maxVTextBuffer = 20;
        
        textAlign(RIGHT,CENTER);
        let yI = 0;
        for (let y=this.h; y>=0; y-=yTickSpacing) {
            stroke(0); strokeWeight(1);
            line(-tickOffset,y, -tickOffset-tickLength,y);
            let tickV = this.yMin + (this.yTickSize*yI);
            let idealTextSpacing = 50;
            let everyOther = floor(idealTextSpacing / yTickSpacing);
            if ((yI%everyOther == 0 && y > maxVTextBuffer) || y <= 1) {
                noStroke(); fill(0);
                text(tickV, -tickOffset-tickLength-5, y-3);
            }
            yI++;
        }
        textAlign(CENTER,TOP);
        let xI = 0;
        for (let x=0; x<=this.w; x+=xTickSpacing) {
            stroke(0); strokeWeight(1);
            line(x,this.h+tickOffset, x,this.h+tickOffset+tickLength);
        }
        noStroke(); fill(0);
        text(this.xMin, 0,this.h+tickOffset+tickLength+2);
        text(this.xMax, this.w,this.h+tickOffset+tickLength+2);

        //draw dots
        if (this.emotion != null) {
            for (let word in this.data) {
                let v = this.data[word]['emotions'][this.emotion] || 0;
                let freq = this.data[word]['freq'];
                if (v < this.xMin || v > this.xMax ||
                    freq < this.yMin || freq > this.yMax) {
                    continue;
                }
                let dotProperties = this.encodeDot(v, freq);
                let dotX = dotProperties['x']; let dotY = dotProperties['y'];
                let dotSize = dotProperties['size']; let dotC = dotProperties['c'];
                fill(dotC); stroke(0); strokeWeight(1);
                circle(dotX,dotY, dotSize); //mapping size to # of ppl, color intensity to emotional intensity
            }
        }

        //draw labels
        textSize(12);
        fill(255); noStroke();
        textAlign(CENTER,TOP);
        let labelY = this.h+tickLength+20;
        if (this.emotion != null) {
            text(this.emotion, this.w/2, labelY);
        } else {
            text('', this.w/2, labelY);
        }

        push();
        translate(0, this.h/2);
        rotate(-HALF_PI);
        textAlign(CENTER,BOTTOM);
        let labelX = -tickLength-30;
        text(this.yAxisTitle, 0, labelX);
        pop();

        pop();

        if (closestWord != null) {
            let freq = this.data[closestWord]['freq'];
            setTooltip(closestWord, freq);
        }
    }

    encodeDot(v, freq) {
        let dotX = map(v, this.xMin,this.xMax, 0,this.w);
        let dotY = map(freq, this.yMin,this.yMax, this.h,0);
        let dotSize;
        let dotC;
        if (v == 0 || freq == 1) {
            dotSize = 4;
            dotC = 100;
        } else {
            dotSize = map(freq, this.yMin,this.yMax, 5,15);
            dotC = map(v, 0,1, 100,255);
        }
        if (this.preview) {
            dotSize *= 1.5;
        }
        return {'x':dotX, 'y':dotY, 'size':dotSize, 'c':dotC};
    }

    findDotHover() {
        if (!inBox(mouseX,mouseY, this.x,this.y,this.w,this.h)) {
            return;
        }

        let closestWord = null;
        let closestWordDist = null;
        let closestWordR = 0;
        for (let word in this.data) {
            let v = this.data[word]['emotions'][this.emotion] || 0;
            let freq = this.data[word]['freq'];
            if (v < this.xMin || v > this.xMax ||
                freq < this.yMin || freq > this.yMax) {
                continue;
            }
            let dotProperties = this.encodeDot(v, freq);
            let dotX = dotProperties['x'] + this.x; let dotY = dotProperties['y'] + this.y;
            let dotR = dotProperties['size']/2;
            let distToWord = dist(mouseX,mouseY, dotX,dotY);

            if ((closestWordDist == null || distToWord <= closestWordDist)) {
                closestWordDist = distToWord;
                closestWord = word;
                closestWordR = dotR;
            }
        }

        let hoverThresholdDist = 5;
        if (closestWordDist < closestWordR + hoverThresholdDist) {
            return closestWord;
        }
        return null;
    }
}