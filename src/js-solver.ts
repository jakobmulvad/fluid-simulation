import Solver from './solver'
/**
 * Real-Time Fluid Dynamics for Games
 * Jon Stam
 * http://www.dgp.toronto.edu/people/stam/reality/index.html
 *
 * Implementation in JS by Jakob Mulvad Nielsen
 */
export default class JSSolver implements Solver {
	public width: number
	public height: number
	public density0: Float32Array
	public vx0: Float32Array
	public vy0: Float32Array

	private density1: Float32Array
	private vx1: Float32Array
	private vy1: Float32Array
	private diffusion: number
	private gaussSiedelIterations: number

	constructor(_width, _height) {
		this.width = _width
		this.height = _height
		const length = _width * _height

		this.density0 = new Float32Array(length).fill(0)
		this.density1 = new Float32Array(length).fill(0)
		this.vx0 = new Float32Array(length).fill(0)
		this.vx1 = new Float32Array(length).fill(0)
		this.vy0 = new Float32Array(length).fill(0)
		this.vy1 = new Float32Array(length).fill(0)

		this.diffusion = .1
		this.gaussSiedelIterations = 20
	}

	step(dt: number) {
		this.diffuse(this.density0, this.density1, dt)
		this.advect(this.density1, this.density0, this.vx0, this.vy0, dt)

		this.diffuse(this.vx0, this.vx1, dt)
		this.diffuse(this.vy0, this.vy1, dt)
		this.project(this.vx1, this.vy1, this.vx0, this.vy0)
		this.advect(this.vx1, this.vx0, this.vx1, this.vy1, dt)
		this.advect(this.vy1, this.vy0, this.vx1, this.vy1, dt)
		this.project(this.vx0, this.vy0, this.vx1, this.vy1)
	}

	flipVelocities() {
		let temp = this.vx0
		this.vx0 = this.vx1
		this.vx1 = temp
		temp = this.vy0
		this.vy0 = this.vy1
		this.vy1 = temp
	}

	decay(decay: number) {
		const dest = this.density0
		for (let i = 0; i < length; i++) {
			dest[i] = Math.max(0, dest[i] + decay)
		}
	}

	setCellState(x: number, y: number, density: number, vx: number, vy: number) {
		const idx = x + y * this.width
		this.density0[idx] += density
		this.vx0[idx] += vx
		this.vy0[idx] += vy
	}

	getDensity(): Float32Array {
		return this.density0
	}

	addSource(state: Float32Array, result: Float32Array, source: Float32Array, dt: number) {
		const length = result.length
		for (let i = 0; i < length; i++) {
			result[i] = state[i] + source[i] * dt
		}
	}

	diffuse(state: Float32Array, result: Float32Array, dt: number) {
		const diff = this.diffusion * dt
		const divisor = 1/(1 + 4 * diff)
		for (let k = 0; k < this.gaussSiedelIterations; k++) {
			for (let y = 1; y < this.height-1; y++) {
				for (let x = 1; x < this.width-1; x++) {
					const index = x + y * this.width
					const neighbors = result[index - 1] +
						result[index + 1] +
						result[index - this.width] +
						result[index + this.width]
					result[index] = (state[index] + diff * neighbors) * divisor
				}
			}
		}
	}

	advect(
		state: Float32Array, result: Float32Array,
		velocityX: Float32Array, velocityY: Float32Array, dt: number
	) {
		for (let y = 1; y < this.height-1; y++) {
			for (let x = 1; x < this.width-1; x++) {
				const index = x + y * this.width
				const vx = velocityX[index]
				const vy = velocityY[index]

				// target coordinates
				const tx = Math.min(Math.max(x - vx, 0), this.width-1)
				const ty = Math.min(Math.max(y - vy, 0), this.height-1)
				const tx0 = tx&0xffffffff
				const ty0 = ty&0xffffffff
				const ti0 = tx0 + ty0 * this.width

				// fraction used for bilinear interpolation
				const fx = tx - tx0
				const fy = ty - ty0

				result[index] = (state[ti0] * (1-fx) +
					state[ti0 + 1] * fx) * (1-fy) +
					(state[ti0 + this.width] * (1-fx) +
					state[ti0 + this.width + 1] * fx) * fy
			}
		}
	}

	project(
		vx: Float32Array, vy: Float32Array,
		gradient: Float32Array, height: Float32Array,
	) {
		// Set height field to be the sum of the difference in each direction
		for (let y = 1; y < this.height-1; y++) {
			for (let x = 1; x < this.width-1; x++) {
				const idx = x + y * this.width
				height[idx] = -0.5 * (vx[idx+1] - vx[idx-1] +
					vy[idx+this.width] - vy[idx-this.width])
				gradient[idx] = 0
			}
		}

		// Solve the gradient
		for (let i = 0; i < this.gaussSiedelIterations; i++) {
			for (let y = 1; y < this.height-1; y++) {
				for (let x = 1; x < this.width-1; x++) {
					const idx = x + y * this.width
					gradient[idx] = 0.25 * (height[idx] + gradient[idx - 1] +
						gradient[idx + 1] + gradient[idx - this.width] +
						gradient[idx + this.width])
				}
			}
		}

		for (let y = 1; y < this.height-1; y++) {
			for (let x = 1; x < this.width-1; x++) {
				const idx = x + y * this.width
				vx[idx] -= 0.5 * (gradient[idx+1] - gradient[idx-1])
				vy[idx] -= 0.5 * (gradient[idx+this.width] - gradient[idx-this.width])
			}
		}
	}
}