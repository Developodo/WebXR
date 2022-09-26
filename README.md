# WebXR
```
This project was created using Ionic over Angular to explore WebXR capabilities (2022).
	The ThreeJS library was used to render 3D objects.
	Two components are developed:
		* ar-object:
		  Using hitTest WebXR featue detects the floor to place 3d object in your room. It uses light-estimation feature to calculate real enviroment light and emulate it on 3d object. As experimental feature, depth calculation can be used to hide 3d objects behind real objects. User can place the object on the floot and, then, rotate it and resize it.
			* tag: app-ar-object
			* parameters: 
				* model: a string with path to 3d model in GLTF format.
				* measures: a numbre array with dimesions: [width,depth,height]
				* resizable: a boolean to allow user to change original size of objects
				* rotable: a boolean to allow user to rotate the object
				* showMeasures: a boolean to show measures on click on object or while resizing it
				
				Usage Example:    <app-ar-object model="assets/models/chair.gltf" measures="[1.0,1.0,1.2]"></app-ar-object>
				
		* threed-object:
			This component can be used when ar-object is not available (on Apple and PC) to render the 3d object.
			* tag: app-threed-object
			* parameter: 
				* model: a string with path to 3d model in GLTF format.
				
			Thanks to https://github.com/tentone to help with his code to explore depth calculation and shaders.
			
```	
			An working example can be found https://webxr-efd50.firebaseapp.com/.
	

