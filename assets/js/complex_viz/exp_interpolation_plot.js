// complex plane under f(z)=exp(z)

const svgExp = d3.select("#expchart");
const width =  600;
const height = 600;

// Scales: domain = math coords, range = screen coords
const xScaleExp = d3.scaleLinear()
  .domain([-4.5, 4.5])
  .range([0, width]);

const yScaleExp = d3.scaleLinear()
  .domain([-4.5, 4.5])
  .range([height, 0]);

// Clear if needed
svgExp.selectAll("*").remove();

// Wrapper group for all elements
const g = svgExp.append("g");

// X Axis (horizontal) at y = 0
g.append("g")
  .attr("transform", `translate(0, ${yScaleExp(0)})`)
  .call(
    d3.axisBottom(xScaleExp)
      .tickValues([-Math.PI, Math.PI])
      .tickFormat(d => d === -Math.PI ? "-π" : d === Math.PI ? "π" : d)
  )
  .attr("stroke-width", 2)
  .selectAll("text")
  .style("font-size", "20px");

// Y Axis (vertical) at x = 0
g.append("g")
  .attr("transform", `translate(${xScaleExp(0)}, 0)`)
  .call(
    d3.axisLeft(yScaleExp)
      .tickValues([-Math.PI, Math.PI])
      .tickFormat(d => d === -Math.PI ? "-π" : d === Math.PI ? "π" : d)
  )
  .attr("stroke-width", 2)
  .selectAll("text")
  .style("font-size", "20px");


function genLinesExp() {
    const hlinesExp = [];
    const vlinesExp = [];
    const coarseExp = Math.PI/10;
    // Horizontal lines (each line is a set of fixed y with varying x)
    for (let y = -Math.PI; y <= Math.PI; y += coarseExp) {
        const hline = [];
        for (let x = -Math.PI; x <= Math.PI; x += 0.04) {
            hline.push([x, y]);
        }
        hlinesExp.push(hline);
    }

    // Vertical lines (each line is a set of fixed x with varying y)
    for (let x = -Math.PI; x <= Math.PI; x += coarseExp) {
        const vline = [];
        for (let y = -Math.PI; y <= Math.PI; y += 0.04) {
            vline.push([x, y]);
        }
        vlinesExp.push(vline);
    }

    return { hlinesExp, vlinesExp };
}



function fexp(points, t) {
    return points.map((p, _) => [
        t * Math.exp(p[0]) * Math.cos(p[1]) + (1-t) * p[0],
        t * Math.exp(p[0]) * Math.sin(p[1]) + (1-t) * p[1],
    ]);
}


const { hlinesExp, vlinesExp } = genLinesExp();
function updateExp(t) {
    
    const hLinesMapped = hlinesExp.map(line => fexp(line, t));
    const vLinesMapped = vlinesExp.map(line => fexp(line, t));

    drawLines(hLinesMapped, "blue");
    drawLines(vLinesMapped, "red");
    
    svgExp.selectAll("g").raise();
}
function drawLines(lines, color) {
    const lineGenerator = d3.line()
        .x(d => xScaleExp(d[0]))
        .y(d => yScaleExp(d[1]));

    svgExp.selectAll(`.line-${color}`)
        .data(lines)
        .join("path")
        .attr("class", `line-${color}`)
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1);
}
updateExp(0.0);

const tInput = d3.select("#t");
const tValue = d3.select("#tValue");

function handleInputExp() {
    const t = +tInput.node().value;
    tValue.text(t.toFixed(1));
    updateExp(t);
}
tInput.on("input", handleInputExp);
