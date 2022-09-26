import {CanvasTexture} from "three";

/**
 * Canvas texture to stored depth data obtained from the WebXR API.
 */
export class DepthCanvasTexture extends CanvasTexture
{
	constructor(canvas)
	{
		super(canvas);
	}

	/**
	 * Draw depth data to a canvas, also sets the size of the canvas.
	 *
	 * Uses the camera planes to correctly adjust the values.
	 */
	updateDepth(depth, near, far)
	{
		let canvas = this.image;

		canvas.width = depth.height;
		canvas.height = depth.width;

		let context = canvas.getContext("2d");
		let image = context.getImageData(0, 0, canvas.width, canvas.height);

		for (let x = 0; x < 1; x+=1/depth.width)
		{
			for (let y = 0; y < 1; y+=1/depth.height)
			{
				let distance = (depth.getDepthInMeters(x, y) - near) / (far - near);
				let j = (x * canvas.width + (canvas.width - y)) * 4;

				if (distance > 1.0) {distance = 1.0;}
				else if (distance < 0.0) {distance = 0.0;}

				image.data[j] = Math.ceil(distance * 256);
				image.data[j + 1] = Math.ceil(distance * 256);
				image.data[j + 2] = Math.ceil(distance * 256);
				image.data[j + 3] = 255;
			}
		}

		context.putImageData(image, 0, 0);
		this.needsUpdate = true;
	}

}