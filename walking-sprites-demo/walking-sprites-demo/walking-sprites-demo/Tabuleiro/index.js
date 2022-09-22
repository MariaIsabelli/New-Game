var Beziercurve = function(startPt,controlPt1,controlPt2,endPt){
    this.startPt = startPt;
    this.controlPt1 = controlPt1;
    this.controlPt2 = controlPt2;
    this.endPt = endPt;
    this.length = this.getLength();
  }
  
 
  
  Beziercurve.prototype.getXY = function(percent){
    CubicN = function(pct, a,b,c,d) {
      var t2 = pct * pct;
      var t3 = t2 * pct;
      return a + (-a * 3 + pct * (3 * a - a * pct)) * pct
        + (3 * b + pct * (-6 * b + b * 3 * pct)) * pct
        + (c * 3 - c * 3 * pct) * t2
        + d * t3;
    };
    var x=CubicN(percent,this.startPt.x,this.controlPt1.x,this.controlPt2.x,this.endPt.x);
    var y=CubicN(percent,this.startPt.y,this.controlPt1.y,this.controlPt2.y,this.endPt.y);
    return({x:Math.floor(x),y:Math.floor(y)});
  };
  
  Beziercurve.prototype.getLength = function(){
    var foo = [];
    var length = 0;
    for(var i = 0; i <= 30; i++){
      foo[i] = this.getXY(i/30);
    }
    for(var i = 1; i <= 30; i++){
      var a = foo[i-1].x - foo[i].x;
      var b = foo[i-1].y - foo[i].y;
      length += Math.sqrt( a*a + b*b );
    }
    return length;
  }
  

  
  var BoardPassGenerator = function(steps, coordinates) {
  
    var self = this;
    this.numberSteps = 18;
    this.snap = Snap("#generated-steps");
    this.sellingCount = 0;
    this.steps = steps;
    this.counter = document.querySelector('.controls .currentcount');
  

  
    this.bezierCurves = [];
    coordinates.forEach(function(coordinate, i){
      self.bezierCurves[i] = new Beziercurve(coordinate[0], coordinate[1], coordinate[2], coordinate[3]);
    });
  
   
    this.pathSections = [0];
    for (var i = 0; i < this.bezierCurves.length; i++) {
      this.pathSections.push(this.bezierCurves[i].length + this.pathSections[i]);
    }
  
    
    this.totalLength = this.pathSections[this.pathSections.length-1];
  
    this.init = function (cb) {
     
      this.sellingCount = 0;
      document.getElementById("generated-steps").innerHTML = "";
      this.counter.innerHTML = this.numberSteps;
  
      this.drawSteps(this.numberSteps);
      if(cb && typeof cb === "function") cb();
    };
  
    this.drawSteps = function(j) {
      for (var i = 0; i <= j; i++) {
        var xy, section, sectionPercent;
        var distanceFromStart = i / j * this.totalLength;
        var pathSections = this.pathSections;
        
        section = pathSections.filter(function(value){return value <= distanceFromStart}).length - 1;
       
        section = Math.min(section, pathSections.length - 2)
  
        sectionPercent = (section > 0) ? ((distanceFromStart - pathSections[section]) / (pathSections[section +1] - pathSections[section])) : (distanceFromStart / pathSections[section + 1]);
  
        xy=this.bezierCurves[section].getXY(sectionPercent);
  
        this.drawStep(xy, i);
      }
    };
  
    this.drawStep = function(point, index) {
  
      
  
      var step;
  
      switch (index) {
        case 0:
        step = "start";
        break;
        case this.numberSteps:
        step = "finish";
        break;
        default:
        step = this.steps[index % this.steps.length];
      }
  
      if(step === "checkpoint"){
        this.sellingCount++;
        var count = this.snap.text(-8, 10, this.sellingCount)
        var icon = this.snap.use(step + "-mtx");
        var group = this.snap.g(icon, count);
        count.attr({
          style: "fill: #002A3F;font-size:22.1472px;",
          transform: "matrix(1,0,0,1,3,-2)"
        })
        group.attr({
          transform: "translate("+point.x+", "+point.y+")"
        })
      } else {
        var icon = this.snap.use(step + "-mtx");
        icon.attr({
          transform: "translate("+point.x+", "+point.y+")"
        });
      }
  
    };
  
  }
  
 
  
  window.onload = function() {
  
    var steps = [
        "checkpoint",
        "regular",
        "star",
        "regular",
        "mystery"
    ];
    
    var coordinates = [
      [{x:690.5, y:495.0}, {x:681.5, y:480.0}, {x:621.0, y:423.3}, {x:572.5, y:410.0}],
      [{x:572.5, y:410.0}, {x:450.4, y:376.5}, {x:380.5, y:473.0}, {x:241.5, y:460.0}],
      [{x:241.5, y:460.0}, {x:102.5, y:447.0}, {x:106.5, y:293.0}, {x:215.5, y:267.0}],
      [{x:215.5, y:267.0}, {x:324.5, y:241.0}, {x:447.5, y:265.0}, {x:600.5, y:289.0}],
      [{x:600.5, y:289.0}, {x:753.5, y:313.0}, {x:782.5, y:112.0}, {x:594.5, y:101.0}],
      [{x:594.5, y:101.0}, {x:406.5, y:90.0}, {x:274.5, y:168.0}, {x:122.5, y:112.7}],
    ];
    
    var boardPassGenerator = new BoardPassGenerator(steps, coordinates);
    var moreButton = document.getElementById('buttonmore');
    var lessButton = document.getElementById('buttonless');
  
    function buttonEvent(isIncrement, target){
      boardPassGenerator.numberSteps += isIncrement? 1 : -1;
      boardPassGenerator.init();
      target.classList.add('clicked')
      setTimeout(function(){target.classList.remove('clicked')}, 100);
    }
    
    moreButton.addEventListener('click', function(){
      buttonEvent(true, this);
    });
  
    lessButton.addEventListener('click', function(){
      buttonEvent(false, this);
    });
  
    boardPassGenerator.init();
  
  };