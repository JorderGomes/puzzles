import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PuzzlesComponent } from './pages/puzzles/puzzles.component';

const routes: Routes = [
  { path: '', redirectTo: '/puzzles', pathMatch: 'full' },
  { path: 'puzzles', component: PuzzlesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }