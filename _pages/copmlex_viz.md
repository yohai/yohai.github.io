---
layout: page
title: Visualization of complex functions
permalink: /complex
description: 
---
## Logarithm
This is a plot of the real and imaginary part of the logarithm Riemann surface. That is, we plot \\(\mbox{Re}(\log(x+iy))\\) and \\(\mbox{Im}(\log(x+iy))\\) as functions of \\(x,y\\). 
<img src="/assets/img/log_branch_cut.png" alt="Logarithm Branch Cut" style="width:100%; margin-top:20px">

Here's how the exponent/log function warps the complex plane. Each point \\(z\\) moves in a straight line from its "original" position at \\(t=0\\) to \\(\exp(z)\\) at \\(t=1\\):

<div class="d-flex justify-content-between mb-3">
    <div class="slider-container me-3 text-start">
        <label for="t" class="form-label">t= <span id="tValue">0.0</span></label>
        <input type="range" class="form-range" id="t" min="0" max="1" step="0.05" value="0">
    </div>
</div>
<svg id="expchart" class="border" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet" style="margin-bottom:20px"></svg>

## Powers and roots

Here you can see how the complex plane maps to itself under \\( f(z)=z^{\alpha} \\), for various \\(α\\)s and choices of the branch cut.
Note how the result is independent of the choice of branch cut when α is an integer. 
In this case, the complex plane maps onto itself exactly α times.

<div class="d-flex justify-content-between mb-3">
    <div class="slider-container me-3 text-start">
        <label for="alpha" class="form-label">f=z<sup>α</sup>,<span style="width:15px"></span> α= <span id="alphaValue">1.0</span></label>
        <input type="range" class="form-range" id="alpha" min="0" max="3" step="0.05" value="1">
    </div>
    <div class="slider-container ms-3 text-end">
        <label for="branchAngle" class="form-label">
            Branch Cut Angle (°) = <span id="branchAngleValue">180</span>
        </label>
        <input type="range" class="form-range" id="branchAngle" min="-180" max="180" step="5" value="180">
    </div>
</div>
<div class="button-container text-center">
    <button id="restoreDefaults" class="btn btn-primary">Restore Defaults</button>
</div>
<svg id="powerchart" class="border" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet" style="margin-bottom:20px"></svg>

Another way to look at it: raising to the power \\(α\\) is equivalent to
\\( z^\alpha = e^{\alpha \log z}\\). 
What you're seeing when looking at fractional powers is the same branch cut of the imaginary part of the logarithm.


<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
    // complex plane under f(z)=z^alpha
    const width = 600;
    const height = 600;
    const W = 3;
    const H = 3;
    const coarse = 0.5;
    const fine = 0.03;
</script>
<script>
    const defaultAlpha = 1.0;
    const defaultBranchAngle = 180;

    const xScale = d3.scaleLinear().domain([-5, 5]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-5, 5]).range([height, 0]);

    const svg = d3.select("#powerchart");

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


    function drawBranchCut(branchAngle) {
        svg.selectAll(".branch-cut").remove();
        const branchAngleRad = (branchAngle * Math.PI) / 180;
        const x = Math.cos(branchAngleRad) * 10;
        const y = Math.sin(branchAngleRad) * 10;
        svg.append("line")
            .attr("class", "branch-cut")
            .attr("x1", xScale(0))
            .attr("y1", yScale(0))
            .attr("x2", xScale(x))
            .attr("y2", yScale(y))
            .attr("stroke", "black")
            .attr("stroke-width", 8);
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
        drawBranchCut(branchAngle);
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

    function restoreDefaults() {
        alphaInput.node().value = defaultAlpha;
        branchAngleInput.node().value = defaultBranchAngle;
        alphaValue.text(defaultAlpha.toFixed(1));
        branchAngleValue.text(defaultBranchAngle);
        update(defaultAlpha, defaultBranchAngle);
    }

    alphaInput.on("input", handleInput);
    branchAngleInput.on("input", handleInput);
    restoreButton.on("click", restoreDefaults);
</script>  

<script>
    // complex plane under f(z)=exp(z)
    const xScaleExp = d3.scaleLinear().domain([-Math.PI, Math.PI]).range([0, width]);
    const yScaleExp = d3.scaleLinear().domain([-Math.PI,Math.PI]).range([height, 0]);

    const svgExp = d3.select("#expchart");


    function genPointsExp(){
        const hlinesExp = [];
        const vlinesExp = [];
        for (let x = -W; x <= W; x += fine) {
            for (let y = -H; y <= H; y += coarse) hlinesExp.push([x, y]);
        }
        for (let x = -W; x <= W; x += coarse) {
            for (let y = -H; y <= H; y += fine) vlinesExp.push([x, y]);
        }
        return { hlinesExp, vlinesExp };
    }

    function fexp(points, t) {
        return points.map((p, _) => [
            t * Math.exp(p[0]) * Math.cos(p[1]) + (1-t) * p[0],
            t * Math.exp(p[0]) * Math.sin(p[1]) + (1-t) * p[1],
        ]);
    }

    function drawPointsExp(points, color) {
        svgExp.selectAll(`.pointExp-${color}`)
            .data(points)
            .join("circle")
            .attr("class", `pointExp-${color}`)
            .attr("cx", d => xScaleExp(d[0]))
            .attr("cy", d => yScaleExp(d[1]))
            .attr("r", 1.5)
            .attr("fill", color);
    }

    const { hlinesExp, vlinesExp } = genPointsExp();
    function updateExp(t) {
        const hPointsExp = fexp(hlinesExp, t);
        const vPointsExp = fexp(vlinesExp, t);
        drawPointsExp(hPointsExp, "blue");
        drawPointsExp(vPointsExp, "red");
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
</script> 