import JSSolver from './js-solver'
import FluidRenderer from './renderer'
import * as StatsJS from 'stats.js'

const canvas = <HTMLCanvasElement>document.querySelector('#fluidCanvas')
if (!canvas) {
	throw new Error('Could not find canvas element')
}

function updateCanvasDimensions() {
	canvas.width = canvas.clientWidth
	canvas.height = canvas.clientHeight
}

;(window.onresize = updateCanvasDimensions)()

const width = 120
const height = 100

const solver = new JSSolver(width, height)

const renderer = new FluidRenderer()
renderer.init({
	canvas,
	solver,
})

canvas.onmousemove = e => {
	if (e.buttons !== 0 || true) {
		const cellX = Math.round((e.layerX * width) / canvas.clientWidth)
		const cellY = Math.round((e.layerY * height) / canvas.clientHeight)
		const radius = Math.round(width * 0.1)
		const xFrom = Math.max(cellX - radius, 1)
		const xTo = Math.min(cellX + radius, width-1)
		const yFrom = Math.max(cellY - radius, 1)
		const yTo = Math.min(cellY + radius, height-1)

		for (let x = xFrom; x < xTo; x++) {
			for (let y = yFrom; y < yTo; y++) {
				const i = x + y * width
				const dx = cellX - x
				const dy = cellY - y
				const ds = Math.max(1 - (dx * dx + dy * dy) / (radius * radius), 0)

				solver.setCellState(x, y, ds * 0.05, e.movementX * ds * 0.02, e.movementY * ds * 0.02)
			}
		}
	}
}

const stats = new StatsJS();
stats.showPanel(0)
document.body.appendChild(stats.dom)

let lastFrame = 0
;(function renderLoop(time: number) {
	const dt = (time - lastFrame) * 0.001
	stats.begin()
	renderer.render(dt)
	solver.decay(-.1 * dt)
	stats.end()
	requestAnimationFrame(renderLoop)
	lastFrame = time
})(0)