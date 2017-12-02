type FluidSolver = {
	width: number,
	height: number,
	step(dt: number),
	setCellState(x: number, y: number, density: number, vx: number, vy: number),
	decay(decay: number, dt: number),
	getDensity(): Float32Array,
}

export default FluidSolver