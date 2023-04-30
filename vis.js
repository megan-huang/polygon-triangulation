const SVG_NS = "http://www.w3.org/2000/svg";
const ROOT_ELEM = document.querySelector("#root");
let SVG_ELEM = document.querySelector("#canvas");

/**
 * TODO:
 * - Fix draggable capability for newly created polygons
 * - "Scatter" method
 * - Convert array of points to "polygon" points string
 * - Expand SVG to whole screen
 * - Draw own polygon
 *
 */

// An object that represents a 2-d point, consisting of an
// x-coordinate and a y-coordinate. The `compareTo` function
// implements a comparison for sorting with respect to x-coordinates,
// breaking ties by y-coordinate.
function Point(x, y, id) {
  this.x = x;
  this.y = y;
  this.id = id;

  // Compare this Point to another Point p for the purposes of
  // sorting a collection of points. The comparison is according to
  // lexicographical ordering. That is, (x, y) < (x', y') if (1) x <
  // x' or (2) x == x' and y < y'.
  this.compareTo = function (p) {
    if (this.x > p.x) {
      return 1;
    }

    if (this.x < p.x) {
      return -1;
    }

    if (this.y > p.y) {
      return 1;
    }

    if (this.y < p.y) {
      return -1;
    }

    return 0;
  };

  // return a string representation of this Point
  this.toString = function () {
    return "(" + x + ", " + y + ")";
  };
}

function Polygon(pts, id) {
  this.pts = pts;
  this.id = id;
}

function makeDraggable(evt) {
  console.log("in make draggable");
  // This code was heavily inspired by the source:
  // https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
  var svg = evt.target;
  var dragTarget = null;
  var offset = null;

  svg.addEventListener("mousedown", startDrag);
  svg.addEventListener("mousemove", drag);
  svg.addEventListener("mouseup", endDrag);
  svg.addEventListener("mouseleave", endDrag);

  function startDrag(evt) {
    if (evt.target.classList.contains("draggable")) {
      dragTarget = evt.target;
      console.log("started");

      offset = getMousePosition(evt);

      var transforms = dragTarget.transform.baseVal;

      if (
        transforms.length === 0 ||
        transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE
      ) {
        // Create an transform that translates by (0, 0)
        var translate = svg.createSVGTransform();
        translate.setTranslate(0, 0);
        // Add the translation to the front of the transforms list
        dragTarget.transform.baseVal.insertItemBefore(translate, 0);
      }
      // Get initial translation amount
      transform = transforms.getItem(0);
      offset.x -= transform.matrix.e;
      offset.y -= transform.matrix.f;
    }
  }
  function drag(evt) {
    if (dragTarget != null) {
      evt.preventDefault();
      var coord = getMousePosition(evt);
      transform.setTranslate(coord.x - offset.x, coord.y - offset.y);
      console.log("got to dragging");
    }
  }
  function endDrag(evt) {
    dragTarget = null;
  }

  function getMousePosition(evt) {
    var CTM = svg.getScreenCTM();
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d,
    };
  }
}

function Visualizer(svg) {
  this.svg = svg;

  this.drawPolygon = function (pgn) {
    const newPolygon = document.createElementNS(SVG_NS, "polygon");
    points = pgn.pts;
    newPolygon.setAttributeNS(null, "points", points);
    newPolygon.classList.add("draggable");

    const hue = Math.floor(Math.random() * 255);
    newPolygon.setAttributeNS(null, "fill", "hsl(" + hue + ", 100%, 85%)");
    newPolygon.setAttributeNS(null, "stroke", "hsl(" + hue + ", 100%, 15%)");

    // makeDraggable(svg);
    svg.appendChild(newPolygon);
  };
}

function PresetPolygons() {
  const rabbit = new Polygon(
    "100,150 150,50, 200,150, 200,200, 350,200, 450,120, 450,200, 400,300, 400,400, 350,350, 350,300, 200,300, 250,250, 100,150",
    1
  );
  const square = new Polygon("100,300 300,300, 300,100 100,100", 2);
  const star = new Polygon(
    "100,300, 400,200 550,250 600,20 700,100 750,350, 450,400",
    3
  );
  const polygons = [rabbit, square, star];

  let curr = 0;

  this.getNewPolygon = function () {
    curr = (curr + 1) % polygons.length;
    console.log(curr);
    return polygons[curr];
  };
}

const presets = new PresetPolygons();

// Create a new clear SVG canvas.
let createNewSVG = function () {
  let newSVG = document.createElementNS(SVG_NS, "svg");
  newSVG.setAttributeNS(null, "id", "canvas");
  newSVG.setAttributeNS(null, "width", "900");
  newSVG.setAttributeNS(null, "height", "500");
  newSVG.setAttributeNS(null, "fill", "white");
  newSVG.setAttributeNS(null, "onload", "makeDraggable(evt)");

  let rect = document.createElementNS(SVG_NS, "rect");
  rect.setAttributeNS(null, "width", "900");
  rect.setAttributeNS(null, "height", "500");
  rect.setAttributeNS(null, "fill", "white");
  rect.setAttributeNS(null, "transform", "matrix(1, 0, 0, -1, 0, 500)");

  newSVG.appendChild(rect);
  ROOT_ELEM.removeChild(SVG_ELEM);
  SVG_ELEM = newSVG;
  ROOT_ELEM.appendChild(SVG_ELEM);

  const vis = new Visualizer(SVG_ELEM);
  const polygon = presets.getNewPolygon();
  vis.drawPolygon(polygon);
};

const vis = new Visualizer(SVG_ELEM);
const polygon = new Polygon(
  "100,300, 400,200 550,250 600,20 700,100 750,350, 450,400",
  1
);
vis.drawPolygon(polygon);

/**
 *
 * MAY OR MAY NOT NEED POINT SET IN THE FUTURE.
 *
 */

// An object that represents a set of Points in the plane. The `sort`
// function sorts the points according to the `Point.compareTo`
// function. The `reverse` function reverses the order of the
// points. The functions getXCoords and getYCoords return arrays
// containing x-coordinates and y-coordinates (respectively) of the
// points in the PointSet.
// function PointSet() {
//   this.points = [];
//   this.curPointID = 0;

//   // create a new Point with coordintes (x, y) and add it to this
//   // PointSet
//   this.addNewPoint = function (x, y) {
//     this.points.push(new Point(x, y, this.curPointID));
//     this.curPointID++;
//   };

//   // add an existing point to this PointSet
//   this.addPoint = function (pt) {
//     this.points.push(pt);
//   };

//   // sort the points in this.points
//   this.sort = function () {
//     this.points.sort((a, b) => {
//       return a.compareTo(b);
//     });
//   };

//   // reverse the order of the points in this.points
//   this.reverse = function () {
//     this.points.reverse();
//   };

//   // return an array of the x-coordinates of points in this.points
//   this.getXCoords = function () {
//     let coords = [];
//     for (let pt of this.points) {
//       coords.push(pt.x);
//     }

//     return coords;
//   };

//   // return an array of the y-coordinates of points in this.points
//   this.getYCoords = function () {
//     let coords = [];
//     for (pt of this.points) {
//       coords.push(pt.y);
//     }

//     return coords;
//   };

//   // get the number of points
//   this.size = function () {
//     return this.points.length;
//   };

//   // return a string representation of this PointSet
//   this.toString = function () {
//     let str = "[";
//     for (let pt of this.points) {
//       str += pt + ", ";
//     }
//     str = str.slice(0, -2); // remove the trailing ', '
//     str += "]";

//     return str;
//   };
// }
