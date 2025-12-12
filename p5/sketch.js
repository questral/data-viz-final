let font;
let filterSliders = [];
let filterSlidersCount = 0;
let parallelSetStatic, parallelSet;
let scatterPlots = [];
let previewScatterPlot1;
let scatterPlotCount = 0;
let tooltip = null;
let barCharts = [];
let umap;
let umapDragging = false;
let umapBuffer;
let filterBarChart = false;

let textBoxes = [];
let spacers = [];

let palette;
let emotionsPalette;

let nrcAllWords, nrcInvalidWords, turingAllWords, turingInvalidWords, turingRankings;
let intersection, union;
let emotions = ['anger','anticipation','disgust','fear','joy','sadness','surprise','trust'];

let totalPageHeight;

function preload() {
  nrcAllWords = loadJSON('../exports/nrcAllWords.json');
  nrcInvalidWords = loadJSON('../exports/nrcInvalidWords.json');
  turingAllWords = loadJSON('../exports/turingAllWords.json');
  turingInvalidWords = loadJSON('../exports/turingInvalidWords.json');
  turingRankings = loadStrings('../exports/turingRankings.txt');
  intersection = loadJSON('../exports/intersection.json');
  union = loadJSON('../exports/union.json');
  umapData = loadJSON('../exports/umapData.json');

  font = loadFont('fonts/Lexend-Regular.ttf');
}

function setup() {
  totalPageHeight = windowHeight*10;
  createCanvas(windowWidth, totalPageHeight);
  textFont(font);

  palette = [0, 30, 60, 90, 120, 150, 180, 210];
  emotionsPalette = {
    'anger': palette[0],
    'anticipation': palette[1],
    'disgust': palette[2],
    'fear': palette[3],
    'joy': palette[4],
    'sadness': palette[5],
    'surprise': palette[6],
    'trust': palette[7]
  }

  for (let i=0; i<turingRankings.length; i++) {
    turingRankings[i] = turingRankings[i].split(' ');
    turingRankings[i][1] = int(turingRankings[i][1]);
  }


  let allText = [
    "How would you prove you’re a human in one word?",
    "On November 9, 2025, linguist and content creator Etymology Nerd uploaded a Youtube Short, analyzing a study that posed this exact question. In the video, he talks about the potential philosophies that may have been behind the chosen most “human” words, from a linguistic perspective. But the video came to mind again when I later found a dataset mapping words to the intensity of certain emotions. I was curious if there was any correlation between the words we saw as most “human” and their emotional palette. What else could that information reveal about us?",
    200,
    "The video by Etymology Nerd references the study A Minimal Turing Test by John P. McCoy and Tomer D. Ullman, created in 2018. In this first study, participants were asked to imagine themselves in a hypothetical test. They, along with a robot, would each be allowed to say one word to assert themselves as the human, and the other as the fake — at the risk of death. The data from this study is a list of every word offered by the participants, with a count of how many times it was said.",
    "In asking the question in the context of comparison to a robot, we might be inclined to pick less obvious words, words that the robot would also find easy to guess.",
    "The second dataset I’m using is called the Emotion Intensity Lexicon, created by Saif M. Mohammad in 2020. For 8 emotions, participants were asked to rate a given word on how much it embodied that emotion on a scale from 0 to 1, with 1 being the highest. The emotions were anger, anticipation, disgust, fear, joy, sadness, surprise, and trust.",
    200,
    "Before we can do any analysis, we have to clean up the data. Both datasets came with non-English words (like “sohappy” or “captcha”), so those had to be removed from the pool to do accurate assesments.",
    "Additionally, both datasets contain different words. Since we’re working with the intersection between the datasets, we can only fully analyze the words that appear in both, which is not many — 154, to be exact. But we can still see notable trends when we pull the data apart.",
    500,
    "Let’s start with frequency alone. Looking at the top several words, we already get a sense of what the dominant approach was to the test of humanity. Some of these might be words you’d expect. Love takes the top spot, followed by compassion, human, and please.",
    "But not all of these were in both datasets. Let’s narrow this down to only the words with an emotional profile.",
    500,
    "The colored bars show the intensity of the emotions given, resized to match the height of the bar. What we see here is the proportions of emotions that make up each word. Note how we can get a sense for that emotional palette just through the colors it presents.",
    "To explore further, we should try visualizing every word at once.",
    "Let’s see if we can draw any conclusions by looking at each emotion by itself. For each of the 8 emotion categories, we’ll plot every word associated with that emotion on a scatterplot. Words get more intense as they move right, and more frequently said as they reach the top. We won’t add a word if it was never associated with that emotion, and we’ll also gray out the words that were only said once. (We also cut the word love, as it distorts the scale so much that the other trends become invisible.)",
    "What we might want to see is clusters near the top; that means that a bunch of the “most human” words had a similar intensity for that emotion.",
    400,
    "When we do this, we do see some pretty big clusters! The taller these bumps are, the more popular those emotions were in the participants’ responses. The most noticeable bumps are in anticipation, joy, and trust. These bumps are around the middle of the intensity scale for anticipation and joy, but fairly intense for trust.",
    100,
    "Okay, so what conclusions can we draw from that? Not much.",
    "While the individual emotion graphs are interesting, there isn’t really enough information to make an emotional profile of humanity. It seems that people took different approaches. The plot for fear has two peaks; one near the far left, and one near the right. That means both high intensity and low intensity fear words were both seen as human.",
    300,
    "So maybe there isn’t a most human set of emotions, but there are definitely distinct interpretations of what humanity is. How can we better see what those interpretations are?",
    "We can’t quite turn every emotion into an axis on a graph because there are so many of them. But there are other options.",
    "Using Uniform Manifold Approximation and Projection (UMAP), we can try to statistically group our words based on similarity to each other. This way, if there are any words that have multiple matching emotions, we can see more populated groups on our graph.",
    "We can also filter the graph using the sliders, allowing us to search for and reveal clusters of matching emotions.",
    800,
    "While this of course isn't a definitive answer to the emotions we associate with humanity, it's at least a start. With more data, new patterns could be discovered."
  ];

  setupText(allText);

  let startX, startY;

  //bar charts
  let maxV = turingRankings[0][1];
  startX = 100; startY = spacers[2].y+80;
  barChart1 = new BarChart(startX,startY,1200,400,
                           'ranking',1,16,1, 'frequency',0,(maxV*1.025),10, turingRankings, union);
  barChart1.barW1 = 50;
  barChart1.barW2 = 0;

  startX = 100; startY = spacers[3].y+80;
  barChart2 = new BarChart(startX,startY,1200,400,
                           'ranking',1,16,1, 'frequency',0,(maxV*1.025),10, turingRankings, union);
  barChart2.filtered = true;
  barCharts.push(barChart1);
  barCharts.push(barChart2);

  // scatter plots
  let previewScatterPlotW = 230;
  let scatterPlotW = 85;
  let scatterPlotXSpacing =55; let scatterPlotYSpacing = scatterPlotXSpacing;
  let totalW = previewScatterPlotW + (scatterPlotW*4) + (scatterPlotXSpacing*5);
  startX = (width-totalW)/2 + 50; startY = spacers[4].y+(scatterPlotXSpacing*2);
  previewScatterPlot1 = new ScatterPlot(startX,startY,previewScatterPlotW,previewScatterPlotW,
                                       '',0,1,0.25, '',0,35,5, null, intersection, true);
  startX+= 300; startY = spacers[4].y+100;
  scatterPlots.push(previewScatterPlot1);
  
  for (let i=0; i<4; i++) { //columns
    for (let j=0; j<2; j++) { //rows
      let scatterPlotX = startX + (i*(scatterPlotW+scatterPlotXSpacing));
      let scatterPlotY = startY + (j * (scatterPlotYSpacing+scatterPlotW));
      let emotionIndex = (j*4) + i;
      scatterPlots.push(new ScatterPlot(scatterPlotX,scatterPlotY,scatterPlotW,scatterPlotW,
                        '',0,1,0.25, '',0,35,5, emotions[emotionIndex], intersection));
    }
  }
  scatterPlots.push(new ScatterPlot((width-previewScatterPlotW)/2,spacers[6].y+50,previewScatterPlotW,previewScatterPlotW,
                                    '',0,1,0.25, '',0,35,5, 'fear', intersection, true));

  //umap
  startX = 100; startY = spacers[7].y+100;
  let umapW = 600; let umapH = 700;
  umap = new UMAP(startX,startY, umapW,umapH, 1, umapData, intersection, filterSliders);
  umapBuffer = createGraphics(umapW,umapH);
  umapBuffer.textFont(font);

  startX = 750; startY = spacers[7].y + 150;
  let sliderXSpacing = 150; let sliderYSpacing = 70;
  let sliderW = 200;
  for (let i=0; i<2; i++) { //columns
    for (let j=0; j<4; j++) { //rows
      let sliderX1 = startX + (i * (sliderW+sliderXSpacing)); let sliderX2 = sliderX1 + sliderW;
      let sliderY = startY + (j * sliderYSpacing);
      let emotionIndex = (j*2) + i;
      filterSliders.push(new FilterSlider(sliderX1,sliderY,sliderX2,sliderY,
                                          emotions[emotionIndex], 0,1, 0,0.8));
    }
  }

  //parallel sets
  // startX = 100; startY = 2000;
  // parallelSetStatic = new ParallelSet(startX,startY,1200,300, emotions, intersection);
  startX = umapW + 150; startY = spacers[7].y+500;
  parallelSet = new ParallelSet(startX,startY,600,200, emotions, intersection);
  

}

function setupText(textList) {
  let pageProgress = 400;
  for (let paragraph of textList) {
    let newTextBox;
    if (typeof paragraph == 'number') {
      newTextBox = new TextBox('', pageProgress,700, 18);
      newTextBox.h = paragraph;
      spacers.push(newTextBox);
    } else {
      newTextBox = new TextBox(paragraph, pageProgress,700, 18)
    }
    textBoxes.push(newTextBox);
    pageProgress += newTextBox.h;
  }
}

function draw() {
  // print(window.scrollY);
  // print(map(window.scrollY, 0,height-windowHeight, 0,100));
  let scrollY = window.scrollY + windowHeight + 100;
  // let scrollProgress = map(window.scrollY, 0,height-windowHeight, 0,1);

  tooltip = null;

  background(100);
  // stroke(0); strokeWeight(2);
  // sCurve(width/2,height/2, (width/2)+100,(height/2)+200, 0);

  let titleW = 1000; let subtitleW = 850; let textBoxW = 700;
  textWrap(WORD);
  textAlign(CENTER,TOP);
  textSize(72);
  textLeading(68);
  fill(255); noStroke();
  text("The emotions of humanity", (width-titleW)/2,200, titleW); //Proving we're not AI
  textSize(28);
  textLeading(28);
  // text("What are the emotions of the most “human” words?",
  //      (width-subtitleW)/2,260, subtitleW);

  

  for (let textBox of textBoxes) {
    textBox.display(scrollY);
  }
  
  // let barChartHovered1 = barChart1.findBarHover();
  barChart1.display(scrollY);
  let barChartHovered2 = barChart2.findBarHover();
  barChart2.display(scrollY,barChartHovered2); //filter bool, then pass in hovering

  for (let filterSlider of filterSliders) {
    filterSlider.constrainVs();
    filterSlider.fixDragStatus();
    filterSlider.display(scrollY);
  }
  
  for (let scatterPlot of scatterPlots) {
    let scatterPlotHovered = scatterPlot.findDotHover();
    scatterPlot.display(scrollY,scatterPlotHovered);
  }

  let umapHovered = umap.findDotHover();
  umap.display(scrollY, umapBuffer, umapHovered);

  // parallelSetStatic.display(scrollY);
  let parallelSetHovered = parallelSet.findWordHover();
  if (parallelSetHovered == null) {
    parallelSetHovered = umapHovered;
  }
  parallelSet.display(scrollY,parallelSetHovered);


  if (tooltip != null) {
    drawTooltip(tooltip['left'], tooltip['right']);
  }

}

function mousePressed() {
  for (let scatterPlot of scatterPlots) {
    if (scatterPlot.preview == false && inBox(mouseX,mouseY, scatterPlot.x,scatterPlot.y,scatterPlot.w,scatterPlot.h)) {
      previewScatterPlot1.emotion = scatterPlot.emotion;
    }
  }
  for (let filterSlider of filterSliders) {
    if (filterSlider.checkHandlesDrag() == null) {
      filterSlider.checkButton();
    }
  }
  if (inBox(mouseX,mouseY, umap.x,umap.y,umap.w,umap.h)) {
    umapDragging = true;
  }
}

function mouseDragged() {
  for (let filterSlider of filterSliders) {
    filterSlider.moveHandles();
  }
  if (umapDragging) {
    let dX = mouseX-pmouseX; let dY = mouseY-pmouseY;
    umap.pan(dX,dY);
  }
}

function mouseReleased() {
  umapDragging = false;
}

function mouseWheel(event) {
  if (inBox(mouseX,mouseY, umap.x,umap.y,umap.w,umap.h)) {
    let zoomAmount = event.delta;
    let zoomX = mouseX-umap.x; let zoomY = mouseY-umap.y;
    umap.zoomAtPoint(zoomAmount, zoomX,zoomY);

    return false;
  }
}

function keyPressed() {
  // if (key == 'f') {
  //   barChart1.filtered = !barChart1.filtered;
  // }
}

function windowResized() {
  resizeCanvas(windowWidth, totalPageHeight);
}

function angleBetweenPoints(x1,y1, x2,y2) {
  push();
  translate(x1,y1);
  let relativeX = x2-x1;
  let relativeY = y2-y1;
  let angle = atan2(relativeY,relativeX);
  pop();
  return angle;
}

function distToLine(pX,pY, lineP1, lineP2) {
  let angle = angleBetweenPoints(lineP1.x,lineP1.y, lineP2.x,lineP2.y);
  let p3 = createVector(pX,pY);
  let p4 = createVector(pX + cos(angle+HALF_PI), pY + sin(angle+HALF_PI));
  let lineIntersection = findIntersection(lineP1, lineP2, p3, p4);
  let intersectionX = constrain(lineIntersection["x"], min(lineP1.x,lineP2.x),max(lineP1.x,lineP2.x));
  let intersectionY = constrain(lineIntersection["y"], min(lineP1.y,lineP2.y),max(lineP1.y,lineP2.y));
  return dist(intersectionX,intersectionY, pX,pY);
}

function getEndpoints(centerPX,centerPY, angle, r) {
  let x1Offset = (cos(angle)*r);
  let y1Offset = (sin(angle)*r);
  let p1 = createVector(centerPX-x1Offset, centerPY-y1Offset);
  let p2 = createVector(centerPX+x1Offset, centerPY+y1Offset);
  return {'p1':p1, 'p2':p2};
  
}

function findIntersection(p1, p2, p3, p4) {
  let x1 = p1.x; let y1 = p1.y;
  let x2 = p2.x; let y2 = p2.y;
  let x3 = p3.x; let y3 = p3.y;
  let x4 = p4.x; let y4 = p4.y;
  
  let uA = (((x4-x3)*(y1-y3))-((y4-y3)*(x1-x3))) / (((y4-y3)*(x2-x1))-((x4-x3)*(y2-y1)));
  let uB = (((x2-x1)*(y1-y3))-((y2-y1)*(x1-x3))) / (((y4-y3)*(x2-x1))-((x4-x3)*(y2-y1)));
  let intersectionX = x1 + uA*(x2 - x1);
  let intersectionY = y1 + uA*(y2 - y1);
  //uA and uB are the location of the intersection along the line as a ratio of its length
  // thank you Paul Bourke
  // https://paulbourke.net/geometry/pointlineplane/
  let lineIntersection = {"x":intersectionX, "y":intersectionY, "uA":uA, "uB":uB};
  return lineIntersection;
  // if (uA>=0 && uA<=1 && uB>=0 && uB<=1) { //if the intersection is within the bounds of both lines    
  // }
}

function inBox(pX,pY, rectX,rectY,rectW,rectH) {
  return (rectX <= pX && pX < rectX+rectW &&
          rectY <= pY && pY < rectY+rectH);
}

function posterize(v, mini,maxi,stages) {
  v = v - mini;
  diff = maxi - mini;
  step = diff / (stages-1);
  return (floor(v/step)*step) + mini;
}

function findBucket(v, mini,maxi,stages) { //idk what to call this
  v = v - mini;
  diff = maxi - mini;
  step = diff / (stages-1);
  return floor(v/step);
}

function sCurve(x1,y1, x2,y2, angle) {
  noFill();
  let xDiff = x2 - x1;
  let straightAmount = 0.3;
  beginShape();
    vertex(x1,y1);
    vertex(x1 + (straightAmount*xDiff), y1);
    vertex(x2 - (straightAmount*xDiff), y2);
    vertex(x2,y2);
  endShape();
}

function setTooltip(leftText, rightText) {
  tooltip = {'left':leftText, 'right':rightText};
}

function drawTooltip(leftText, rightText) {
  textSize(14);
  leftText = str(leftText); rightText = str(rightText);
  let wordBoundsLeft = font.textBounds(leftText, 0,0);
  let wordBoundsRight = font.textBounds(rightText, 0,0);
  let wordWLeft = wordBoundsLeft.w;
  let wordWRight = wordBoundsRight.w;
  let wordH = font.textBounds('Yy', 0,0).h;
  let tooltipXMargin = 5;
  let tooltipYMargin = 3;
  let tooltipGutter = 10;
  let tooltipW = max(wordWLeft + wordWRight + (tooltipXMargin*2), 85);
  if (rightText != undefined) { tooltipW += tooltipGutter; }
  let tooltipH = wordH * 1.8;
  let tooltipX = 5;
  let tooltipY = -tooltipH - 5;
  
  push();
  translate(mouseX,mouseY);
  fill(255); stroke(0); strokeWeight(2);
  rect(tooltipX,tooltipY, tooltipW,tooltipH)
  fill(0); noStroke();
  textAlign(LEFT,TOP);
  text(leftText, tooltipX+tooltipXMargin,tooltipY+tooltipYMargin);
  textAlign(RIGHT,TOP);
  text(rightText, (tooltipX+tooltipW)-tooltipXMargin,tooltipY+tooltipYMargin);
  pop();
}

function checkCompliance(word) {
  let allOff = true;
  for (let filterSlider of filterSliders) {
      if (filterSlider.visible == false) {
          continue;
      } else {
          allOff = false;
      }
  }
  if (allOff) {
      return true;
  }
  //otherwise...
  for (let filterSlider of filterSliders) {
      if (filterSlider.visible == true) {
          let bounds = getFilterSliderValues(filterSlider);
          let minV = bounds['left']; let maxV = bounds['right'];
          let emotion = filterSlider.emotion;
          let wordData = intersection[word]['emotions'];
          if (emotion in wordData) {
              let wordV = wordData[emotion];
              if (minV > wordV || wordV > maxV) {
                  return false;
              }
          } else {
              return false;
          }
          
      } else { //filterSlider.visible == false
          continue;
      }
      
  }
  return true;
}

class TextBox {
  constructor(content, y,w, fontSize) {
    this.content = content;
    this.y = y;
    this.w = w;
    this.fontSize = fontSize;
    this.margin = 50;
    // this.h = font.textBounds(this.content, 0,0,this.fontSize).h;
    this.h = floor(this.content.length / 80) * this.fontSize;
    this.h += (this.margin*2);

  }

  display() {
    push();
    translate(0,this.y+this.margin);
    textSize(this.fontSize);
    textAlign(CENTER,TOP);
    textLeading(this.fontSize * 1.1);
    fill(255); noStroke();
    text(this.content, (width-this.w)/2, 0, this.w);
    pop();
  }
}