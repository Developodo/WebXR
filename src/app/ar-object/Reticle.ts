import {Mesh, RingBufferGeometry, CircleBufferGeometry, MeshBasicMaterial} from "three";
import {mergeBufferGeometries} from "three/examples/jsm/utils/BufferGeometryUtils";

export class Reticle extends Mesh
{
    public onaction;
	constructor(geometry?, material?)
	{
		if (!geometry)
		{
			let ring = new RingBufferGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
			let dot = new CircleBufferGeometry(0.01, 32).rotateX(-Math.PI / 2);
			geometry = mergeBufferGeometries([ring, dot]);
		}
		
		if (!material)
		{
			material = new MeshBasicMaterial({opacity: 0.4, depthTest: false, transparent: true});
		}

		super(geometry, material);

		this.matrixAutoUpdate = false;
		this.visible = false;

		/**
		 * Callback method to execute when the cursor is pressed.
		 * 
		 * Receives the pose of the cursor in world coordinates.
		 */
		this.onaction = null;
	}
}