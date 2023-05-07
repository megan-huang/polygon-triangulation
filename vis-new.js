const SVG_NS = "http://www.w3.org/2000/svg"; // SVG namespace
const ROOT_ELEM = document.querySelector("#root"); // Root element
let SVG_ELEM = document.querySelector("#canvas"); // SVG element
let SVG_ELEM_ANIMATE = document.querySelector("#animate"); // SVG element
let time = 0;

/**
 * EAR CLIPPING ALGORITHM
 **/

// Cross product
function cross(v1, v2) {
  return v1.x * v2.y - v1.y * v2.x;
}

// Area of triangle given Points a, b, c
function areaOfTriangle(a, b, c) {
  let area = Math.abs(0.5 * cross(b.subtract(a), c.subtract(a)));
  return area;
}

// Delays animation
// Second argument: time in milliseconds (1000 = 1 second)
async function delay1000() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

// Delays animation
// Second argument: time in milliseconds (1000 = 1 second)
async function delay300() {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

// Returns true if p is inside the triangle formed by a, b, c
// If the area of OUTER_TRIANGLE is the same area of the INNER_TRIANGLES, then p is inside.
function pointInTriangle(p, a, b, c) {
  // Area of outer triangle (a, b, c)
  let outerTri = areaOfTriangle(a, b, c);

  // Area of inner triangles (a,b,p) && (a,c,p) && (b,c,p)
  let innerTri1 = areaOfTriangle(a, b, p);
  let innerTri2 = areaOfTriangle(a, c, p);
  let innerTri3 = areaOfTriangle(b, c, p);

  // Calculate sum
  let sum = innerTri1 + innerTri2 + innerTri3;

  // If sum is same, then p is inside
  if (sum == outerTri) {
    return true;
  } else {
    return false;
  }
}

// Circular array access
function accessArray(array, index) {
  if (index >= array.length) {
    return index % array.length;
  } else if (index < 0) {
    return (index % array.length) + array.length;
  } else {
    return index;
  }
}

// Takes in Point[] "vertices", id of polygon "idPolygon", and an instance of the Animate class for determining whether to animate
// Creates array for triangles (ints)
// Reference: https://www.geometrictools.com/Documentation/TriangulationByEarClipping.pdf and https://www.youtube.com/watch?v=QAdfkylpYwc
async function Triangulation(vertices, idPolygon, animate) {
  // vertices = array of vertices in polygon
  // idPolygon = id of polygon
  // animate = Animate class (contains bool value)

  // Handling trivial cases or errors.
  if (vertices.length < 3) {
    console.log("Needs at least 3 vertices.");
  }
  if (vertices.length == null) {
    console.log("Vertex list is null.");
  }

  // Storing the triangle ears.
  let triangles = [];

  // GOAL: checking the vertices and seeing if an ear can be created out of the prev, curr, and next vertex.
  // Two conditions must be passed.
  // 1) the curr vertex must be a convex angle.
  // 2) the other vertices of the polygon CANNOT be inside the triangle created by prev, curr, and next vertices.

  // Iterating through the list of vertices.
  let curIndex = 0;
  // While there are still more than three vertices in the "to-do" list:
  while (vertices.length > 3) {
    console.log("in while loop");
    // Continue checking for ears
    for (i = 0; i < vertices.length; i++) {
      console.log("vertices", vertices.length);
      if (vertices.length <= 3) {
        console.log("vertices", vertices.length);
        break;
      }
      console.log("in for loop");
      // Get cur, prev, next INDICES
      let a = i;
      let b = accessArray(vertices, i - 1);
      let c = accessArray(vertices, i + 1);

      // Get cur, prev, next VERTICES
      let va = vertices[a];
      let vb = vertices[b];
      let vc = vertices[c];

      // ANIMATE
      await delay1000();
      // Highlight the three vertices in question.
      animate.highlight([va, vb, vc]);
      // console.log("highlight ", time++);

      // Get the edges formed by AB and AC
      let va_to_vb = vb.subtract(va);
      let va_to_vc = vc.subtract(va);

      // CONDITION ONE:
      // Check if angle is convex (is ear)
      // If cross product of ab and ac is negative, interior angle is convex
      // Else reflex, then skips the curr vertex (cannot be ear)
      if (cross(va_to_vb, va_to_vc) >= 0) {
        console.log(
          "The angle is reflex: ",
          va_to_vb,
          " and ",
          va_to_vc,
          " and cross ",
          cross(va_to_vb, va_to_vc)
        );
        animate.checkConvex(false);
        await delay1000();
        animate.checkifEar(false);
        // console.log("The angle is reflex");
        continue;
      }

      // ANIMATE
      animate.checkConvex(true);

      //CONDITION TWO:
      // Check if other vertices are OUTSIDE proposed triangle (is ear)
      isEar = true; // Assumes ear (vertices are outside)

      // Checking through all other vertices in polygon
      for (j = 0; j < vertices.length; j++) {
        // Other vertices MUST be different from prev, curr, next (not already part of the triangle)
        if (j == a || j == b || j == c) {
          continue;
        }

        // Defining p as OTHER VERTEX

        p = vertices[j];

        console.log("vertices abcp", a, b, c, p);

        await delay300();
        animate.checkPointInTri(true, p);

        // If p is inside the triangle, NOT an ear
        // Skips the curr vertex (cannot be ear)
        if (pointInTriangle(p, vb, va, vc)) {
          // console.log("inside");
          isEar = false;

          // ANIMATE

          await delay1000();
          animate.checkifEar(false);

          break;
        }
      }

      // CONDITIONS ARE COMPLETED
      if (isEar) {
        // Make a new Polygon with the three points, and an id
        let tri = new Polygon([va, vb, vc], idPolygon);
        // Add it to the array
        triangles[curIndex++] = tri;

        // Remove the current vertex from the list of vertices
        vertices.splice(a, 1); //remove found curr vertex from list

        console.log("vertices at this point", vertices);

        // ANIMATE
        await delay1000();
        animate.checkPointInTri(false, p);
        await delay1000();
        animate.checkifEar(true, [va, vb, vc]);
        // console.log("checktimer");

        // break;
      }
    }
  }

  // Adding last three vertices (last triangle left)
  console.log("last three", vertices[0], vertices[1], vertices[2]);
  let tri = new Polygon([vertices[0], vertices[1], vertices[2]], idPolygon);
  triangles[curIndex++] = tri;

  // ANIMATE
  await delay1000();
  animate.checkifEar(true, [vertices[0], vertices[1], vertices[2]]);

  // Prints out final list of triangulated triangles
  for (let i = 0; i < triangles.length; i++) {
    // console.log(triangles[i]);
  }

  return triangles;
}

// Takes in Point[] and returns a string representation of them
function pointsToString(vertices) {
  let str = "";
  for (let i = 0; i < vertices.length; i++) {
    let x = vertices[i].x;
    let y = vertices[i].y;
    let id = vertices[i].id;

    str = str + x + "," + y + "," + id + " ";
  }
  return str;
}

/**
 * TODO:
 * - Fix draggable capability for newly created polygons
 * - "Scatter" method
 * - Convert array of points to "polygon" points string
 * - Expand SVG to whole screen
 * - Draw own polygon
 *
 */

// An object that represents a 2D point, consisting of an x-coordinate and a y-coordinate.
// Vector operations can be done (used for triangulation by doing cross multiplication operations on vertices).
class Point {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id;
  }

  // Vector operations
  // Add "this" to "other"
  add(other) {
    return new Point(this.x + other.x, this.y + other.y);
  }

  // Subtract "other" from "this"
  subtract(other) {
    return new Point(this.x - other.x, this.y - other.y);
  }

  // Return a string representation of this Point
  toString() {
    return "id:" + this.id + "(" + this.x + ", " + this.y + ")";
  }
}

class Polygon {
  constructor(arrPoints, id) {
    // arrPoints: Point[]
    // id: id of polygon for user (visualization/HTML) to switch between polygons
    this.arrPoints = arrPoints;
    this.id = id;
  }

  // Splitting the polygon into array of triangles
  triangulate(animate) {
    // Run Triangulation on the Point[], with this id, an instance of the Animate class
    let arrTri = Triangulation(this.arrPoints, this.id, animate);
    return arrTri;
  }

  // Prints out string of points
  toString() {
    let str = "{";
    for (let i = 0; i < this.arrPoints.length; i++) {
      str = str + this.arrPoints[i];
    }
    str = str + "}";
  }
}

// This code was heavily inspired by the source:
// https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
function makeDraggable(evt) {
  var svg = evt.target;
  var dragTarget = null;
  var offset = null;

  // Add event listeners for mouse interactions
  svg.addEventListener("mousedown", startDrag);
  svg.addEventListener("mousemove", drag);
  svg.addEventListener("mouseup", endDrag);
  svg.addEventListener("mouseleave", endDrag);

  function startDrag(evt) {
    // If the target SVG is draggable
    if (evt.target.classList.contains("draggable")) {
      dragTarget = evt.target;

      // Get the current mouse position and current transforms
      offset = getMousePosition(evt);
      var transforms = dragTarget.transform.baseVal;

      //
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
      // console.log("got to dragging");
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

/**
 * ANIMATION
 **/

class Animation {
  // svg = svg image that is being drawn on
  // bool = is triangulation animated?
  constructor(svg, bool) {
    this.svg = svg;
    this.bool = bool;
  }

  // Highlights three points that are passed in. These are the points that are being checked for isEar
  // Also includes drawing a line across for temp triangle
  // v1 is highlighted a DIFFERENT COLOR
  highlight(array) {
    // console.log("Made it to highlighting");
    // array = [v1,v2,v3]

    // Creates a line
    const newLine = document.createElementNS(SVG_NS, "line");
    newLine.setAttributeNS(null, "x1", array[0].x);
    newLine.setAttributeNS(null, "y1", array[0].y);
    newLine.setAttributeNS(null, "x2", array[1].x);
    newLine.setAttributeNS(null, "y2", array[1].y);
    newLine.setAttributeNS(null, "transform", "matrix(1, 0, 0, -1, 0, 500)");

    newLine.classList.add("line");
    SVG_ELEM.appendChild(newLine);

    const newLine2 = document.createElementNS(SVG_NS, "line");
    newLine2.setAttributeNS(null, "x1", array[1].x);
    newLine2.setAttributeNS(null, "y1", array[1].y);
    newLine2.setAttributeNS(null, "x2", array[2].x);
    newLine2.setAttributeNS(null, "y2", array[2].y);
    newLine2.setAttributeNS(null, "transform", "matrix(1, 0, 0, -1, 0, 500)");

    newLine2.classList.add("line");
    SVG_ELEM.appendChild(newLine2);

    const newLine3 = document.createElementNS(SVG_NS, "line");
    newLine3.setAttributeNS(null, "x1", array[2].x);
    newLine3.setAttributeNS(null, "y1", array[2].y);
    newLine3.setAttributeNS(null, "x2", array[0].x);
    newLine3.setAttributeNS(null, "y2", array[0].y);
    newLine3.setAttributeNS(null, "transform", "matrix(1, 0, 0, -1, 0, 500)");

    newLine3.classList.add("line");
    SVG_ELEM.appendChild(newLine3);

    for (let j = 0; j < array.length; j++) {
      let point = array[j];

      const newCircle = document.createElementNS(SVG_NS, "circle");
      newCircle.setAttributeNS(null, "cx", point.x);
      newCircle.setAttributeNS(null, "cy", point.y);

      // special highlighted option for v1
      if (j == 0) {
        newCircle.setAttributeNS(null, "style", "fill:blue !important");
      } else {
        newCircle.setAttributeNS(null, "fill", "white");
      }

      newCircle.setAttributeNS(
        null,
        "transform",
        "matrix(1, 0, 0, -1, 0, 500)"
      );
      newCircle.classList.add("vertex");
      SVG_ELEM.appendChild(newCircle);
    }
  }

  // if v1 is a convex, will show msg
  checkConvex(bool) {
    if (bool) {
      //msg "point is convex!"

      return;
    }

    //msg "point is NOT convex!"
  }

  // highlight other points in triangle (inside loop of pointInTriangle method)
  // show msg if it is in triangle or if it is not
  checkPointInTri(bool, vertex) {
    // vertex = highlighted (OTHER) vertex

    const newCircle = document.createElementNS(SVG_NS, "circle");
    newCircle.setAttributeNS(null, "cx", vertex.x);
    newCircle.setAttributeNS(null, "cy", vertex.y);
    newCircle.setAttributeNS(null, "style", "fill:red !important");
    newCircle.setAttributeNS(null, "transform", "matrix(1, 0, 0, -1, 0, 500)");

    newCircle.classList.add("vertex");
    SVG_ELEM.appendChild(newCircle);

    //checking if point is in triangle
    if (bool) {
      //msg "point is in triangle!"

      return;
    }

    //msg "point is NOT in triangle!"
  }

  // remove line
  // if isEar, then white triangle polygon is created
  checkifEar(bool, array) {
    // array = [v1,v2,v3]
    // remove line
    const ele_line = document.getElementsByClassName("line");
    while (ele_line.length > 0) {
      ele_line[0].parentNode.removeChild(ele_line[0]);
    }

    // remove vertex
    const ele_point = document.getElementsByClassName("vertex");
    while (ele_point.length > 0) {
      ele_point[0].parentNode.removeChild(ele_point[0]);
    }

    if (bool) {
      const newPolygon = document.createElementNS(SVG_NS, "polygon");
      points = pointToString(array);

      newPolygon.setAttributeNS(null, "points", points);
      newPolygon.setAttributeNS(null, "fill", "green");
      newPolygon.setAttributeNS(
        null,
        "transform",
        "matrix(1, 0, 0, -1, 0, 500)"
      );
      SVG_ELEM.appendChild(newPolygon);

      return;
    }
  }
}

/**
 * VISUALIZATION
 **/

function Visualizer(svg) {
  this.svg = svg;
  this.polygons = [];
  this.polygonElems = [];
  this.presets = new PresetPolygons();

  // Adds polygon onto an array
  this.addPolygon = function (pgn) {
    this.polygons.push(pgn);
  };

  // Change the preset polygon
  this.changePreset = function () {
    this.polygons = [this.presets.getNewPolygon()];
    // console.log(this.polygons);
  };

  // Draw all of the polygons currently in the polygon array
  this.drawPolygons = function () {
    // console.log("polys", this.polygons);

    for (let i = 0; i < this.polygons.length; i++) {
      // Making a new polygon
      const newPolygon = document.createElementNS(SVG_NS, "polygon");
      points = pointToString(this.polygons[i].arrPoints);

      newPolygon.setAttributeNS(null, "points", points);
      newPolygon.classList.add("draggable");

      const hue = Math.floor(Math.random() * 255);
      newPolygon.setAttributeNS(null, "fill", "hsl(" + hue + ", 100%, 85%)");
      newPolygon.setAttributeNS(null, "stroke", "hsl(" + hue + ", 100%, 15%)");
      newPolygon.setAttributeNS(
        null,
        "transform",
        "matrix(1, 0, 0, -1, 0, 500)"
      );

      SVG_ELEM.appendChild(newPolygon);
      this.polygonElems.push(newPolygon);
    }

    // Triangulating the current polygon
    this.triangulateVis = function () {
      let arrTri = [];
      // NEEDS A BUTTON TO CHANGE***************************************
      let animate = new Animation(svg, true);

      // Triangulating the polygon and pushing it onto new array
      for (let i = 0; i < this.polygons.length; i++) {
        // Triangulating the polygon and pushing it onto new array
        for (let i = 0; i < this.polygons.length; i++) {
          // Array of triangles (triangulated polygon)
          arrTri = this.polygons[i].triangulate(animate);
        }

        // Placing triangles into polygons array
        this.polygons = arrTri;
      }
    };
  };
}

// Translating between string to Point[] and vice versa
function pointToString(arrPoints) {
  // console.log(arrPoints);
  let str = "";
  for (let i = 0; i < arrPoints.length; i++) {
    str = str + arrPoints[i].x + "," + arrPoints[i].y + " ";
  }

  return str;
}

function stringToPoint(str) {
  let arr = str.split(" ");
  let arrPoints = [];

  for (let i = 0; i < arr.length; i++) {
    let coords = arr[i].split(",");
    let point = new Point(coords[0], coords[1], i);
    arrPoints.push(point);
  }

  return arrPoints;
}

const vis = new Visualizer(SVG_ELEM);
let strPolygon = "100,300, 400,200 550,250 600,20 700,100 750,350, 450,400";
const polygon = new Polygon(stringToPoint(strPolygon), 1);
vis.addPolygon(polygon);
vis.drawPolygons();

// Create a new clear SVG canvas.
let createNewSVG = function () {
  SVG_ELEM.innerHTML = "";
  vis.changePreset();
  vis.drawPolygons();
};

// Visualize the triangulation
function visualizeTriangulation() {
  vis.triangulateVis();
  vis.drawPolygons();
}

function PresetPolygons() {
  const strRabbit =
    "100,150 150,50 200,150 200,200 350,200 450,120 450,200 400,300 400,400 350,350 350,300 200,300 250,250";
  const rabbit = new Polygon(stringToPoint(strRabbit), 1);

  const strSquare = "100,300 100,100 300,100 300,300";
  const square = new Polygon(stringToPoint(strSquare), 2);

  const strStar = "100,300 400,200 550,250 600,20 700,100 750,350 450,400";
  const star = new Polygon(stringToPoint(strStar), 3);

  const arrPresets = [rabbit, square, star];

  // Which polygon we're currently on
  let curr = 0;

  // Get a new polygon from the presets
  this.getNewPolygon = function () {
    curr = (curr + 1) % arrPresets.length;
    // console.log(curr, "polygon length", arrPresets.length);
    // console.log(arrPresets[curr]);
    return arrPresets[curr];
  };
}
