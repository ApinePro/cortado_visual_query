import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';

// import { AppRoutingModule } from './app-routing.module';
import {AppComponent} from './app.component';
import {FooterComponent} from './components/footer/footer.component';
import {ProcessTreeEditorComponent} from './components/process-tree-editor/process-tree-editor.component';
import {StrFilterPipe} from './pipes/str-filter.pipe';
import {FormsModule} from '@angular/forms';
import {VariantExplorerComponent} from './components/variant-explorer/variant-explorer.component';
import {SideBarComponent} from './components/side-bar/side-bar.component';
import {ActivityOverviewComponent} from './components/activity-overview/activity-overview.component';
import {HttpRequestInterceptor} from './interceptors/http-request.interceptor';
import { VariantFragmentComponent } from './components/variant-explorer/variant-fragment/variant-fragment.component';
import { DetailledVariantComponent } from './components/variant-explorer/detailled-variant/detailled-variant.component';
import { SubvariantsComponent } from './components/variant-explorer/subvariants/subvariants.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { VariantInfoComponent } from './components/variant-explorer/variant-info/variant-info.component';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    ProcessTreeEditorComponent,
    StrFilterPipe,
    VariantExplorerComponent,
    SideBarComponent,
    ActivityOverviewComponent,
    VariantFragmentComponent,
    DetailledVariantComponent,
    SubvariantsComponent,
    VariantInfoComponent
  ],
  imports: [
    BrowserModule,
    // AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ScrollingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
