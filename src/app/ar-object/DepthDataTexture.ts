

import { PixelFormat, DataTexture, LuminanceAlphaFormat, UnsignedByteType, LinearFilter, RGFormat, LuminanceFormat, DepthFormat, NearestFilter, ClampToEdgeWrapping, IntType, UnsignedIntType, HalfFloatType, FloatType, UnsignedShortType, UnsignedShort4444Type, UnsignedShort5551Type, AlphaFormat, UnsignedInt248Type, DepthStencilFormat, BasicDepthPacking, Float16BufferAttribute, NearestMipmapNearestFilter, LinearMipmapLinearFilter, LinearMipMapLinearFilter, RGBAFormat, UVMapping, RGB_PVRTC_4BPPV1_Format, sRGBEncoding, LinearEncoding, RedFormat } from 'three';

/**
 * Stores the raw depth values in a 16 bit value packed texture.
 *
 * The distance to the camera is stored in millimeters.
 *
 * This depth has to be unpacked in shader and multiplied by the normalization matrix to obtain rectified UV coordinates.
 */
export class DepthDataTexture extends DataTexture
{

	constructor()
	{
		let width = 160;
		let height = 90;
		let data = new Uint8Array(width * height);

		

		//super(data, width, height,LuminanceAlphaFormat, UnsignedByteType);//AlphaFormat, HalfFloatType
		
		super(data, width, height,RGFormat,UnsignedByteType);//AlphaFormat, HalfFloatType
		//this.encoding=LinearEncoding;
		this.minFilter = LinearFilter;
		this.magFilter = LinearFilter;
		/*this.wrapS=ClampToEdgeWrapping;
		this.wrapT=ClampToEdgeWrapping;
	    this.generateMipmaps=false;*/

		

		//this.unpackAlignment=1;
	}

	/**
	 * Update the texture with new depth data.
	 *
	 * Depth data is retrieved from the WebXR API.
	 *
	 * @param {*} depthData
	 */
	updateDepth(depthData)
	{
		//@ts-ignore
		this.image.data=new Uint8Array(depthData.data);
		this.needsUpdate = true;
	}

}