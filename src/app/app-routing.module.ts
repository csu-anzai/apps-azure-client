import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from "./settings.component";

const routes: Routes = [
  {
     path: 'settings', component:SettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{  enableTracing:false})],
  exports: [RouterModule]
})
export class AppRoutingModule {

 }
