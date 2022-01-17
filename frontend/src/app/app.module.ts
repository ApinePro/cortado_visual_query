import { DropZoneComponent } from './components/drop-zone/drop-zone.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { ActivityOverviewSortingPipe } from './pipes/activity-overview-sorting/activity-overview-sorting.pipe';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FooterComponent } from './components/footer/footer.component';
import { ProcessTreeEditorComponent } from './components/process-tree-editor/process-tree-editor.component';
import { StrFilterPipe } from './pipes/str-filter/str-filter.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxFileDropModule } from 'ngx-file-drop';
import { ColorPickerModule } from 'ngx-color-picker';

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
import { ContentEditableDirective } from './directives/content-editable-directive.directive';
import { SettingsComponent } from './components/settings/settings.component';
import { DropZoneDirective } from './directives/drop-zone/drop-zone.directive';
import { TreeStringRendererComponent } from './components/tree-string-renderer/tree-string-renderer.component';
import { TooltipDirective } from './directives/tooltip/tooltip.directive';
import { VariantComponent } from './components/variant-explorer/variant/variant.component';
import { VariantConformanceDialogComponent } from './components/variant-explorer/variant-conformance-dialog/variant-conformance-dialog.component';
import { HeaderBarComponent } from './components/header-bar/header-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    StrFilterPipe,
    ActivityOverviewSortingPipe,
    SideBarComponent,
    GoldenLayoutHostComponent,
    VariantExplorerComponent,
    VariantFragmentComponent,
    VariantInfoComponent,
    VariantSelectionButtonComponent,
    ActivityOverviewComponent,
    ProcessTreeEditorComponent,
    VariantInfoComponent,
    ExpertModeComponent,
    ContentEditableDirective,
    SettingsComponent,
    DropZoneComponent,
    DropZoneDirective,
    TooltipDirective,
    VariantConformanceDialogComponent,
    TreeStringRendererComponent,
    VariantComponent,
    HeaderBarComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgxFileDropModule,
    BrowserAnimationsModule,
    ColorPickerModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true,
    },
    GoldenLayoutComponentService,
  ],
  entryComponents: [
    VariantExplorerComponent,
    VariantFragmentComponent,
    ActivityOverviewComponent,
    ProcessTreeEditorComponent,
    VariantInfoComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
