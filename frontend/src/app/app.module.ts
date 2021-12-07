import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProcessTreeEditorComponent } from './components/process-tree-editor/process-tree-editor.component';
import { StrFilterPipe } from './pipes/str-filter.pipe';
import { FormsModule } from '@angular/forms';
import { VariantExplorerComponent } from './components/variant-explorer/variant-explorer.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { ActivityOverviewComponent } from './components/activity-overview/activity-overview.component';
import { HttpRequestInterceptor } from './interceptors/http-request.interceptor';
import { VariantFragmentComponent } from './components/variant-explorer/variant-fragment/variant-fragment.component';
import { VariantInfoComponent } from './components/variant-explorer/variant-info/variant-info.component';
import { VariantSelectionButtonComponent } from './components/variant-explorer/variant-selection-button/variant-selection-button.component';
import { GoldenLayoutComponentService } from './services/goldenLayoutService/golden-layout-component.service';
import { GoldenLayoutHostComponent } from './components/golden-layout-host/golden-layout-host.component';
import { ExpertModeComponent } from './components/process-tree-editor/expert-mode/expert-mode.component';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    StrFilterPipe,
    SideBarComponent,
    GoldenLayoutHostComponent,
    VariantExplorerComponent,
    VariantFragmentComponent,
    VariantInfoComponent,
    VariantSelectionButtonComponent,
    ActivityOverviewComponent,
    ProcessTreeEditorComponent,
    VariantInfoComponent,
    ExpertModeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true
    },
    GoldenLayoutComponentService,
  ],
  entryComponents: [
    VariantExplorerComponent,
    VariantFragmentComponent,
    ActivityOverviewComponent,
    ProcessTreeEditorComponent,
    VariantInfoComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
