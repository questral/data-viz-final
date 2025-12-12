
class BarChart {
    constructor(x,y,w,h, xAxisTitle,xMin,xMax,xTickSize, yAxisTitle,yMin,yMax,yTickSize, rankings,data) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.xAxisTitle = xAxisTitle; this.xMin = xMin; this.xMax = xMax; this.xTickSize = xTickSize;
        this.yAxisTitle = 'frequency'; this.yMin = yMin; this.yMax = yMax; this.yTickSize = yTickSize;
        this.data = data;
        this.filtered = false;

        this.bars = [];
        for (let i=0; i<rankings.length; i++) {
            let word = rankings[i][0];
            let wordData = this.data[word];
            let wordRanking = i + 1;
            this.bars.push(new Bar(word, wordRanking, wordData));
        }
        this.barW1 = 10; //for just frequency
        this.barW2 = 40; //for emotional detail
        this.margin = 40;
    }

    display(scrollY, hovered) {
        if (scrollY < this.y || scrollY > this.y+this.h+windowHeight+200) {
            return;
        }
        
        let hoveredEmotion = null;
        let hoveredIntensity = null;
        if (hovered) {
            let barI = hovered['i'];
            hoveredEmotion = hovered['emotion'];
            hoveredIntensity = this.bars[barI].data['emotions'][hoveredEmotion];
        }

        push();
        translate(this.x,this.y);
        

        //draw gridlines
        let xTickSpacing = ((this.w-(this.margin*2))/(this.xMax-this.xMin)) * this.xTickSize;
        let yTickSpacing = (this.h/(this.yMax-this.yMin)) * this.yTickSize;
        for (let y=this.h; y>=0; y-=yTickSpacing) {
            stroke(0, 50); strokeWeight(1);
            line(0,y, this.w,y);
        }

        //draw bars
        push();
        translate(0,this.h);
        let step = (this.w - (this.margin*2))/(this.xMax-this.xMin);
        if (!this.filtered) {
            for (let i=this.xMin; i<=min(this.xMax, this.bars.length-1); i++) {
                let bar = this.bars[i-1];
                // print(bar);
                let barV = bar.v;
                let barX = this.margin + ((bar.rank-this.xMin)*step);
                let barW2;
                if ('emotions' in bar.data) {
                    barW2 = this.barW2;
                } else {
                    barW2 = 0;
                }
                let barH = constrain(map(barV, this.yMin,this.yMax, 0,this.h), 0,this.h);
                bar.display(barX, this.barW1,barW2,barH);
            }
        } else {
            let barCounter = 0;
            let i = this.xMin-1;
            while (barCounter <= this.xMax-this.xMin && i<this.bars.length) {
                let bar = this.bars[i];
                // print(bar);
                if ('emotions' in bar.data) {
                    let barV = bar.v;
                    let barX = this.margin + (barCounter*step);
                    let barH = constrain(map(barV, this.yMin,this.yMax, 0,this.h), 0,this.h);
                    bar.display(barX, this.barW1,this.barW2,barH);
                    barCounter++;
                }
                i++
            }
        }
        
        pop();


        //draw axes
        stroke(0); strokeWeight(2);
        line(0,0, 0,this.h);
        line(0,this.h, this.w,this.h);

        //draw ticks
        let tickLength = 3;
        let tickOffset = 3;
        let maxV = this.bars[0].v;
        let maxVY = map(maxV, this.yMin,this.yMax, this.h,0);
        textSize(12);
        let maxVTextBuffer = 12;

        textAlign(RIGHT,CENTER);
        let yI = 0;
        for (let y=this.h; y>=0; y-=yTickSpacing) {
            stroke(0); strokeWeight(1);
            line(-tickOffset,y, -tickOffset-tickLength,y);
            let tickV = this.yMin + (this.yTickSize*yI);
            let idealTextSpacing = 50;
            let everyOther = floor(idealTextSpacing / yTickSpacing)
            if (yI%everyOther == 0 && y-maxVY > maxVTextBuffer) {
                noStroke(); fill(0);
                text(tickV, -tickOffset-tickLength-5, y-3);
            }
            yI++;
        }
        stroke(0); strokeWeight(1);
        line(-tickOffset,maxVY, -tickOffset-tickLength,maxVY);
        noStroke(); fill(0);
        text(maxV, -tickOffset-tickLength-5, maxVY-3);

        textAlign(CENTER,TOP);
        let xI = 0;
        for (let x=this.margin; x<=this.w; x+=xTickSpacing) {
            stroke(0); strokeWeight(1);
            line(x,this.h+tickOffset, x,this.h+tickOffset+tickLength);
            noStroke(); fill(0);
            let tickV = this.xMin + xI;
            text(tickV, x,this.h+tickOffset+tickLength+2);
            xI++;
        }

        //draw labels
        textSize(12);
        fill(255); noStroke();
        textAlign(CENTER,TOP);
        let labelY = this.h+tickLength+25;
        if (this.filtered) {
            text('Top ' + this.xMax + ' Most Popular Words (Filtered)', this.w/2, labelY);
        } else {
            text('Top ' + this.xMax + ' Most Popular Words', this.w/2, labelY);
        }
        
        push();
        translate(0, this.h/2);
        rotate(-HALF_PI);
        textAlign(CENTER,BOTTOM);
        let labelX = -tickLength-30;
        text(this.yAxisTitle, 0, labelX);
        pop();
        
        if (hovered != null) {
            setTooltip(hoveredEmotion, hoveredIntensity);
        }

        pop();
    }

    findBarHover() {
        if (!inBox(mouseX,mouseY, this.x,this.y,this.w,this.h)) {
            return;
        }

        let barCounter = 0;
        let i = this.xMin;
        while (barCounter <= this.xMax-this.xMin && i<this.bars.length) {
            let bar = this.bars[i-1];
            i++;

            let barV = bar.v;
            let barW = this.barW1;
            if ('emotions' in bar.data) {
                barW += this.barW2;
            } else {
                if (this.filtered) {
                    continue;
                }
            }
            let barH = constrain(map(barV, this.yMin,this.yMax, 0,this.h), 0,this.h);
            let step = (this.w - (this.margin*2))/(this.xMax-this.xMin);
            let barX = this.x + this.margin + ((barCounter)*step) - (barW/2);
            let barY = (this.y + this.h) - barH;
            if (inBox(mouseX,mouseY, barX+this.barW1,barY,barW,barH)) {
                
                let vTotal = 0;
                for (let emotion in bar.data['emotions']) {
                    let v = bar.data['emotions'][emotion];
                    vTotal += v;
                }
                let yProgress = 0;
                for (let emotion in bar.data['emotions']) {
                    let v = bar.data['emotions'][emotion];
                    let emotionW = this.barW2;
                    let emotionH = map(v, 0,vTotal, 0,barH);
                    let emotionX = barX + this.barW1;
                    let emotionY = (this.y+this.h) - yProgress - emotionH;
                    if (inBox(mouseX,mouseY, emotionX,emotionY,emotionW,emotionH)) {
                        return {'i':i-2, 'emotion':emotion}; //minus 2 bc rank is 1 indexed and we do i++ early
                    }
                    yProgress += emotionH;
                }
            }
            barCounter++;
        }
    }
}

class Bar {
    constructor(label, rank, data) {
        this.label = label;
        this.rank = rank;
        this.data = data;
        this.v = data['freq'];
    }

    display(x, w1,w2,h) {
        push();
        translate(x,0);

        fill(255); stroke(0); strokeWeight(2);
        let startX = -(w1+w2)/2;
        rect(startX,0, w1,-h);
        // rect(startX+w1,0, w2,-h);

        let vTotal = 0;
        for (let emotion in this.data['emotions']) {
            let v = this.data['emotions'][emotion];
            vTotal += v;
        }

        let yProgress = 0;
        for (let emotion in this.data['emotions']) {
            let v = this.data['emotions'][emotion];
            let emotionH = map(v, 0,vTotal, 0,h);
            let emotionC = emotionsPalette[emotion];
            fill(emotionC); noStroke();
            rect(startX+w1,-yProgress, w2,-emotionH);
            yProgress += emotionH;
        }

        noFill(); stroke(0); strokeWeight(2);
        rect(startX+w1,0, w2,-h); //outline on top

        textSize(12);
        textAlign(CENTER,BOTTOM);
        let labelOffset = 10;
        fill(255); noStroke();
        text(this.label, 0,-h-labelOffset);

        pop();
    }

}