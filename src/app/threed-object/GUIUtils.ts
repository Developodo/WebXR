export class GUIUtils {
  static nelements=0;
  /**
   * Create a button with an icon.
   *
   * @param {string} imageSrc - Source of the image used as icon.
   * @param {Function} onclick - Method to be executed when the button is pressed.
   */

  static createButton(positionV,positionH,visible,x, y, w, h, imageSrc, onclick,id?) {
    let button = document.createElement('div');
    button.style.width = w + 'px';
    button.style.height = h + 'px';
    button.style.position = 'absolute';
    if(positionH=="left"){
      button.style.left = x + 'px';
    }else{
      button.style.right = x + 'px';
    }
    
    if(positionV=="bottom"){
      button.style.bottom = y + 'px';
    }else{
      button.style.top = y + 'px';
    }
    
    button.style.backgroundColor = '#FFFFFF33';
    button.style.borderRadius = '20px';
    //button.style.opacity = '0.5';
    button.style.zIndex = '1000';
    button.onclick = onclick;

    var icon = document.createElement('img');
    icon.src = imageSrc;
    icon.style.width = '80%';
    icon.style.height = '80%';
    icon.style.top = '10%';
    icon.style.left = '10%';
    icon.style.position = 'absolute';
    if(id){
      button.id=id;
    }
    if(visible==="hidden"){
      button.style.display="none";
    }else if(visible=="transparent"){
      button.style.opacity="0.5";
    }
    button.appendChild(icon);

    return button;
  }

  static createARButton(width, heigth, callback) {
    let button = document.createElement('div');
    button.className = 'button';
    button.style.cssText = `
    width:80px;
    height:40px;
    cursor: pointer;
    white-space: nowrap;
    background: linear-gradient(180deg,rgba(200, 200, 200, 0.95) 0%,rgba(180, 180, 180, 0.95) 40%);
    border-radius: 10px;
    border: 0px solid #444;
    padding: 5px;
    box-shadow: 0px 0px 4px rgba(255, 255, 255, 0.5),0px 0px 1px 10px rgba(255, 255, 255, 0);
    text-align:center;
    display:inline-block;
    `;
    //button.innerText = "Enter AR";
    let img = document.createElement('img');
    img.src = 'assets/icons/cubo-3d.svg';
    img.style.cssText = ` filter:invert(99%) sepia(23%) saturate(2%) hue-rotate(235deg) brightness(113%) contrast(100%);
    height:100%;
    background-color: rgba(255, 255, 255, 0);`;
    /*https://codepen.io/sosuke/pen/Pjoqqp*/
    button.appendChild(img);
    button.onclick=callback;
	  return button;
  }

  static createConfirm(parent:HTMLDivElement,msg,yesFn,noFn){
    let confirmDiv=document.createElement("div");
    let pos=200+150*GUIUtils.nelements;
    GUIUtils.nelements++;

    confirmDiv.style.cssText=`
      width:100%;
      padding:10px;
      background-color:rgba(255, 255, 255, 0.7);
      color:black;
      font:Arial;
      font-size:14px;
      border:1px solid white;
      border-radius:10px;
      position:absolute;
      top:${pos}px;
      z-index:10000;
    `;
    let textDiv=document.createElement("div");
    textDiv.style.cssText=`
    font-family: 'roboto', 'arial', sans-serif;
    -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;`

    textDiv.innerText=msg;
    let buttonsDiv=document.createElement("div");
    buttonsDiv.style.cssText=`text-align:center`;
    let buttonYes=document.createElement("div");
    buttonYes.style.cssText=`text-align:center;
    display:inline-block;font-size:16px; 
    background-color:gray; border:1px solid black; color:white;margin:10px 10px;padding:20px`;
    buttonYes.innerText="Aceptar";
    buttonYes.onclick=()=>{
      yesFn();
      parent.removeChild(confirmDiv);

    }
    let buttonNo=document.createElement("div");
    buttonNo.style.cssText=`text-align:center;
    display:inline-block;font-size:16px; 
    background-color:gray; border:1px solid black; color:white;margin:10px 10px;padding:20px`;
    buttonNo.innerText="Cancelar";
    buttonNo.onclick=()=>{
      noFn();
      this.nelements--;
      if(this.nelements<0)this.nelements=0;
      parent.removeChild(confirmDiv);
    }
    confirmDiv.appendChild(textDiv);
    buttonsDiv.appendChild(buttonYes);
    buttonsDiv.appendChild(buttonNo);
    confirmDiv.appendChild(buttonsDiv);
    parent.appendChild(confirmDiv);
  }

  static createMessage(parent:HTMLDivElement,msg,opacity=1,time=1000){
    let confirmDiv=document.createElement("div");
    let pos=200+150*GUIUtils.nelements;
    GUIUtils.nelements++;
    confirmDiv.style.cssText=`
      width:100%;
      padding:20px;
      background-color:rgba(255, 255, 255, 0.7);
      color:black;
      font:Arial;
      font-size:14px;
      border:1px solid white;
      border-radius:10px;
      position:absolute;
      text-align:center;
      top:${pos}px;
      z-index:10000;
      opacity:${opacity};
    `;
    let textDiv=document.createElement("div");
    textDiv.style.cssText=`
    -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;`
    textDiv.innerText=msg;
    let buttonsDiv=document.createElement("div");
    buttonsDiv.style.cssText=`text-align:center`;
    confirmDiv.appendChild(textDiv);
    confirmDiv.appendChild(buttonsDiv);
    parent.appendChild(confirmDiv);

    setTimeout(()=>{
      this.nelements--;
      if(this.nelements<0)this.nelements=0;
      parent.removeChild(confirmDiv);
      
    },time)
  }
}
