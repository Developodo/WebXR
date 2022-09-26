import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit{
  public loaded=false;
  constructor() {}
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loaded=true;
    }, 0);
  }

}
