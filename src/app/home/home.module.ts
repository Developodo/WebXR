import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { ArObjectComponent } from '../ar-object/ar-object.component';
import { ThreedObjectComponent } from '../threed-object/threed-object.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage,ArObjectComponent,ThreedObjectComponent]
})
export class HomePageModule {}
