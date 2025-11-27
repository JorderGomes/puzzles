import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PuzzlesComponent } from './pages/puzzles/puzzles.component';
import { GlutaoComponent } from './pages/glutao/glutao.component';
import { FallenComponent } from './pages/fallen/fallen.component';
import { GuessComponent } from './pages/guess/guess.component';
import { TicTacToeComponent } from './pages/tic-tac-toe/tic-tac-toe.component';


@NgModule({
  declarations: [
    AppComponent,
    PuzzlesComponent,
    GlutaoComponent,
    FallenComponent,
    GuessComponent,
    TicTacToeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
