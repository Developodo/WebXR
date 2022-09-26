import * as THREE from 'three';
import { PerspectiveCamera, WebGLRenderer, Object3D } from 'three';

export class DepthCalculator{

    constructor(private renderer:WebGLRenderer,private camera:PerspectiveCamera,private canvas:HTMLCanvasElement){}
    calculateDepthInfo(object:Object3D,correction=1){
      

    let point2=new THREE.Vector3();
    point2.setFromMatrixPosition( object.matrixWorld );
    

    let point1=new THREE.Vector3();;
    point1.setFromMatrixPosition(this.camera.matrixWorld)

    let distance = point1.distanceTo( point2 );
    return distance;
      //return object.position.distanceTo(this.camera.position)-correction;
    }
    updateDepthInfo(object:Object3D,depthInfo){
        	// Handle depth
            
            let distanceObject=object.position.distanceTo(this.camera.position)-1;
            let points:THREE.Vector3[] = this.toScreenPosition(object);
            let hide=false;
            /*console.log(points);
            console.log(distanceObject);
            console.log(depthInfo);
            console.log(this.canvas)*/
            for(let i=0;i<points.length&&!hide;i++){
                let x=points[i];
                if(x.x>0&&x.y>0&&x.x<this.canvas.width&&x.y<this.canvas.height){
                    let d=depthInfo.getDepthInMeters(x.x/this.canvas.width,x.y/this.canvas.height);
                    if(d<distanceObject){
                        hide=true;
                    }
                }
            }
            if(hide){
               this.setOpacity(object,0.35);
            }else{
                //@ts-ignore 
                this.setOpacity(object,1);
            }

		
    }


    toScreenPosition(obj:THREE.Object3D):THREE.Vector3[] {
        let vectorCenter = new THREE.Vector3();
    
        let widthHalf = 0.5*this.renderer.getContext().canvas.width;
        let heightHalf = 0.5*this.renderer.getContext().canvas.height;
    
        obj.updateMatrixWorld();
        vectorCenter.setFromMatrixPosition(obj.matrixWorld);
        

        let boundingBox = new THREE.Box3().setFromObject(obj);
        let vectorMin=boundingBox.min;
        let vectorMax=boundingBox.max;

        vectorCenter.project(this.camera);
        vectorCenter.x = ( vectorCenter.x * widthHalf ) + widthHalf;
        vectorCenter.y = - ( vectorCenter.y * heightHalf ) + heightHalf;
    
        vectorMax.project(this.camera);
        /*vectorMax.x = ( vectorMax.x * widthHalf ) + widthHalf;
        vectorMax.y = - ( vectorMax.y * heightHalf ) + heightHalf;*/

        vectorMin.project(this.camera);
        /*vectorMin.x = ( vectorMin.x * widthHalf ) + widthHalf;
        vectorMin.y = - ( vectorMin.y * heightHalf ) + heightHalf;*/
        

        return [vectorCenter,vectorMin,vectorMax];
      }
      private setOpacity( obj, opacity ) {
        obj.children.forEach((child)=>{
          this.setOpacity( child, opacity );
        });
        if ( obj.material ) {
          obj.material.transparent=true;
          obj.material.opacity = opacity ;
        };
      };
    
}