/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const js_solver_1 = __webpack_require__(1);
const renderer_1 = __webpack_require__(2);
const canvas = document.querySelector('#fluidCanvas');
if (!canvas) {
    throw new Error('Could not find canvas element');
}
function updateCanvasDimensions() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
;
(window.onresize = updateCanvasDimensions)();
const width = 140;
const height = 100;
const solver = new js_solver_1.default(width, height);
const renderer = new renderer_1.default();
renderer.init({
    canvas,
    solver,
});
canvas.onmousemove = e => {
    if (e.buttons !== 0 || true) {
        const cellX = Math.round((e.layerX * width) / canvas.clientWidth);
        const cellY = Math.round((e.layerY * height) / canvas.clientHeight);
        const radius = Math.round(width * 0.1);
        const xFrom = Math.max(cellX - radius, 1);
        const xTo = Math.min(cellX + radius, width - 1);
        const yFrom = Math.max(cellY - radius, 1);
        const yTo = Math.min(cellY + radius, height - 1);
        for (let x = xFrom; x < xTo; x++) {
            for (let y = yFrom; y < yTo; y++) {
                const i = x + y * width;
                const dx = cellX - x;
                const dy = cellY - y;
                const ds = Math.max(1 - (dx * dx + dy * dy) / (radius * radius), 0);
                solver.setCellState(x, y, ds * 0.05, e.movementX * ds * 0.02, e.movementY * ds * 0.02);
            }
        }
    }
};
let lastFrame = 0;
(function renderLoop(time) {
    const dt = (time - lastFrame) * 0.001;
    renderer.render(dt);
    solver.decay(-.1 * dt);
    requestAnimationFrame(renderLoop);
    lastFrame = time;
})(0);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Real-Time Fluid Dynamics for Games
 * Jon Stam
 * http://www.dgp.toronto.edu/people/stam/reality/index.html
 *
 * Implementation in JS by Jakob Mulvad Nielsen
 */
class JSSolver {
    constructor(_width, _height) {
        this.width = _width;
        this.height = _height;
        const length = _width * _height;
        this.density0 = new Float32Array(length).fill(0);
        this.density1 = new Float32Array(length).fill(0);
        this.vx0 = new Float32Array(length).fill(0);
        this.vx1 = new Float32Array(length).fill(0);
        this.vy0 = new Float32Array(length).fill(0);
        this.vy1 = new Float32Array(length).fill(0);
        this.diffusion = .1;
        this.gaussSiedelIterations = 20;
    }
    step(dt) {
        this.diffuse(this.density0, this.density1, dt);
        this.advect(this.density1, this.density0, this.vx0, this.vy0, dt);
        this.diffuse(this.vx0, this.vx1, dt);
        this.diffuse(this.vy0, this.vy1, dt);
        this.project(this.vx1, this.vy1, this.vx0, this.vy0);
        this.advect(this.vx1, this.vx0, this.vx1, this.vy1, dt);
        this.advect(this.vy1, this.vy0, this.vx1, this.vy1, dt);
        this.project(this.vx0, this.vy0, this.vx1, this.vy1);
    }
    flipVelocities() {
        let temp = this.vx0;
        this.vx0 = this.vx1;
        this.vx1 = temp;
        temp = this.vy0;
        this.vy0 = this.vy1;
        this.vy1 = temp;
    }
    decay(decay) {
        const dest = this.density0;
        for (let i = 0; i < length; i++) {
            dest[i] = Math.max(0, dest[i] + decay);
        }
    }
    setCellState(x, y, density, vx, vy) {
        const idx = x + y * this.width;
        this.density0[idx] += density;
        this.vx0[idx] += vx;
        this.vy0[idx] += vy;
    }
    getDensity() {
        return this.density0;
    }
    addSource(state, result, source, dt) {
        const length = result.length;
        for (let i = 0; i < length; i++) {
            result[i] = state[i] + source[i] * dt;
        }
    }
    diffuse(state, result, dt) {
        const diff = this.diffusion * dt;
        const divisor = 1 / (1 + 4 * diff);
        for (let k = 0; k < this.gaussSiedelIterations; k++) {
            for (let y = 1; y < this.height - 1; y++) {
                for (let x = 1; x < this.width - 1; x++) {
                    const index = x + y * this.width;
                    const neighbors = result[index - 1] +
                        result[index + 1] +
                        result[index - this.width] +
                        result[index + this.width];
                    result[index] = (state[index] + diff * neighbors) * divisor;
                }
            }
        }
    }
    advect(state, result, velocityX, velocityY, dt) {
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const index = x + y * this.width;
                const vx = velocityX[index];
                const vy = velocityY[index];
                // target coordinates
                const tx = Math.min(Math.max(x - vx, 0), this.width - 1);
                const ty = Math.min(Math.max(y - vy, 0), this.height - 1);
                const tx0 = tx & 0xffffffff;
                const ty0 = ty & 0xffffffff;
                const ti0 = tx0 + ty0 * this.width;
                // fraction used for bilinear interpolation
                const fx = tx - tx0;
                const fy = ty - ty0;
                result[index] = (state[ti0] * (1 - fx) +
                    state[ti0 + 1] * fx) * (1 - fy) +
                    (state[ti0 + this.width] * (1 - fx) +
                        state[ti0 + this.width + 1] * fx) * fy;
            }
        }
    }
    project(vx, vy, gradient, height) {
        // Set height field to be the sum of the difference in each direction
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const idx = x + y * this.width;
                height[idx] = -0.5 * (vx[idx + 1] - vx[idx - 1] +
                    vy[idx + this.width] - vy[idx - this.width]);
                gradient[idx] = 0;
            }
        }
        // Solve the gradient
        for (let i = 0; i < this.gaussSiedelIterations; i++) {
            for (let y = 1; y < this.height - 1; y++) {
                for (let x = 1; x < this.width - 1; x++) {
                    const idx = x + y * this.width;
                    gradient[idx] = 0.25 * (height[idx] + gradient[idx - 1] +
                        gradient[idx + 1] + gradient[idx - this.width] +
                        gradient[idx + this.width]);
                }
            }
        }
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const idx = x + y * this.width;
                vx[idx] -= 0.5 * (gradient[idx + 1] - gradient[idx - 1]);
                vy[idx] -= 0.5 * (gradient[idx + this.width] - gradient[idx - this.width]);
            }
        }
    }
}
exports.default = JSSolver;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ygradient = [
    [0, 0, 0],
    [0, 0, 255],
    [255, 0, 0],
    [255, 255, 0],
    [255, 255, 255],
];
const gradient = [
    [255, 255, 255],
    [215, 235, 255],
    [115, 165, 200],
    [0, 0, 50],
    [0, 0, 0],
];
const zgradient = [
    [255, 255, 255],
    [255, 0, 255],
];
const factor = gradient.length - 1;
class FluidRenderer {
    init(options) {
        const { solver, canvas } = options;
        this.solver = solver;
        const bufferCanvas = document.createElement('canvas');
        if (!bufferCanvas) {
            throw new Error('Could not create offscreen canvas');
        }
        bufferCanvas.width = solver.width;
        bufferCanvas.height = solver.height;
        const bufferCtx = bufferCanvas.getContext('2d');
        if (!bufferCtx) {
            throw new Error('Could not create 2d context for offscreen canvas');
        }
        this.bufferCtx = bufferCtx;
        this.buffer = this.bufferCtx.createImageData(solver.width, solver.height);
        this.outputCanvas = options.canvas;
        const outputCtx = this.outputCanvas.getContext('2d');
        if (!outputCtx) {
            throw new Error('Could not create 2d context for onscreen canvas');
        }
        this.outputCtx = outputCtx;
    }
    render(dt) {
        // Move solver forward in time
        this.solver.step(dt);
        // Copy data from density field in solver to offscreen buffer image
        const densityField = this.solver.getDensity();
        const bufferData = this.buffer.data;
        const length = densityField.length;
        let dataOffset = 0;
        for (let i = 0; i < length; i++) {
            const density = Math.min(densityField[i], 0.999);
            const factored = density * factor;
            const gi = factored & 0xFF;
            const lerp = factored - gi;
            const g1 = gradient[gi];
            const g2 = gradient[gi + 1];
            bufferData[dataOffset++] = g1[0] * (1 - lerp) + g2[0] * lerp;
            bufferData[dataOffset++] = g1[1] * (1 - lerp) + g2[1] * lerp;
            bufferData[dataOffset++] = g1[2] * (1 - lerp) + g2[2] * lerp;
            bufferData[dataOffset++] = 255;
        }
        // Draw image to offscreen canvas
        this.bufferCtx.putImageData(this.buffer, 0, 0);
        // Draw offscreen canvas to onscreen canvas (while zooming)
        this.outputCtx.drawImage(this.bufferCtx.canvas, 0, 0, this.outputCanvas.width, this.outputCanvas.height);
        /*ctx.beginPath()
        for (let i = 0; i < this.solver.width; i+=3) {
            for (let j = 0; j < cells; j+=3) {
                const x = i * cellSize + halfCellSize
                const y = j * cellSize + halfCellSize
                const idx = i + j * cells
                ctx.moveTo(x, y)
                ctx.lineTo(x + solver.vx0[idx] * 100, y + solver.vy0[idx] * 100)
            }
        }
        ctx.strokeStyle = 'red'
        ctx.stroke()*/
    }
}
exports.default = FluidRenderer;


/***/ })
/******/ ]);