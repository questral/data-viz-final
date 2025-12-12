
class ParallelSet {
    constructor(x,y,w,h, categories, data) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.categories = categories; //ordered list of emotions
        this.categorySpacing = this.w / (this.categories.length-1);
        this.data = data;
        this.margin = 5;
    }

    display(scrollY, hovered, selected) {
        if (scrollY < this.y || scrollY > this.y+this.h+windowHeight+200) {
            return;
        }

        let closestWord = null;
        if (hovered) {
            closestWord = hovered;
        }

        push();
        translate(this.x,this.y);

        //draw axis lines and category labels
        textSize(12);
        textAlign(CENTER,BASELINE);
        for (let i=0; i<this.categories.length; i++) {
            let categoryX = i * this.categorySpacing;
            stroke(0); strokeWeight(2);
            line(categoryX,0, categoryX,this.h);
            fill(255); noStroke();
            text(this.categories[i], categoryX,-10);
        }

        let top = this.margin;
        let bottom = this.h - this.margin;
        let tickLength = 6;
        stroke(0); strokeWeight(2);
        line(-tickLength,top,0,top);
        line(-tickLength,bottom,0,bottom);
        line(-tickLength,this.h/2,0,this.h/2);
        textAlign(RIGHT,CENTER);
        fill(0); noStroke();
        text(0, -tickLength-5,bottom-1);
        text(1, -tickLength-5,top-1);

        //draw word lines
        let prevWordY;
        for (let word in this.data) {
            if (!checkCompliance(word)) {
                continue;
            }

            if (closestWord == null) {
                stroke(255); strokeWeight(1);
            } else {
                if (word == closestWord) {
                    stroke(255); strokeWeight(3);
                } else {
                    stroke(200,50); strokeWeight(1);
                }
            }
            prevWordY = null;
            for (let i=0; i<this.categories.length; i++) {
                let category = this.categories[i];
                let prevWordX = (i-1) * this.categorySpacing;
                let wordX = i * this.categorySpacing;
                let wordY;
                if (category in this.data[word]['emotions']) {
                    let intensity = this.data[word]['emotions'][category];
                    wordY = intensity;
                } else {
                    wordY = 0;
                }
                if (prevWordY != null) {
                    line(prevWordX,map(prevWordY, 0,1, bottom,top), wordX,map(wordY, 0,1, bottom,top));
                }
                prevWordY = wordY;
            }
        }
        pop();

        if (closestWord != null) {
            let freq = this.data[closestWord]['freq'];
            setTooltip(closestWord, freq);
        }
    }

    findWordHover() {
        let top = this.y + this.margin;
        let bottom = (this.y + this.h) - this.margin;
        if (!inBox(mouseX,mouseY, this.x,this.y+this.margin,this.w,this.h-this.margin)) {
            return;
        }

        let closestWord = null;
        let closestWordDist = null;
        let panel = findBucket(mouseX, this.x,this.x+this.w, this.categories.length);
        let prevCategory = this.categories[panel];
        let category = this.categories[panel+1];

        let testCounter = 0;
        for (let word in this.data) {
            if (testCounter >= this.testCounter) {
                break;
            }
            testCounter++;

            if (!checkCompliance(word)) {
                continue;
            }

            let prevWordV = this.data[word]['emotions'][prevCategory] || 0;
            let wordV = this.data[word]['emotions'][category] || 0;
            // prevWordV = (prevWordV == undefined ? 0 : prevWordV);
            // wordV = (wordV == undefined ? 0 : wordV);
            
            let prevWordX = (panel * this.categorySpacing) + this.x;
            let prevWordY = map(prevWordV, 0,1, bottom,top);
            let prevWordPos = createVector(prevWordX,prevWordY);
            let wordX = ((panel+1) * this.categorySpacing) + this.x;
            let wordY = map(wordV, 0,1, bottom,top);
            let wordPos = createVector(wordX,wordY);
            let distToWord = distToLine(mouseX,mouseY, prevWordPos,wordPos);
            let hoverThresholdDist = 5;
            if ((closestWordDist == null || distToWord <= closestWordDist)) {
                closestWordDist = distToWord;
                closestWord = word;
            }
        }
        
        let hoverThresholdDist = 10;
        if (closestWordDist < hoverThresholdDist) {
            return closestWord;
        }
        return null;
    }
}