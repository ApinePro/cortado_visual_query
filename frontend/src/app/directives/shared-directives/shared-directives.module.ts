import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StopEventPropagationDirective } from './stop-event-propagation.directive';
import { MonacoFormControllerDirective } from '.c:/Users/49171/Desktop/cortado/frontend/src/app/directives/monaco-form-controller.directive';
@NgModule({
  declarations: [	StopEventPropagationDirective,
      MonacoFormControllerDirective
   ],
  imports: [CommonModule],
  exports: [StopEventPropagationDirective],
})
export class SharedDirectivesModule {}
