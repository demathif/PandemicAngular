import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { PandemicService } from './pandemic.service';

import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent
  ],
  imports: [
    BrowserModule, FormsModule
  ],
  providers: [PandemicService],
  bootstrap: [AppComponent]
})
export class AppModule { }
