import { DataTexture, Material, Matrix4, Scene, ShadowMaterial, Texture, LuminanceAlphaFormat, LinearFilter, MeshBasicMaterial, Vector2, WebGLRenderer } from 'three';
import { DepthDataTexture } from './DepthDataTexture';

/**
 * Augmented Material has static tools to transform regular three.js materials into AR materials.
 * 
 * The required code is injected into existing shader code.
 */
export class AugmentedMaterial
{
	/**
	 * Create a augmented reality occlusion enabled material from a standard three.js material.
	 *
	 * Can be used to test multiple material this.models with the AR functionality.
	 *
	 * @param {Material} material - Material to be transformed into an augmented material.
	 * @param {Texture} depthMap - Depth map bound to the material. A single depth map should be used for all AR materials.
	 */
	static transform(material, depthMap)
	{
		material.userData = {
			uDepthTexture: {value: depthMap},
			uWidth: {value: 1.0},
			uHeight: {value: 1.0},
			uUvTransform: {value: new Matrix4()},
			uOcclusionEnabled: {value: false},
			uResolution: { value: new Vector2() },
			uRawValueToMeters: {value: 0.0010000000474974513}
		};

		material.isAgumentedMaterial = true;
		material.onBeforeCompile = (shader) =>
		{
			// Pass uniforms from userData to the
			for (let i in material.userData)
			{
				shader.uniforms[i] = material.userData[i];
			}

			// Fragment variables
			shader.fragmentShader = `
			uniform sampler2D uDepthTexture;
			uniform float uWidth;
			uniform float uHeight;
			uniform mat4 uUvTransform;
			uniform bool uOcclusionEnabled;
			uniform vec2 uResolution;
			varying float vDepth;
			uniform float uRawValueToMeters;
			` + shader.fragmentShader;


			var fragmentEntryPoint = "#include <clipping_planes_fragment>";
			if (material instanceof ShadowMaterial)
			{
				fragmentEntryPoint = "#include <fog_fragment>";
			}

			// Fragment depth logic  //antes era ra con luminance_alpha format
			shader.fragmentShader = shader.fragmentShader.replace("void main",
				`float getDepthInMeters(in sampler2D depthText, in vec2 uv)
			{
				vec2 packedDepth = texture2D(depthText, uv).rg;
				return dot(packedDepth, vec2(255.0, 256.0 * 255.0)) * uRawValueToMeters;
			}
			void main`);


			shader.fragmentShader = shader.fragmentShader.replace(fragmentEntryPoint, `
			${fragmentEntryPoint}
			if(uOcclusionEnabled)
			{
				// Normalize x, y to range [0, 1]
				float x = gl_FragCoord.x / uWidth;
				float y = gl_FragCoord.y / uHeight;
				vec2 uv = gl_FragCoord.xy / uResolution.xy;
				
				vec2 depthUV = (uUvTransform * vec4(uv, 0, 1)).xy;
				float depth = getDepthInMeters(uDepthTexture, depthUV);
				if (depth < vDepth)
				{
					discard;
				}
			}
			`);

			// Vertex variables
			shader.vertexShader = `
			varying float vDepth;
			` + shader.vertexShader;

			// Vertex depth logic  gl_Position.z before
			shader.vertexShader = shader.vertexShader.replace("#include <fog_vertex>", `
			#include <fog_vertex>
			vDepth = gl_Position.z;
			`);
		};

		return material;
	}

	/**
	 * Update uniforms of materials to match the screen size and camera configuration.
	 * 
	 * https://immersive-web.github.io/depth-sensing/
	 * 
	 * @param {Scene} scene - Scene to be updated, tarverses all objects and updates materials found.
	 * @param {XRRigidTransform} normTextureFromNormViewMatrix - Matrix obtained from AR depth from frame.getDepthInformation(view).
	 */
	static updateUniforms(scene, normTextureFromNormViewMatrix,depthData,renderer:WebGLRenderer)
	{
		scene.traverse((child)=>
		{
            
			if (child.isMesh && child.material && child.material.isAgumentedMaterial)
			{
				/*console.log(gl.viewport)
				console.log(window.devicePixelRatio)
				console.log(window.innerHeight)*/
				let resolution = new Vector2();	
				renderer.getDrawingBufferSize(resolution);
				resolution.y = resolution.y*4;  //ni idea de por qué
				child.material.userData.uResolution.value=resolution;
				child.material.userData.uRawValueToMeters.value=depthData.rawValueToMeters;
                //child.material.userData.uWidth.value = Math.floor(window.devicePixelRatio * window.innerWidth);
				//child.material.userData.uHeight.value = Math.floor(window.devicePixelRatio * window.innerHeight);
				child.material.userData.uUvTransform.value.fromArray(normTextureFromNormViewMatrix);
				child.material.uniformsNeedUpdate = true;
			}
		});
	}
	
}