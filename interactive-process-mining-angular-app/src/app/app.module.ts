import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

//import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProcessTreeEditorComponent } from './components/process-tree-editor/process-tree-editor.component';
import { StrFilterPipe } from './pipes/str-filter.pipe';
import {FormsModule} from "@angular/forms";
import { VariantExplorerComponent } from './components/variant-explorer/variant-explorer.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { ActivityOverviewComponent } from './components/activity-overview/activity-overview.component';

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
    //AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
