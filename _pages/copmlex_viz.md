---
layout: page
title: Visualization of complex functions
permalink: /complex
description: 
---

## Multivalued-ness of the the Logarithm
The complex logarithm separates the absolute value and the phase of a complex number, 

$$
\log z = \log\left(R e^{i\phi}\right)=\log R+i\phi
$$

The logarithm is the inverse of the exponent, as can be seen from Euler's formula for example,

$$
\exp\big(\log z\big) = \exp^{\log R + i \phi}=R e^{i\phi}=z
$$

However, the exponent function is not one-to-one, \\( \exp(z)=\exp(z+2\pi i k) \\) for any integer \\(k\\). So its inverse is multivalued. That is, there are many possible choices for the angle \\(k\\). To fix this, \\(k\\) is conventionally defined to be between \\(-\pi\\) and \\(\pi\\), or 0 and \\(2\pi\\)

This is an arbitrary choice, and it would create a line of discontinuity, called a *branch cut*. A good way to visualize this  is to track a single point and its image under the mapping. Try to drag the blue or red points here:

{% include two_panels_log_exp.html %}

Things to try/notice:

1. Note that when dragging the red point, the blue point always moves continuously. However, when dragging the blue point in branch cut mode, the red point jumps discontinuously when crossing the branch cut.
1. Drag the blue point in a small path that does not encircle the origin.
1. Drag the blue point in a small path that encircles the origin. Try both clockwise and anti-clockwise, in the branch-cut or multi-valued modes.
1. Try to drag the red dot such that the blue dot follows a vertical/horizontal line. Did you see that the mapping \\( z\to \log z\\) is very similar to a coordinate transform from cartesian to polar coordinates?

Another way of thinking about a multivalued function is a Riemann surface, which informally is the "stiching together" of the multiple values ("branches") of the inversion problem. Here you can see the real and imaginary part of the logarithm Riemann surface. That is, we plot \\(\mbox{Re}(\log(x+iy))\\) and \\(\mbox{Im}(\log(x+iy))\\) as functions of \\(x,y\\). 
<img src="/assets/img/log_branch_cut.png" alt="Logarithm Branch Cut" style="width:100%; margin-top:20px">
The choice \\(-\pi<\phi<\pi\\) corresponds to the yellow sheet.

Another insightful visualization is the deformation of the gridlines under the log function. In this widget, every point \\(z\\) moves on a straight line from its "original" position at \\(t=0\\) to \\(\exp(z)\\) at \\(t=1\\):

<div class="d-flex justify-content-center mb-3">
    <div class="slider-container text-center">
        <label for="t" class="form-label">t= <span id="tValue">0.0</span></label>
        <input type="range" class="form-range" id="t" min="0" max="1" step="0.025" value="0">
        <span style="font-size:12px">⬅️  slide me!</span>
    </div>
</div>   
<svg id="expchart" class="border" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet" style="margin-bottom:20px"></svg>

Note that when you go from \\(t=1\\) to \\(t=0\\), you're looking at how the logarithm (which is the inverse of the exponent) warps the complex plane. That is, how it takes a polar grid and returns a cartesian one.

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

Another way to look at it: raising to the power \\( \alpha \\) is equivalent to
\\( z^\alpha = e^{\alpha \log z}\\). 
What you're seeing when looking at fractional powers is the same branch cut of the imaginary part of the logarithm.
When \\(\alpha\\) is an integer, the branch cut exactly closes off. 


<script src="https://d3js.org/d3.v7.min.js"></script>
<script type='module' src="{{ '/assets/js/power_plot.js' | relative_url }}"></script>
<script type='module' src="{{ '/assets/js/exp_interpolation_plot.js' | relative_url }}"></script>
<script type='module' src="{{ '/assets/js/two_paenls_log_exp.js' | relative_url }}"></script>