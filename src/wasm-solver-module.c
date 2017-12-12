#include <stdlib.h>
#include <emscripten/emscripten.h>

float diffusion = .1;
int gaussSiedelIterations = 20;
int width = 0;
int height = 0;

float* density0;
float* vx0;
float* vy0;

float* density1;
float* vx1;
float* vy1;

float *zeroFilledArray(length) {
	float *ret = malloc(length);
	for (int i = 0; i < length; i++ ) {
		ret[ i ] = 1.0f;
	}
	return ret;
}

EMSCRIPTEN_KEEPALIVE
void init(int _width, int _height) {
	width = _width;
	height = _height;
	int length = width * height;

	density0 = zeroFilledArray(length);
}

EMSCRIPTEN_KEEPALIVE
float* getDensity() {
	return density0;
}

