import { DropZoneComponent } from './components/drop-zone/drop-zone.component';
import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
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
import { ActivityOverviewComponent } from './components/activity-overview/activity-overview.component';
import { HttpRequestInterceptor } from './interceptors/http-request.interceptor';
import { VariantFragmentComponent } from './components/variant-explorer/variant-fragment/variant-fragment.component';
import { VariantInfoComponent } from './components/variant-explorer/variant-info/variant-info.component';
import { ModelPerformanceComponent } from './components/performance/performance.component';
import { HumanizeDurationPipe } from './pipes/humanize-duration.pipe';
import { VariantPerformanceComponent } from './components/variant-performance/variant-performance.component';
import { InfoBoxComponent } from './components/info-box/info-box.component';
import { VariantSelectionButtonComponent } from './components/variant-explorer/variant-selection-button/variant-selection-button.component';
import { GoldenLayoutComponentService } from './services/goldenLayoutService/golden-layout-component.service';
import { GoldenLayoutHostComponent } from './components/golden-layout-host/golden-layout-host.component';
import { SubvariantExplorerComponent } from './components/variant-explorer/subvariant-explorer/subvariant-explorer.component';
import { VariantColorMapComponent } from './components/variant-performance/variant-color-map/variant-color-map.component';
import { NodeSelectionPerformanceComponent } from './components/performance/node-selection-performance/node-selection-performance.component';
import { PerformanceTableComponent } from './components/performance/performance-table/performance-table.component';
import { ColorMapComponent } from './components/performance/color-map/color-map.component';
import { TreePerformanceColorMapComponent } from './components/performance/tree-performance-color-map/tree-performance-color-map.component';
import { ExpertModeComponent } from './components/process-tree-editor/expert-mode/expert-mode.component';
import { ContentEditableDirective } from './directives/content-editable-directive.directive';
import { SettingsComponent } from './components/settings/settings.component';
import { DropZoneDirective } from './directives/drop-zone/drop-zone.directive';
import { TreeStringRendererComponent } from './components/tree-string-renderer/tree-string-renderer.component';
import { TooltipDirective } from './directives/tooltip/tooltip.directive';
import { VariantEditorComponent } from './components/variant-editor/variant-editor.component';
import { VariantDrawerDirective } from './directives/variant-drawer.directive';
import { VariantComponent } from './components/variant-explorer/variant/variant.component';
import { VariantConformanceDialogComponent } from './components/variant-explorer/variant-conformance-dialog/variant-conformance-dialog.component';
import { BpmnEditorComponent } from './components/bpmn-editor/bpmn-editor.component';
import { GoldenLayoutDummyComponent } from './components/golden-layout-host/golden-layout-dummy/golden-layout-dummy.component';
import { SubVariantComponent } from './components/variant-explorer/sub-variant/sub-variant.component';
import { ActivityButtonAreaComponent } from './components/variant-editor/activity-button-area/activity-button-area.component';
import { HeaderBarComponent } from './components/header-bar/header-bar.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { DialogModule } from './components/dialogs/dialog.module';
import { VariantMinerComponent } from './components/variant-miner/variant-miner.component';
import { VariantMinerPatternComponent } from './components/variant-miner/variant-miner-pattern/variant-miner-pattern.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { VariantQueryComponent } from './components/variant-explorer/variant-query/variant-query.component';
import { SyntaxHighlightedTextareaDirective } from './directives/syntax-highlighted-textarea.directive';
import { ConformanceInfoBarComponent } from './components/variant-explorer/info-bar/conformance-info-bar.component';
import { initApp, InitService } from './services/init.service';
import { VariantQueryInfoComponent } from './components/variant-explorer/variant-query-info/variant-query-info.component';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    StrFilterPipe,
    ActivityOverviewSortingPipe,
    GoldenLayoutHostComponent,
    VariantExplorerComponent,
    VariantFragmentComponent,
    VariantInfoComponent,
    ModelPerformanceComponent,
    HumanizeDurationPipe,
    VariantPerformanceComponent,
    InfoBoxComponent,
    ActivityOverviewComponent,
    ProcessTreeEditorComponent,
    SubvariantExplorerComponent,
    VariantInfoComponent,
    VariantColorMapComponent,
    VariantSelectionButtonComponent,
    VariantQueryComponent,
    ActivityOverviewComponent,
    NodeSelectionPerformanceComponent,
    PerformanceTableComponent,
    ColorMapComponent,
    TreePerformanceColorMapComponent,
    VariantInfoComponent,
    ExpertModeComponent,
    ContentEditableDirective,
    SettingsComponent,
    DropZoneComponent,
    DropZoneDirective,
    TooltipDirective,
    VariantConformanceDialogComponent,
    TreeStringRendererComponent,
    VariantEditorComponent,
    VariantDrawerDirective,
    SyntaxHighlightedTextareaDirective,
    ActivityButtonAreaComponent,
    VariantComponent,
    BpmnEditorComponent,
    SubVariantComponent,
    HeaderBarComponent,
    GoldenLayoutDummyComponent,
    VariantMinerComponent,
    VariantMinerPatternComponent,
    ConformanceInfoBarComponent,
    VariantQueryInfoComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgxFileDropModule,
    BrowserAnimationsModule,
    ColorPickerModule,
    SweetAlert2Module.forRoot(),
    DialogModule,
    NgxSliderModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [InitService],
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
