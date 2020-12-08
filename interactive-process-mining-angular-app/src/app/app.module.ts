import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { ProcessTreeEditorComponent } from './process-tree-editor/process-tree-editor.component';
import { StrFilterPipe } from './str-filter.pipe';
import {FormsModule} from "@angular/forms";
import { VariantExplorerComponent } from './variant-explorer/variant-explorer.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { ActivityOverviewComponent } from './activity-overview/activity-overview.component';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    ProcessTreeEditorComponent,
    StrFilterPipe,
    VariantExplorerComponent,
    SideBarComponent,
    ActivityOverviewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
