import {Box3, Box3Helper, Color, DoubleSide, LineBasicMaterial, Mesh, MeshBasicMaterial, Object3D, Raycaster, ShapeGeometry, Vector2, Vector3} from "three";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

export class ObjectUtils 
{
	private touchDown;private touchX; private touchY1;
	private touchY2; private deltaX; private deltaY;
	private deltaY1;private deltaY2;
	private helper:THREE.Box3Helper;
	private sizeModel;
	private font:Font;
	private texthelper:THREE.Mesh[]=[]; //width,depth,height,
	private hidinghelpers;
	public currentScale:any=false;
	private rotating=false;
	


	constructor(private camera,private scene,private object3d,private measures,private allowRotate,private allowScale){
		this.measures=JSON.parse(this.measures);
	}

	public async prepareHelpers(){
		return new Promise((resolve,reject)=>{
			/**
       * helper
       */
			let target=this.object3d;
			if(this.object3d.children && this.object3d.children.length>0){
				for(let i=0;i<this.object3d.children.length;i++){
					if(this.object3d.children[i].isObject3D){
						target=this.object3d.children[i];
						break;
					}
				}
				
			}
			console.log(target);
			 let bbox = new Box3().setFromObject(target);
			 const color = 0xffffff;
			 this.helper = new Box3Helper(bbox, new Color(255, 255, 255));
			 this.helper.name="helper";
			 this.helper.visible=false;
			 const matLite = new LineBasicMaterial( {
			   color: color,
			   transparent: true,
			   opacity: 0.7,
			   side: DoubleSide,
			   linewidth:20
			 } );
			 this.helper.material=matLite;
			 
			 this.sizeModel = bbox.getSize(new Vector3()); // HEREyou get the size
			 this.object3d.add(this.helper);
			 const loader = new FontLoader();
			  try{
				 loader.load('assets/fonts/Roboto_Regular.json',( response ) =>{
					this.font = response;
					this.createTextHelperOptimized();
				  });
			}catch(err){
				console.error("Las fuentes no fueron cargadas");
				console.error(err);
			}
			resolve(null);
		})
		
	}

	public async prepareControls(){
		window.addEventListener('touchstart', (e)=>{
			//e.preventDefault();
			if(e.touches.length==1){
			let mouse=new Vector2();
			mouse.x = (e.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(e.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
			const raycaster=new Raycaster();
			raycaster.setFromCamera(mouse, this.camera);
			const intersects = raycaster.intersectObjects([this.object3d]);
			if(intersects.length>0 && intersects.filter(e=>e.object).length>0){
			  this.createTextHelperOptimized();
	  
			}
		  }
		  }, false)


		  window.addEventListener('touchstart',(e)=>{

			//e.preventDefault();
			this.touchDown=true;
			
			if(e.touches.length==2){
			  let touches=[];
			  if(e.touches[1].pageY<e.touches[0].pageY){
				touches[0]=e.touches[1].pageY;
				touches[1]=e.touches[0].pageY;
			  }else{
				touches[0]=e.touches[0].pageY;
				touches[1]=e.touches[1].pageY;
			  }
			  this.touchY1=touches[0];
			  this.touchY2=touches[1];
			}
			if(e.touches.length==1){
			  this.touchX=e.touches[0].pageX;
			}
		  },false);
		  window.addEventListener('touchend',(e)=>{
	
			  this.touchDown=false;
	
			//e.preventDefault();
			
		  },false);
		  window.addEventListener('touchmove',(e)=>{
	
			//e.preventDefault();
			if(!this.touchDown) return;
	
			if(e.touches.length==2){
			  let touches=[];
			  if(e.touches[1].pageY<e.touches[0].pageY){
				touches[0]=e.touches[1].pageY;
				touches[1]=e.touches[0].pageY;
			  }else{
				touches[0]=e.touches[0].pageY;
				touches[1]=e.touches[1].pageY;
			  }
				
			  this.deltaY1=touches[0]-this.touchY1;
			  this.deltaY2=touches[1]-this.touchY2;
			  this.touchY1=touches[0];
			  this.touchY2=touches[1];
			  this.deltaY=this.deltaY1-this.deltaY2;
			  this.scaleObject();
			}else{
			  
			}
	
			if(e.touches.length==1){
			  this.deltaX=e.touches[0].pageX-this.touchX;
			  this.touchX=e.touches[0].pageX;
			  this.rotating=true;
			  this.rotateObject();
			}
			
			
		  },false);


	}

	private createTextHelperOptimized(){
		let helper=this.object3d.children.filter((c)=>c.name=='helper');
		if(helper.length>0){
		  helper[0].visible=true;
		}
  
	  if(this.texthelper && this.texthelper.length>0){
		this.texthelper.forEach((t)=>{
		  this.helper.remove(t);
		})
	  }
	  this.texthelper=[];
  
	  const color = 0xffffff;
	  const matLite1 = new MeshBasicMaterial( {
		color: color,
		transparent: true,
		opacity: 0.9,
		side: DoubleSide
	  } );
  
	  for(let i=0;i<3;i++){
		const shapes = this.font.generateShapes( (this.measures[i]*this.object3d.scale.x).toFixed(2)+' m', 0.15 );
		const geometry = new ShapeGeometry( shapes );
		geometry.computeBoundingBox();
		const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
		geometry.translate( xMid, 0, 0 );
		this.texthelper[i] = new Mesh( geometry, matLite1 );
		if(i==0){  //width
		  this.texthelper[i].position.z+=this.sizeModel.z;
		  this.texthelper[0].position.y+=this.sizeModel.y;
		}else if(i==1){  
		  this.texthelper[i].rotation.y+=Math.PI/2;
		  this.texthelper[i].position.y+=this.sizeModel.y;
		  this.texthelper[i].position.x+=this.sizeModel.x;//+0.2;
  
		}else{//height
		  this.texthelper[i].rotation.z+=Math.PI/2;
		  this.texthelper[i].position.x-=this.sizeModel.x;
		  this.texthelper[i].position.z+=this.sizeModel.z;//+0.2;
		}
  
		this.helper.add(this.texthelper[i]);
		if(this.hidinghelpers){
		  clearTimeout(this.hidinghelpers);
		  this.hidinghelpers=false;
		}
		this.hidinghelpers=setTimeout(()=>{
		  let helper=this.object3d.children.filter((c)=>c.name=='helper');
		  if(helper.length>0){
			helper[0].visible=false;
		  }
		},6000)
	  }
	}

	private scaleObject(){
		if(this.object3d && this.scene.getObjectByName("model")){
				  
		  
	
		  const f=1-this.deltaY/500;
		  this.object3d.scale.multiplyScalar(f);
	
		  this.currentScale=new Vector3();
		  this.currentScale.copy(this.object3d.scale);
		  document.getElementById("reset-scale").style.display="block";
		  this.createTextHelperOptimized(); //refreshing scale
		
	
		} 
	  }

	private rotateObject(){
		if(this.object3d && this.scene.getObjectByName("model")){
			this.object3d.rotation.y +=this.deltaX / 100;
		  }
	}

	public resetScale(){
		if(this.object3d){
			this.object3d.scale.copy(new Vector3(1,1,1));
			this.currentScale=false; 
			document.getElementById("reset-scale").style.display="none";
		  }
	}
}