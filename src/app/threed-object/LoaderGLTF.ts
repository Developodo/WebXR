import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { ThreedObjectComponent } from './threed-object.component';

/**
 * Loader utils contain auxiliary methods to load objects from file.
 */
export class LoaderGLTF {
  private app:ThreedObjectComponent;
  loadModel(app,model): Promise<THREE.Object3D> {
    this.app=app;
    return new Promise((resolve, reject) => {
      document.getElementById(this.app.loading_screen).style.display = 'block';
      let loadingManager = new THREE.LoadingManager(() => {
        const loadingScreen = document.getElementById(this.app.loading_screen);
        loadingScreen.classList.add('fade-out');
        loadingScreen.addEventListener('transitionend', (event) => {
          const element = event.target;
          (element as any).remove();
        });
      });
      let loaderGLTF = new GLTFLoader(loadingManager);

      loaderGLTF.load(
        model,
        (g: GLTF) => {

          let obj = g.scene; //.children[0];
         
		    obj.name="model";
          resolve(obj);
        },
        this.onProgress.bind(this),
        this.onError.bind(this)
      );
    });
  }
  private onError() {}
  private onProgress(xhr) {
    if (xhr.lengthComputable) {
      let percentComplete = (xhr.loaded / xhr.total) * 100;
      if(percentComplete>100) percentComplete=100;
      document.getElementById(this.app.loading_percent).innerHTML =
        percentComplete.toFixed(0) + '%';
    }
  }

  
}
