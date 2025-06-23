---
layout: page
title: Visualization of complex functions
permalink: /complex
description: 
---
## Logarithm
The complex logarithm separates the absolute value and the phase of a complex number, 
\\[\log z = \log\left(R e^{i\phi}\right)=\log R+i\phi\\]
The angle \\(\phi\\) is conventionally defined to be between \\(-\pi\\) and \\(\pi\\). This is an arbitrary choice of a branch cut. Here you can see 
the real and imaginary part of the logarithm Riemann surface. That is, we plot \\(\mbox{Re}(\log(x+iy))\\) and \\(\mbox{Im}(\log(x+iy))\\) as functions of \\(x,y\\). 
<img src="/assets/img/log_branch_cut.png" alt="Logarithm Branch Cut" style="width:100%; margin-top:20px">
The choice \\(-\pi<\phi<\pi\\) corresponds to the yellow sheet.

It's also insightful to see how the log function warps the complex plane. In this widget, every point \\(z\\) moves on a straight line from its "original" position at \\(t=0\\) to \\(\exp(z)\\) at \\(t=1\\):

<div class="d-flex justify-content-center mb-3">
    <div class="slider-container text-center">
        <label for="t" class="form-label">t= <span id="tValue">0.0</span></label>
        <input type="range" class="form-range" id="t" min="0" max="1" step="0.05" value="0">
        <span style="font-size:12px">⬅️  slide me!</span>
    </div>
</div>   
<svg id="expchart" class="border" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet" style="margin-bottom:20px"></svg>

Note that when you go from \\(t=1\\) to \\(t=0\\), you're looking at how the logarithm (which is the inverse of the exponent) warps the complex plane.

## Powers and roots

Here you can see how the complex plane maps to itself under \\( f(z)=z^{\alpha} \\), for various \\(α\\)s and choices of the branch cut.
Note how the result is independent of the choice of branch cut when α is an integer. 
In this case, the complex plane maps onto itself exactly α times.

<div class="d-flex justify-content-between mb-3">
    <div class="slider-container me-3 d-flex flex-column align-items-center text-start">
        <label for="alpha" class="form-label text-center">
            f = z<sup>α</sup>,<span style="width:15px"></span> α = <span id="alphaValue">1.0</span>
        </label>
        <input type="range" class="form-range" id="alpha" min="0" max="3" step="0.025" value="1" style="width: 100%;">
        <button id="resetAlpha" class="btn btn-secondary btn-sm mt-1 px-2 py-0">Reset</button>
    </div>
    <div class="slider-container ms-3 d-flex flex-column align-items-center text-end">
        <label for="branchAngle" class="form-label text-center">
            Branch Cut Angle (°) = <span id="branchAngleValue">180</span>
        </label>
        <input type="range" class="form-range" id="branchAngle" min="-180" max="180" step="5" value="180" style="width: 100%;">
        <button id="resetBranchcut" class="btn btn-primary btn-sm mt-1 px-2 py-0">Reset</button>
    </div>
</div>


<svg id="powerchart" class="border" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet" style="margin-bottom:20px"></svg>

Another way to look at it: raising to the power \\(α\\) is equivalent to
\\( z^\alpha = e^{\alpha \log z}\\). 
What you're seeing when looking at fractional powers is the same branch cut of the imaginary part of the logarithm.
When \\(alpha\\) is an integer, the branch cut exactly closes off. 


<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="{{ '/assets/js/power_plot.js' | relative_url }}"></script>
<script>
    // complex plane under f(z)=exp(z)
    const xScaleExp = d3.scaleLinear().domain([-4.5, 4.5]).range([0, width]);
    const yScaleExp = d3.scaleLinear().domain([-4.5, 4.5]).range([height, 0]);

    const svgExp = d3.select("#expchart");
    
    //Add Axes
    svgExp.append("g")
        .attr("transform", `translate(0,${height / 2})`)
        .call(d3.axisBottom(xScaleExp).tickValues([-Math.PI, Math.PI]).tickFormat(d => {
            if (d === -Math.PI) return "-π";
            if (d === Math.PI) return "π";
            return d;
        }))
        .attr("stroke-width", 2)
        .selectAll("text")
        .style("font-size", "20px");

    svgExp.append("g")
        .attr("transform", `translate(${width / 2},0)`)
        .call(d3.axisLeft(yScaleExp).tickValues([-Math.PI, Math.PI]).tickFormat(d => {
            if (d === -Math.PI) return "-π";
            if (d === Math.PI) return "π";
            return d;
        }))
        .attr("stroke-width", 2)
        .selectAll("text")
        .style("font-size", "20px");

    function genPointsExp(){
        const hlinesExp = [];
        const vlinesExp = [];
        const coarseExp = Math.PI/10;
        for (let x = -Math.PI; x <= Math.PI; x += fine) {
            for (let y = -Math.PI; y <= Math.PI; y += coarseExp) hlinesExp.push([x, y]);
        }
        for (let x = -Math.PI; x <= Math.PI; x += coarseExp) {
            for (let y = -Math.PI; y <= Math.PI; y += fine) vlinesExp.push([x, y]);
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
        svgExp.selectAll("g").raise();
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
