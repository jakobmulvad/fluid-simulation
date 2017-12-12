import FluidSolver from './solver'

const zgradient = [
	[0,0,0],
	[155,0,155],
	[255,0,0],
	[255,255,0],
	[255,255,255],
]

const gradient = [
	[255,255,255],
	[215,235,255],
	[115,165,200],
	[0,0,50],
	[0,0,0],
]

const vgradient = [
	[255,255,255],
	[255,0,255],
]

const factor = gradient.length -1

export default class FluidRenderer {
	private buffer: ImageData
	private bufferCtx: CanvasRenderingContext2D
	private outputCtx: CanvasRenderingContext2D
	private outputCanvas: HTMLCanvasElement

	init(width: number, height: number, canvas: HTMLCanvasElement) {
		const bufferCanvas = document.createElement('canvas')
		if (!bufferCanvas) {
			throw new Error('Could not create offscreen canvas')
		}
		bufferCanvas.width = width
		bufferCanvas.height = height
		const bufferCtx = bufferCanvas.getContext('2d')
		if (!bufferCtx) {
			throw new Error('Could not create 2d context for offscreen canvas')
		}
		this.bufferCtx = bufferCtx
		this.buffer = this.bufferCtx.createImageData(width, height)

		this.outputCanvas = canvas
		const outputCtx = this.outputCanvas.getContext('2d')
		if (!outputCtx) {
			throw new Error('Could not create 2d context for onscreen canvas')
		}
		this.outputCtx = outputCtx
	}

	render(solver: FluidSolver) {
		// Copy data from density field in solver to offscreen buffer image
		const densityField = solver.getDensity()
		const bufferData = this.buffer.data
		const length = densityField.length
		let dataOffset = 0
		for (let i = 0; i < length; i++) {
			const density = Math.min(densityField[i], 0.999)
			const factored = density * factor
			const gi = factored&0xFF
			const lerp = factored - gi
			const g1 = gradient[gi]
			const g2 = gradient[gi+1]

			bufferData[dataOffset++] = g1[0] * (1-lerp) + g2[0] * lerp
			bufferData[dataOffset++] = g1[1] * (1-lerp) + g2[1] * lerp
			bufferData[dataOffset++] = g1[2] * (1-lerp) + g2[2] * lerp
			bufferData[dataOffset++] = 255
		}

		// Draw image to offscreen canvas
		this.bufferCtx.putImageData(this.buffer, 0, 0)

		// Draw offscreen canvas to onscreen canvas (while zooming)
		this.outputCtx.drawImage(this.bufferCtx.canvas, 0, 0, this.outputCanvas.width, this.outputCanvas.height)

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