/**
 * Real-Time Fluid Dynamics for Games
 * Jon Stam
 * http://www.dgp.toronto.edu/people/stam/reality/index.html
 *
 * Implementation in Rust by Jakob Mulvad Nielsen <mulvad@gmail.com>
 */

fn main() {
	println!("Hello, world!");
}

// Functions that you wish to access from Javascript
// must be marked as no_mangle
#[no_mangle]
pub fn add(a: i32, b: i32) -> i32 {
	return a + b
}
