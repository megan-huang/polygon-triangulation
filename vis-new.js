const SVG_NS = "http://www.w3.org/2000/svg"; // SVG namespace
const ROOT_ELEM = document.querySelector("#root"); // Root element
let SVG_ELEM = document.querySelector("#canvas"); // SVG element
let SVG_ELEM_ANIMATE = document.querySelector("#animate"); // SVG element
let time = 1000;

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
  await new Promise((resolve) => setTimeout(resolve, time - 300));
}

// Delays animation
// Second argument: time in milliseconds (1000 = 1 second)
async function delay300() {
  await new Promise((resolve) => setTimeout(resolve, time - 850));
}

// Delays animation
// Second argument: time in milliseconds (1000 = 1 second)
async function delayset() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
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
    // Continue checking for ears
    for (i = 0; i < vertices.length; i++) {
      if (vertices.length <= 3) {
        break;
      }
      // Get cur, prev, next INDICES
      let a = i;
      let b = accessArray(vertices, i - 1);
      let c = accessArray(vertices, i + 1);

      // Get cur, prev, next VERTICES
      let va = vertices[a];
      let vb = vertices[b];
      let vc = vertices[c];

      // ANIMATE
      animate.bool ? await delay1000() : "";
      // Highlight the three vertices in question.
      animate.highlight([va, vb, vc]);

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
        animate.bool ? await delay1000() : "";
        animate.clearPoints([va, vb, vc]);
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

        // If p is inside the triangle, NOT an ear
        // Skips the curr vertex (cannot be ear)
        if (pointInTriangle(p, vb, va, vc)) {
          isEar = false;

          // ANIMATE

          animate.bool ? await delay1000() : "";
          animate.checkPointInTri(true, p);
          animate.bool ? await delay1000() : "";
          animate.clearPoints([va, vb, vc]);

          break;
        } else {
          animate.bool ? await delay300() : "";
          animate.checkPointInTri(false, p);
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

        // ANIMATE
        animate.bool ? await delay1000() : "";
        animate.checkPointInTri(false, p);
        animate.bool ? await delay1000() : "";
        animate.clearPoints([va, vb, vc]);
        animate.checkifEar(true, [va, vb, vc]);

        // break;
      }
    }
  }

  // Adding last three vertices (last triangle left)
  let tri = new Polygon([vertices[0], vertices[1], vertices[2]], idPolygon);
  triangles[curIndex++] = tri;

  // ANIMATE
  animate.bool ? await delay1000() : "";
  animate.checkifEar(true, [vertices[0], vertices[1], vertices[2]]);

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
    this.polygonElems = [];
  };

  // Draw a given polygon
  this.drawPolygon = function (pgn) {
    const newPolygon = document.createElementNS(SVG_NS, "polygon");
    points = pointToString(pgn);

    newPolygon.setAttributeNS(null, "points", points);

    const hue = Math.floor(Math.random() * 255);
    newPolygon.setAttributeNS(null, "fill", "hsl(" + hue + ", 100%, 85%)");
    newPolygon.setAttributeNS(null, "stroke", "hsl(" + hue + ", 100%, 15%)");

    SVG_ELEM.appendChild(newPolygon);
    this.polygonElems.push(newPolygon);
  };

  // Draw all of the polygons currently in the polygon array
  this.drawPolygons = function () {
    for (let i = 0; i < this.polygons.length; i++) {
      // Making a new polygon
      const newPolygon = document.createElementNS(SVG_NS, "polygon");
      points = pointToString(this.polygons[i].arrPoints);

      newPolygon.setAttributeNS(null, "points", points);
      // newPolygon.classList.add("draggable");

      const hue = Math.floor(Math.random() * 255);
      newPolygon.setAttributeNS(null, "fill", "hsl(" + hue + ", 100%, 85%)");
      newPolygon.setAttributeNS(null, "stroke", "hsl(" + hue + ", 100%, 15%)");

      SVG_ELEM.appendChild(newPolygon);
      this.polygonElems.push(newPolygon);
    }
  };

  // Triangulating the current polygon
  this.triangulateVis = function (bool) {
    let arrTri = [];
    // NEEDS A BUTTON TO CHANGE***************************************
    let animate = new Animation(svg, bool);

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

  // Scattering the polygon's triangulated peices (tangram functionality)
  this.scatter = function () {
    this.triangulateVis(false);

    let height = SVG_ELEM.getBBox().height;
    let width = SVG_ELEM.getBBox().width;

    console.log("height width", height, width);
    for (let i = 1; i < this.polygonElems.length; i++) {
      transformX = Math.floor(Math.random() * width / 5) - 50;
      transformY = Math.floor(Math.random() * height / 5) - 50;
      console.log("", transformX, transformY);
      this.polygonElems[i].setAttributeNS(
        null,
        "transform",
        "translate(" + transformX + "," + transformY + ")"
      );

      this.polygonElems[i].classList.add("draggable");
    }
  };
}

// Translating between string to Point[] and vice versa
function pointToString(arrPoints) {
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

// Create a new clear SVG canvas.
let clearSVG = async function () {
  time = -100;
  await delayset();
  SVG_ELEM.innerHTML = "";
  vis.changePreset();
  vis.drawPolygons();
};

// Visualize the triangulation
function visualizeTriangulation(bool) {
  time = 1000;
  vis.triangulateVis(bool);
  vis.drawPolygons();
}

function scatter() {
  vis.scatter();
}

this.createPresets = function (strs) {
  let presets = [];

  for (let i = 0; i < strs.length; i++) {
    presets.push(new Polygon(stringToPoint(strs[i]), i));
  }

  return presets;
};

// Provided preset polygons 
function PresetPolygons() {
  const strs = [
    "600,400 550,500 500,400 400,400 475,325 425,200 550,275 650,200 625,325 700,400",
    "600,550 500,475 400,550 400,450 450,375 450,250 525,200 525,100 450,25 800,25 950,200 950,325 750,100 750,275 550,375 600,450",
    "400,400 350,350 400,350 400,250 450,200 400,150 500,150 450,100 550,100 750,350 600,350 550,300 450,300",
    "300,400 300,200 500,200 500,400"
  ];

  let arrPresets = createPresets(strs);

  // Which polygon we're currently on
  let curr = 0;

  // Get a new polygon from the presets
  this.getNewPolygon = function () {
    arrPresets = createPresets(strs);
    curr = (curr + 1) % arrPresets.length;
    // print the presets
    console.log(arrPresets[curr]);
    return arrPresets[curr];
  };
}

const vis = new Visualizer(SVG_ELEM);
vis.changePreset();
vis.drawPolygons();


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
    // array = [v1,v2,v3]

    // Creates a line

    for (let i = 0; i < array.length; i++) {
      const newLine = document.createElementNS(SVG_NS, "line");
      newLine.setAttributeNS(null, "x1", array[i].x);
      newLine.setAttributeNS(null, "y1", array[i].y);
      newLine.setAttributeNS(null, "x2", array[accessArray(array, i + 1)].x);
      newLine.setAttributeNS(null, "y2", array[accessArray(array, i + 1)].y);
      // newLine.setAttributeNS(null, "transform", SVG_ELEM.getScreenCTM());

      // newLine.matrixTransform(svg.getScreenCTM());

      newLine.classList.add("line");
      SVG_ELEM.appendChild(newLine);
    }

    for (let j = 0; j < array.length; j++) {
      let point = array[j];

      const newCircle = document.createElementNS(SVG_NS, "circle");
      newCircle.setAttributeNS(null, "cx", point.x);
      newCircle.setAttributeNS(null, "cy", point.y);

      // special highlighted option for v1
      if (j == 0) {
        newCircle.classList.add("current-vertex");
      }

      // newCircle.setAttributeNS(null, "transform", SVG_ELEM.getScreenCTM());

      // newCircle.matrixTransform(svg.getScreenCTM());
      newCircle.classList.add("vertex");

      SVG_ELEM.appendChild(newCircle);
    }
  }

  // if v1 is a convex, will show msg
  checkConvex(bool) {
    if (!bool) {
      let message = document.getElementById("reflex");
      message.classList.remove("hidden");
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
    newCircle.classList.add("vertex");

    //checking if point is in triangle
    if (bool) {
      console.log("got to point in triangle!", vertex, newCircle);
      newCircle.classList.add("inside-vertex");
      // SVG_ELEM.appendChild(newCircle);

      let message = document.getElementById("point-in-triangle");
      message.classList.remove("hidden");

      // return;
    } else {
      newCircle.classList.add("outside-vertex");
    }
    SVG_ELEM.appendChild(newCircle);

    //msg "point is NOT in triangle!"
  }

  // remove line
  checkifEar(bool, array) {
    if (bool) {
      vis.drawPolygon(array);
    }
  }

  clearPoints(array) {
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

    const messages = [
      document.getElementById("reflex"),
      document.getElementById("point-in-triangle"),
    ];
    for (let i = 0; i < messages.length; i++) {
      messages[i].classList.add("hidden");
    }
  }
}

function toggleCheckbox() {
  console.log("made it");
  let elems = document.getElementsByClassName("all-text");
  for (let i = 0; i < elems.length; i++) {
    elems[i].classList.toggle("off");
  }
}