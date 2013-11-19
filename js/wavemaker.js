var dStr = "";
var call = 0;
var type = "wide";
var h1 = "", h2="";
var ctrlPts = new Array();
var cp = 0;
function getRandPath(numTpts,type){
	var h = "";
	var rVals = new Array();
	var tString = "";
	var spread = Math.round(vW/numTpts);
	var xVal = spread;
	var startPt = "";
	if(type=="wide"){
		startPt = (call%2==0) ? "0,400" : "0,600";
		for(x=0;x<numTpts;x++){
			if(x%2==0){
				rVals[x] = Math.round(Math.random()*150)+xVal;
			}
			else if(x%2!=0){
					rVals[x] = 220+Math.round(Math.random()*250)+1;
			}
			if(x%2==0){tString += "T"+rVals[x]}
			else if(x%2==1){tString += ","+rVals[x]}
			xVal += spread;
		}
	}
	else if(type=="def"){
		var xOffset = 350;
		var yOffset = 350;
		var randRange = 400;
		for(x=0;x<6+numTpts;x++){
			rVals[x] = Math.round(Math.random()*400+350) ;
			if(x>=6){
				// X val
				if(x%2==0){
					tString += "T"+ rVals[x];
				}
				// Y val
				else if(x%2==1){
					tString += ","+ rVals[x];
				}	
			}
		}
	}
	var preStr = "M"+rVals[4]+","+rVals[5]+" Q"+rVals[0]+","+rVals[1]+","+rVals[2]+","+rVals[3];
	var postStr = "T"+rVals[4]+","+rVals[5] + "Z";
	if(call==0){
		h1 =  preStr + tString + postStr;
		h = h1;
	}
	else{
		h2 = preStr + tString + postStr;
		h = h2;
	}
	dStr = (call%2==0) ? h + "<br/>" : dStr+h;
	
	dStr = 'var curve1 = "' + h1 + '"; var curve2 = "' + h2 + '";';
	document.getElementById("data").innerHTML = dStr;
	call++;
	return(h);
}
var pthStr = "";
var pStr = "";
var curve1="", curve2="";

function genCurve(mode,type,c1,c2,loop,fade){
  	if(mode=="rand"){
		  curve1 = getRandPath(7,type);
		  curve2 = getRandPath(7,type);
  	}
  	else if(mode=="preset"){
	  curve1 = (c1!=null) ? c1 : curve1;
	  curve2 = (c2!=null) ? c2 : curve2;
  	}
	var cv1 = "#0000ff";
	var cv2 = "#006600";
  	Raphael("holder", vW, vH, function () {
		var r = this,
		p = r.path(curve1);
		p.attr({"stroke":cv1,"stroke-width":5,"opacity":0});
		pb = r.path(curve2);
		pb.attr({"stroke":cv2,"stroke-width":5,"opacity":0});
		
		var obj1 = p.getBBox();
		var obj2 = pb.getBBox();

		var lft = (obj1.x<obj2.x) ? obj1.x : obj2.x;
		var rt = (obj1.x2>obj2.x2) ? obj1.x2 : obj2.x2;
		var top = (obj1.y<obj2.y) ? obj1.y : obj2.y;
		var bot = (obj1.y2>obj2.y2) ? obj1.y2 : obj2.y2;
		
		var totalW = Math.round(rt-lft);
		var totalH = Math.round(bot-top);
		var totalCX = Math.round(lft+(totalW/2));
		var totalCY = Math.round(top+(totalH/2));
	
		var cx = parseInt(vW/2);
		var cy = parseInt(vH/2);
		
		var transX = cx-totalCX;
		var transY = cy-totalCY;
		
		p.transform('"t'+transX+','+transY+'"');
		pb.transform('"t'+transX+','+transY+'"');

		len = p.getTotalLength(),
		pbLen = pb.getTotalLength();
		// the lines array is necessary for being able to redraw the curves/lines; can also be used to dump the svg data for processing
		var lines = new Array();
		var n = 0;
		var x=0, x2=0;
		function Line(startX, startY, endX, endY, raphael) {
   			var start = {x: startX,y: startY};
   			var end = {x: endX,y: endY};
			var getPath = function() {
       			return "M" + start.x + "," + start.y + " L" + end.x + "," + end.y;
   			}
   			var redraw = function() {
       			node.attr("path", getPath());
   			}
   			var node = raphael.path(getPath());
			return(node)
		}

		var rInit=96, rVal = rInit;
		var gInit=96, gVal = gInit;
		var bInit=96, bVal = bInit;
		
		var rez = 1;
		var skew = 0;
		var ln = (pbLen>len) ? pbLen : len;
		var segs = parseInt(ln/rez);
		var rLimit = 50;
		var gLimit = 100;
		var bLimit = 123;
		var rShift = (rInit<rLimit) ? 1 : -1;
		var gShift = (gInit<gLimit) ? 1 : -1;
		var bShift = (bInit<bLimit) ? 1 : -1;
		var rOp = (rInit<rLimit) ? ">=" : "<=";
		var gOp = (rInit<gLimit) ? ">=" : "<=";
		var bOp = (rInit<bLimit) ? ">=" : "<=";
		var yFactor = 0; //Math.round(Math.random()*1000);
		var yFactor2 = 0; //Math.round(Math.random()*1000);
		var sx = 1.0; 	// scale factor
		var sw = .5;	// line thickness
		var op = 0.35;	// opacity
		
		function drawIt(){
			if(n<=segs){
				var pts = p.getPointAtLength(x+=rez);
				var pts2 = pb.getPointAtLength(x+skew);
				var shiftPt = 500;
				var colFreq = 1;  // apply color shift every n lines
				if(x>shiftPt && x%colFreq==0){
					rVal = (eval(rVal+rOp+rLimit)) ? rVal : rVal+rShift;
					gVal = (eval(gVal+gOp+gLimit)) ? gVal : gVal+gShift;
					bVal = (eval(bVal+bOp+bLimit)) ? bVal : bVal+bShift;
				}
				var colVal = "rgb(" + rVal + "," + gVal + "," + bVal + ")";
				lines[n]= Line((sx*pts.x),(sx*pts.y)-yFactor,(sx*pts2.x),(sx*pts2.y)-yFactor2,r);
				lines[n].attr({"stroke":colVal, "stroke-width": sw});
				lines[n].attr({"opacity":op});
				lines[n].transform('"t'+transX+','+transY+'"');
				n++;
				var timer = setTimeout(drawIt,1);
			}
			else{
				clearTimeout(timer);
			}
		}
		drawIt();
  	});
}
var vW = $(window).width();
var vH = $(window).height();
 
window.onload = function(){	
	var d = document.getElementById('holder');
	var c = document.getElementById('canv');
	genCurve("rand","def",null,null,false,false);
}