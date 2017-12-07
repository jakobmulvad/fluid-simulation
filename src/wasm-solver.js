const wasm = require('./main.rs')
wasm.initialize({noExitRuntime: true}).then(module => {
	const add = module.cwrap('add', 'number', ['number', 'number'])
	console.log(add(21, 10))
})
export default wasm