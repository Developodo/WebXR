import { Component, Input, OnInit } from '@angular/core';
import * as THREE from 'three';
import { XREstimatedLight } from 'three/examples/jsm/webxr/XREstimatedLight.js';
import { DepthDataTexture } from './DepthDataTexture';
import { AugmentedMaterial } from './AugmentedMaterial';
import { Vector2, ShadowMaterial, Mesh } from 'three';
import { XRManager } from './XRManager';
import { Reticle } from './Reticle';
import { GUIUtils } from './GUIUtils';
import { LoaderGLTF } from './LoaderGLTF';
import { DepthCalculator } from './DepthCalculator';
import { ObjectUtils } from './ObjectUtils';

@Component({
  selector: 'app-ar-object',
  templateUrl: './ar-object.component.html',
  styleUrls: ['./ar-object.component.scss'],
})
export class ArObjectComponent implements OnInit {
  /**
   * GLTF model's path
   */
  @Input('model') public model: string = 'assets/models/chair.gltf';
  @Input('measures') public measures: Array<Number> = [1, 1, 1]; //measures width,depth,height
  @Input('resizable') public resizable: boolean = true; //allow resize the object
  @Input('rotable') public rotable: boolean = true; //allow rotate the object
  @Input('showMeasure') public showMesure: boolean = true; //show helper with measures

  /**
   * GUI
   */
  private container: HTMLDivElement;
  private depthDataTexture: DepthDataTexture;
  private shadowMaterial: ShadowMaterial;
  private resolution: Vector2;
  private depthCalculator: DepthCalculator;
  private PLACEButton;

  private object3D: THREE.Object3D<THREE.Event>;
  private object3DInScene: boolean = false;

  /**
   * Scene
   */
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private reticle: THREE.Mesh;
  private defaultLight: THREE.DirectionalLight;
  private xrLight: XREstimatedLight;
  private xrLightEnabled: boolean = true;
  private floorShadow: THREE.Mesh;
  private oclussion: boolean = false; //calcula oclussion

  private help = true;

  /**
   * Render
   */
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  private glContext: WebGL2RenderingContext;

  /**
   * XR
   */
  private hitTestSource = null; //hit test source
  private hitTestSourceRequested = false; //Indicates if a hit test source was requeste
  private xrGlBinding: XRWebGLBinding;
  private pose;

  private control: ObjectUtils;
  public readyToStartXRXP = false;

  public loading_screen = 'loading-screen';
  public loader = 'loader';
  public loading_percent = 'loading-percent';
  public loading_info = 'loading_info';
  public gui = 'gui';
  public random;



  constructor() {
    this.camera = new THREE.PerspectiveCamera(70, 1, 0.01, 20); //(60, 1, 0.1, 10);
    this.resolution = new Vector2();
    this.random = Math.floor(Math.random() * 1000);
    this.loader += this.random;
    this.loading_info += this.random;
    this.gui += this.random;
    this.loading_percent += this.random;
    this.loading_screen += this.random;
  }
  ngOnInit() {}

  private createGUI() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.top = '0px';
    this.container.style.left = '0px';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.display = 'none';
    document.body.appendChild(this.container);

    this.PLACEButton = GUIUtils.createButton(
      'bottom',
      'left',
      'hidden',
      0,
      0,
      400,
      100,
      'assets/icons/place.svg',
      () => {
        if (!this.reticle.visible) {
          return;
        }
        this.placeObject();
      }
    );
    this.container.appendChild(this.PLACEButton);

    this.container.appendChild(
      GUIUtils.createButton(
        'top',
        'right',
        'hidden',
        0,
        40,
        100,
        50,
        'assets/icons/minimize-arrows.svg',
        () => {
          this.resetScale();
        },
        'reset-scale'
      )
    );

    this.container.appendChild(
      GUIUtils.createButton(
        'top',
        'left',
        'transparent',
        0,
        40,
        100,
        50,
        'assets/icons/behind.svg',
        () => {
          this.askForToogleOclussion();
        },
        'oclussion'
      )
    );
    this.container.appendChild(
      GUIUtils.createButton(
        'top',
        'left',
        'hidden',
        0,
        120,
        100,
        50,
        'assets/icons/xrlight.svg',
        () => {
          this.toogleXRLight();
        },
        'xrlight'
      )
    );
  }

  private createScene() {
    if (this.scene) {
      return;
    }
    this.scene = new THREE.Scene();
    this.depthDataTexture = new DepthDataTexture();

    this.defaultLight = new THREE.DirectionalLight();
    this.defaultLight.castShadow = true;
    this.defaultLight.shadow.mapSize.set(1024, 1024);
    this.defaultLight.shadow.camera.far = 20;
    this.defaultLight.shadow.camera.near = 0.1;
    this.defaultLight.shadow.camera.left = -5;
    this.defaultLight.shadow.camera.right = 5;
    this.defaultLight.shadow.camera.bottom = -5;
    this.defaultLight.shadow.camera.top = 5;
    this.scene.add(this.defaultLight);

    this.shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
    this.shadowMaterial = AugmentedMaterial.transform(
      this.shadowMaterial,
      this.depthDataTexture
    );

    this.floorShadow = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(100, 100, 1, 1),
      this.shadowMaterial
    );
    this.floorShadow.rotation.set(-Math.PI / 2, 0, 0);
    this.floorShadow.castShadow = false;
    this.floorShadow.receiveShadow = true;
    this.scene.add(this.floorShadow);

    this.reticle = new Reticle();
    this.scene.add(this.reticle);
  }

  private createRenderer() {
    let already = false;
    if (this.canvas) {
      document.body.removeChild(this.canvas);
      already = true;
      //return;
    }
    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);
    this.glContext = this.canvas.getContext('webgl2', { xrCompatible: true });
    this.renderer = new THREE.WebGLRenderer({
      logarithmicDepthBuffer: false,
      canvas: this.canvas,
      context: this.glContext,
      antialias: true,
      alpha: true,
      depth: true,
      powerPreference: 'high-performance',
      precision: 'highp',
      preserveDrawingBuffer: false,
      premultipliedAlpha: true,
      stencil: true,
    });
    if (already) return;

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.sortObjects = false;
    this.renderer.physicallyCorrectLights = true;

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    this.xrLight = new XREstimatedLight(this.renderer);
    this.xrLight.castShadow = true;
    this.xrLight.directionalLight.castShadow = true;
    this.xrLight.directionalLight.shadow.mapSize.width = 2048;
    this.xrLight.directionalLight.shadow.mapSize.height = 2048;
    this.xrLight.directionalLight.shadow.radius = 4; //suavizar
    this.xrLight.directionalLight.shadow.camera.near = this.camera.near;
    this.xrLight.directionalLight.shadow.camera.far = this.camera.far;
    this.xrLight.directionalLight.shadow.bias = -0.001; //quitar rayas
    this.xrLight.addEventListener('estimationstart', () => {
      if (document.getElementById('xrlight'))
        document.getElementById('xrlight').style.display = 'block';
      this.scene.add(this.xrLight);
      this.scene.remove(this.defaultLight);
      this.defaultLight.intensity = 0;
      if (this.xrLight.environment) {
        this.scene.environment = this.xrLight.environment;
      }
      this.xrLightEnabled = true;
    });
    this.xrLight.addEventListener('estimationend', () => {
      //@ts-ignore
      if (document.getElementById('xrlight'))
        document.getElementById('xrlight').style.display = 'none';
      this.scene.add(this.defaultLight);
      this.scene.remove(this.xrLight);
      this.xrLightEnabled = false;
      // Revert back to the default environment.
      //this.scene.environment = defaultEnvironment;
    });
    //optional
    this.depthCalculator = new DepthCalculator(
      this.renderer,
      this.camera,
      this.canvas
    );
  }

  private async load3DObject() {
    if (this.object3D) return;
    try {
      this.object3D = await new LoaderGLTF().loadModel(
        this,
        this.model,
        this.depthDataTexture
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
          document.getElementById(this.loading_screen).style.display = 'block';
          await this.load3DObject();
          this.readyToStartXRXP = true;

          document.getElementById(this.loader).style.display = 'none';
          document.getElementById(this.loading_percent).style.display = 'none';
          document.getElementById(this.loading_info).innerHTML =
            'Pulsa para comenzar';
          document.getElementById(this.loading_info).style.cssText =`
            padding:20px;
            vertical-align:middle;
            height:100px;
            line-height:30px;
            border-radius:10px;
            border:'1px solid gray';
            background:linear-gradient(180deg,rgba(200, 200, 200, 0.95) 0%,rgba(180, 180, 180, 0.95) 40%);
            color:white;
            cursor:pointer;
          `
            
          document.getElementById(this.loading_info).onclick = () => {
            this.startARXP();
          };

          //this.startARXP();
        } catch (err) {
          console.error(err);
        }
      })
    );
  }

  private async render(time, frame: XRFrame) {
    if (!frame) {
      return;
    }
    const session: any = this.renderer.xr.getSession();
    const referenceSpace = this.renderer.xr.getReferenceSpace();
    if (!this.xrGlBinding) {
      this.xrGlBinding = new XRWebGLBinding(session, this.glContext);
    }
    // Request hit test source
    if (!this.hitTestSourceRequested) {
      session.requestReferenceSpace('viewer').then((referenceSpace) => {
        session
          .requestHitTestSource({ space: referenceSpace })
          .then((source) => {
            this.hitTestSource = source;
          });
      });
      session.addEventListener('end', () => {
        this.hitTestSourceRequested = false;
        this.hitTestSource = null;
        this.reticle.visible = false;
      });

      this.hitTestSourceRequested = true;
    }

    // Process Hit test
    if (this.hitTestSource) {
      var hitTestResults = frame.getHitTestResults(this.hitTestSource);
      if (hitTestResults.length) {
        let hit = hitTestResults[0];

        this.reticle.visible = true;
        this.PLACEButton.style.display = 'block';

        this.reticle.matrix.fromArray(
          hit.getPose(referenceSpace).transform.matrix
        );

        // Update physics floor plane
        let position = new THREE.Vector3();
        position.setFromMatrixPosition(this.reticle.matrix);
        // Shadow plane
        this.floorShadow.position.y = position.y;
      } else {
        this.reticle.visible = false;
        this.PLACEButton.style.display = 'none';
      }
    }


      let viewerPose = frame.getViewerPose(referenceSpace);
      if (viewerPose) {
        this.pose = viewerPose;
        for (let view of this.pose.views) {
          //@ts-ignore
          let depthData: XRDepthInformation = (
            frame as any
          ).getDepthInformation(view);
          if (depthData && this.object3DInScene) {
            this.depthDataTexture.updateDepth(depthData);

            const uvTransform: XRRigidTransform =
              depthData.normDepthBufferFromNormView.matrix;

            AugmentedMaterial.updateUniforms(
              this.scene,
              uvTransform,
              depthData,
              this.renderer
            );
            //cambia renderer por directamente resolution y listo
          }
        }
      }
    

    this.renderer.render(this.scene, this.camera);

    if (this.help && !this.reticle.visible) {
      GUIUtils.createMessage(
        this.container,
        'Apunta hacia el suelo hasta que aparezcla el círculo para situar al objeto',
        0.8,
        5000
      );
      this.help = false;
    }
  }

  private async placeObject() {
    if (!this.object3D) return;
    if (!this.reticle.visible) return;
    let d = this.depthCalculator.calculateDepthInfo(this.reticle);
    let d2 = this.depthCalculator.calculateDepthInfo(this.object3D);
    if (d > 5) {
      GUIUtils.createMessage(
        this.container,
        'Intente colocar el objeto más cerca'
      );
      return;
    }
    let f = this.scene.getObjectByName('model');
    this.reticle.matrix.decompose(
      this.object3D.position,
      this.object3D.quaternion,
      this.object3D.scale
    );

    if (this.control && this.control.currentScale) {
      this.object3D.scale.copy(this.control.currentScale);
    }

    if (!f) {
      this.control = new ObjectUtils(
        this.camera,
        this.scene,
        this.object3D,
        this.measures,
        this.rotable,
        this.resizable
      );
      if (this.showMesure) await this.control.prepareHelpers();
      await this.control.prepareControls();
      this.scene.add(this.object3D);
      (this.defaultLight as any).target = this.model;
    }
    this.object3DInScene = true;
  }
  private resetScale() {
    this.control.resetScale();
  }

  private askForToogleOclussion() {
    if (this.oclussion) {
      this.toogleOclussion();
    } else {
      GUIUtils.createConfirm(
        this.container,
        'El dispositivo comenzará a calcular la propudidad del entorno para simular elementos que puedan ocultar al objeto virtual. Esta funcionalidad es experimental y los resultados pueden ser erróneos. ¿Desea continuar?',
        () => {
          this.toogleOclussion();
        },
        () => {}
      );
    }
  }

  private toogleOclussion() {
    this.oclussion = !this.oclussion;
    if (this.oclussion) {
      document.getElementById('oclussion').style.opacity = '1';
      this.scene.overrideMaterial = null;
      this.scene.traverse((child) => {
        if (
          child instanceof Mesh &&
          child.isMesh &&
          child.material &&
          child.material.isAgumentedMaterial
        ) {
          child.material.userData.uOcclusionEnabled.value = true;
          child.material.uniformsNeedUpdate = true;
        }
      });
    } else {
      document.getElementById('oclussion').style.opacity = '0.4';
      this.scene.overrideMaterial = null;
      this.scene.traverse((child) => {
        if (
          child instanceof Mesh &&
          child.isMesh &&
          child.material &&
          child.material.isAgumentedMaterial
        ) {
          child.material.userData.uOcclusionEnabled.value = false;
          child.material.uniformsNeedUpdate = true;
        }
      });
    }
  }

  private toogleXRLight() {
    this.xrLightEnabled = !this.xrLightEnabled;
    if (this.xrLightEnabled) {
      document.getElementById('xrlight').style.opacity = '1';
      this.xrLight.directionalLight.visible = true;
      this.defaultLight.intensity = 0;
      GUIUtils.createMessage(
        this.container,
        'Cálculo de luz real activado',
        0.75,
        2000
      );
    } else {
      document.getElementById('xrlight').style.opacity = '0.4';
      this.xrLight.directionalLight.visible = false;
      this.defaultLight.intensity = 1;
      GUIUtils.createMessage(
        this.container,
        'Cálculo de luz real desactivado',
        0.75,
        2000
      );
    }
  }
  public startARXP() {
    if (!this.readyToStartXRXP) return;
    const loadingScreen = document.getElementById(this.loading_screen);
    loadingScreen.classList.add('fade-out');
    loadingScreen.addEventListener('transitionend', (event) => {
      const element = event.target;
      //(element as any).remove();
      (element as any).style.display = 'none';
      loadingScreen.classList.remove('fade-out');
    });
    XRManager.start(
      this,
      this.renderer,
      {
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: this.container },
        requiredFeatures: [
          'depth-sensing',
          'hit-test',
          'light-estimation',
        ],
        depthSensing: {
          usagePreference: ['cpu-optimized', 'gpu-optimized'],
          dataFormatPreference: ['luminance-alpha', 'float32'],
        },
      },
      () => {
        alert(
          'Dispositivo o navegador no compatible con la experiencia WebXR. Inténtelo en con Chrome y Android. '
        );
        this.container.style.display = 'none';
      }
    );

    setTimeout(() => {
      this.container.style.display = 'block';
    }, 500);
  }
  public resetApp() {
    document.body.removeChild(this.container);
    this.container = null;
    document.getElementById(this.loader).style.display = 'block';
    document.getElementById(this.loading_percent).style.display = 'block';
    document.getElementById(this.loading_info).innerHTML =
      'Preparando tu experiencia virtual';
    document.getElementById(this.loading_info).style.border = '0px solid gray';
    this.help=true;
    this.xrLightEnabled = true;
    this.oclussion = false;
    this.readyToStartXRXP = false;
  }
}
