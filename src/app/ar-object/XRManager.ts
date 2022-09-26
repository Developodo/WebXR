import { ArObjectComponent } from './ar-object.component';
/**
 * XR session running.
 */
let currentSession:XRSession = null;

/**
 * XR manager is used to manage wich XR session is currently running and prevent multiple sessions from running concorrently.
 */
export class XRManager
{
	public currentSession:XRSession;
	public static app:ArObjectComponent;
	/**
	 * Start webxr session for immersive-ar with the provided session configuration.
	 * 
	 * If there is a session already running the method will throw an error.
	 *
	 * @param {WebGLRenderer} renderer - WebGL renderer object.
	 * @param {any} sessionInit - Session initialization data.
	 * @param {Function} onError - Callback method called if an error occurs.
	 */
	static start(app,renderer, sessionInit = {}, onError = function() {})
	{
		XRManager.app=app;
		if (currentSession === null)
		{
			function onSessionStarted(session:XRSession)
			{
				session.addEventListener("end", onSessionEnded);
				renderer.xr.setReferenceSpaceType("local");
				renderer.xr.setSession(session);
				currentSession = session;
			}

			function onSessionEnded(event)
			{
				currentSession.removeEventListener("end", onSessionEnded);
				XRManager.end();
				XRManager.app.resetApp();
				
				//window.location.reload();
			}

			function onError(ev){
				console.log(ev);
				alert("Su navegador no soporta algunas de las funcionalidades experimentales que requiere esta experiencia virtual");
				XRManager.app.resetApp();
			}

			navigator.xr.requestSession("immersive-ar", sessionInit).then(onSessionStarted).catch(onError);
		}else{
			//alert("SESION CREADA")
		}
	}

	/**
	 * End the session.
	 */
	static async end()
	{
		if (currentSession !== null)
		{
			/*try{
				await currentSession.end();
			}catch(err){}*/
			currentSession = null;
		}
	}
}