
// complex plane under f(z)=z^alpha
const width = 600;
const height = 600;
const W = 3;
const H = 3;
const coarse = 0.5;
const fine = 0.03;
const defaultAlpha = 1.0;
const defaultBranchAngle = 180;

const xScale = d3.scaleLinear().domain([-4.5, 4.5]).range([0, width]);
const yScale = d3.scaleLinear().domain([-4.5, 4.5]).range([height, 0]);

const svg = d3.select("#powerchart");
// make axes
svg.append("g")
    .attr("transform", `translate(0,${height / 2})`)
    .call(d3.axisBottom(xScale).tickValues([-4, -3, -2, -1, 1, 2, 3, 4]))
    .attr("stroke-width", 2)
    .selectAll("text")
    .style("font-size", "20px");

svg.append("g")
    .attr("transform", `translate(${width / 2},0)`)
    .call(d3.axisLeft(yScale).tickValues([-4, -3, -2, -1, 1, 2, 3, 4]))
    .attr("stroke-width", 2)
    .selectAll("text")
    .style("font-size", "20px");

function genPoints(W, H, coarse, fine) {
    const hlines = [];
    const vlines = [];
    for (let x = -W; x <= W; x += fine) {
        for (let y = -H; y <= H; y += coarse) hlines.push([x, y]);
    }
    for (let x = -W; x <= W; x += coarse) {
        for (let y = -H; y <= H; y += fine) vlines.push([x, y]);
    }
    return { hlines, vlines };
}

function f(points, alpha, branchAngle) {
    const branchAngleRad = (branchAngle * Math.PI) / 180;

    // Precompute r and theta for all points
    const r = points.map(([x, y]) => Math.sqrt(x * x + y * y));
    const theta = points.map(([x, y]) => Math.atan2(y, x));

    // Adjust theta for the branch cut
    const adjustedTheta = theta.map((t) => {
        if (branchAngleRad < 0 && t < branchAngleRad) {
            return t + 2 * Math.PI;
        } else if (branchAngleRad >= 0 && t > branchAngleRad) {
            return t - 2 * Math.PI;
        }
        return t;
    });

    // Compute rAlpha and thetaAlpha
    const rAlpha = r.map((r) => Math.pow(r, alpha));
    const thetaAlpha = adjustedTheta.map((t) => t * alpha);

    // Compute the transformed points
    return points.map((_, i) => [
        rAlpha[i] * Math.cos(thetaAlpha[i]),
        rAlpha[i] * Math.sin(thetaAlpha[i]),
    ]);
}

function applyFunc(points, alpha, branchAngle) {
    return f(points, alpha, branchAngle);
}


function drawBranchCut(alpha, branchAngle) {
    svg.selectAll(".branch-cut").remove();
    const branchAngleRad = (branchAngle * Math.PI) / 180;
    
    let x = Math.cos(branchAngleRad * alpha) * 10;
    let y = Math.sin(branchAngleRad * alpha) * 10;
    svg.append("line")
        .attr("class", "branch-cut")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(x))
        .attr("y2", yScale(y))
        .attr("stroke", "gray")
        .attr("stroke-width", 2);
    if (branchAngleRad > 0) {
        x = Math.cos((branchAngleRad - 2*Math.PI)* alpha) * 10;
        y = Math.sin((branchAngleRad - 2*Math.PI)* alpha) * 10;
    } else {
        x = Math.cos((branchAngleRad + 2*Math.PI)* alpha) * 10;
        y = Math.sin((branchAngleRad + 2*Math.PI)* alpha) * 10;
    }
    svg.append("line")
        .attr("class", "branch-cut")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(x))
        .attr("y2", yScale(y))
        .attr("stroke", "gray")
        .attr("stroke-width", 2);

    x = Math.cos(branchAngleRad) * 10;
    y = Math.sin(branchAngleRad) * 10;
    svg.append("line")
        .attr("class", "branch-cut")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(x))
        .attr("y2", yScale(y))
        .attr("stroke", "black")
        .attr("stroke-width", 4);
}

function drawPoints(points, color) {
    svg.selectAll(`.point-${color}`)
        .data(points)
        .join("circle")
        .attr("class", `point-${color}`)
        .attr("cx", d => xScale(d[0]))
        .attr("cy", d => yScale(d[1]))
        .attr("r", 1.5)
        .attr("fill", color);
}

const { hlines, vlines } = genPoints(W, H, coarse, fine);
function update(alpha, branchAngle) {
    const hPoints = applyFunc(hlines, alpha, branchAngle);
    const vPoints = applyFunc(vlines, alpha, branchAngle);
    drawPoints(hPoints, "blue");
    drawPoints(vPoints, "red");
    drawBranchCut(alpha, branchAngle);
}

update(defaultAlpha, defaultBranchAngle);

const alphaInput = d3.select("#alpha");
const alphaValue = d3.select("#alphaValue");
const branchAngleInput = d3.select("#branchAngle");
const branchAngleValue = d3.select("#branchAngleValue");
const restoreButton = d3.select("#restoreDefaults");

function handleInput() {
    const alpha = +alphaInput.node().value;
    const branchAngle = +branchAngleInput.node().value;
    alphaValue.text(alpha.toFixed(1));
    branchAngleValue.text(branchAngle);
    update(alpha, branchAngle);
}

d3.select("#resetAlpha").on("click", () => {
    alphaInput.node().value = defaultAlpha;
    alphaValue.text(defaultAlpha.toFixed(1));
    handleInput();
});
d3.select("#resetBranchcut").on("click", () => {
    branchAngleInput.node().value = defaultBranchAngle;
    branchAngleValue.text(defaultBranchAngle);
    handleInput();
});

alphaInput.on("input", handleInput);
branchAngleInput.on("input", handleInput);
