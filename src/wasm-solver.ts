import Solver from './solver'
import module from './wasm-solver-module'

let init;
let getDensity;

module.addOnInit(() => {
	const init = module.cwrap('init')
	const getDensity = module.cwrap('getDensity')
})

export default {
	init(width: number, height: number) {
	},

	step(dt: number) {

	},

	setCellState (x: number, y: number, density: number, vx: number, vy: number) {

	},

	decay(decay: number, dt: number) {

	},

	getDensity(): Float32Array {
		if (getDensity) {
			return getDensity()
		}
		return new Float32Array(0)
	},
}