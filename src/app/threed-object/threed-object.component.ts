import { Component, Input, OnInit } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Vector2 } from 'three';
import { LoaderGLTF } from './LoaderGLTF';
import { GUIUtils } from './GUIUtils';

@Component({
  selector: 'app-threed-object',
  templateUrl: './threed-object.component.html',
  styleUrls: ['./threed-object.component.scss'],
})
export class ThreedObjectComponent implements OnInit {

  /**
   * GLTF model's path
   */
   @Input('model') public model: string = 'assets/models/chair.gltf';

 
   /**
    * GUI
    */
   private container: HTMLDivElement;
   private supercontainer: HTMLDivElement;
   private exitButton: HTMLDivElement;
   private object3D: THREE.Object3D<THREE.Event>;
   
 
   /**
    * Scene
    */
   private scene: THREE.Scene;
   private camera: THREE.PerspectiveCamera;
   private ambient: THREE.AmbientLight;
   private fillLight: THREE.DirectionalLight;
   private backLight:THREE.DirectionalLight;
   private keyLight:THREE.DirectionalLight;
 
   /**
    * Render
    */
   private renderer: THREE.WebGLRenderer;
   private controls:OrbitControls;
   private resolution: Vector2=new THREE.Vector2();
 

 
   public loading_screen = 'loading-screen';
   public loader = 'loader';
   public loading_percent = 'loading-percent';
   public loading_info = 'loading_info';
   public gui = 'gui';
   public random;
   private idAnimation;
 
 
 
   constructor() {
     this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
     this.camera.position.z = 3;
     this.random = Math.floor(Math.random() * 1000);
     this.loader += this.random;
     this.loading_info += this.random;
     this.gui += this.random;
     this.loading_percent += this.random;
     this.loading_screen += this.random;
   }

   ngOnInit() {}
 
   private createGUI() {
     if (this.supercontainer) return;
 
     this.supercontainer = document.createElement('div');
     this.supercontainer.style.position = 'absolute';
     this.supercontainer.style.top = '0px';
     this.supercontainer.style.left = '0px';
     this.supercontainer.style.width = '100%';
     this.supercontainer.style.height = '100%';
     this.supercontainer.style.display = 'none';
     this.supercontainer.style.zIndex="1000";

     this.container = document.createElement('div');
     

     this.exitButton = document.createElement('div');
     this.exitButton.style.cssText=`
     position:fixed;
     z-index:10000;
     bottom:0%;
     width:100%;
     height:10%;
     cursor: pointer;
     color:white;
     white-space: nowrap;
     background: linear-gradient(180deg,rgba(200, 200, 200, 0.95) 0%,rgba(180, 180, 180, 0.95) 40%);
     border-radius: 10px;
     font-size:16px;
     border: 0px solid #444;
     padding: 20px;
     box-shadow: 0px 0px 4px rgba(255, 255, 255, 0.5),0px 0px 1px 10px rgba(255, 255, 255, 0);
     text-align:center;
     `;

     this.exitButton.innerText="Terminar la experiencia";
     this.exitButton.onclick=()=>{
      cancelAnimationFrame(this.idAnimation);
      this.supercontainer.style.display="none";
     }
     this.supercontainer.appendChild(this.container);
     this.supercontainer.appendChild(this.exitButton);

     document.body.appendChild(this.supercontainer);


   }

   /**
    *    private createGUI() {
     if (this.container) return;
 
     this.container = document.createElement('div');
     this.container.style.position = 'absolute';
     this.container.style.top = '0px';
     this.container.style.left = '0px';
     this.container.style.width = '100%';
     this.container.style.height = '100%';
     this.container.style.display = 'none';
     this.container.style.zIndex="1000";
     document.body.appendChild(this.container);
   }
    */
 
   private createScene() {
     if (this.scene) {
       return;
     }
     this.scene = new THREE.Scene();
     this.ambient = new THREE.AmbientLight(0xffffff, 1.0);
     this.scene.add(this.ambient);

     this.keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
     this.keyLight.position.set(-100, 0, 100);

     this.fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
     this.fillLight.position.set(100, 0, 100);

     this.backLight = new THREE.DirectionalLight(0xffffff, 1.0);
     this.backLight.position.set(100, 0, -100).normalize();

     //this.scene.add(this.fillLight);this.scene.add(this.backLight);
   }
 
   private createRenderer() {
    if(this.renderer) return;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(new THREE.Color("hsl(0, 0%, 95%)"));

    this.container.appendChild(this.renderer.domElement);

    /* Controls */

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;
    this.controls.maxZoom=2;
    this.controls.minZoom=1;
   }
 
   private async load3DObject() {
     if (this.object3D) return;
     try {
       this.object3D = await new LoaderGLTF().loadModel(
         this,
         this.model
       );
     } catch (err) {
       console.error(err);
     }
   }
 
   ngAfterViewInit() {
     document.getElementById(this.gui).appendChild(
       GUIUtils.createARButton(120, 60, async () => {
         try {
           /**
            *
            */
           this.createScene();
           this.resolution.set(window.innerWidth, window.innerHeight);
           this.createGUI();
           this.createRenderer();
           /**
            * Prepare Object controls
            */
 
           window.addEventListener(
             'resize',
             () => {
               this.resolution.set(window.innerWidth, window.innerHeight);
               this.camera.aspect = window.innerWidth / window.innerHeight;
               this.camera.updateProjectionMatrix();
 
               this.renderer.setSize(this.resolution.x, this.resolution.y);
               this.renderer.setPixelRatio(window.devicePixelRatio);
             },
             false
           );
           this.renderer.setAnimationLoop(this.render.bind(this));
           /**
            *
            */
           //document.getElementById(this.loading_screen).style.opacity="1";
           if(document.getElementById(this.loading_screen)){
            document.getElementById(this.loading_screen).style.display = 'block';
            await this.load3DObject();
            this.scene.add(this.object3D);
           }
           this.supercontainer.style.display = 'block';
           this.animate();
            
 
           //this.startARXP();
         } catch (err) {
           console.error(err);
         }
       })
     );
   }

   private animate(){
    this.idAnimation=requestAnimationFrame(this.animate.bind(this));

           this.controls.update();

           this.render();
   }
 
   private async render() {
 
     this.renderer.render(this.scene, this.camera);
 
    
   }
 
   


}
