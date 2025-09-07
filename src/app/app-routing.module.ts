import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PuzzlesComponent } from './pages/puzzles/puzzles.component';
import { GlutaoComponent } from './pages/glutao/glutao.component';

const routes: Routes = [
  { path: '', redirectTo: '/puzzles', pathMatch: 'full' },
  { path: 'puzzles', component: PuzzlesComponent },
  { path: 'glutao', component: GlutaoComponent }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }