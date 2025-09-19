import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PuzzlesComponent } from './pages/puzzles/puzzles.component';
import { GlutaoComponent } from './pages/glutao/glutao.component';
import { FallenComponent } from './pages/fallen/fallen.component';
import { GuessComponent } from './pages/guess/guess.component';
import { TicTacToeComponent } from './pages/tic-tac-toe/tic-tac-toe.component';

const routes: Routes = [
  { path: '', redirectTo: '/puzzles', pathMatch: 'full' },
  { path: 'puzzles', component: PuzzlesComponent },
  { path: 'glutao', component: GlutaoComponent }, 
  { path: 'fallen', component: FallenComponent},
  { path: 'guess', component: GuessComponent},
  { path: 'tic-tac-toe', component: TicTacToeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }