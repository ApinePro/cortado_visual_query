import { Component, Inject, Input, OnInit} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css'],
})
export class DocumentationComponent implements OnInit {
  @Input()
  showDocumentation: Observable<string>;
  headings: NodeListOf<Element>;
  // tslint:disable-next-line:variable-name
  private _destroy$ = new Subject();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit() {
    this.showDocumentation
      .pipe(takeUntil(this._destroy$))
      .subscribe((heading) => {
        this.showModal(heading);
      });
  }

  showModal(heading): void {
    $('#documentationModalDialog').modal('show');
    $('#documentationModalDialog').on('shown.bs.modal', (e) => {
      if (heading) {
        this.navToHeading(heading);
      }
    });
    setTimeout(() => {
      this.navToHeading(heading);
    }, 160);
  }

  onReady() {
    setTimeout(() => {
      this.headings = this.document
        .querySelector('main')
        .querySelectorAll('h1, h2, h3, h4, h5, h6');
    });
  }

  navToHeading(heading: string) {
    let elementId;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.headings.length; i++) {
      if (this.headings[i].innerHTML === heading) {
        elementId = this.headings[i].id;
        break;
      }
    }
    if (elementId) {
      this.onClick(elementId);
    }
  }

  onLoad(event) {
    const aa = 10;
  }

  onError(event) {}

  onClick(elementId): void {
    document.querySelector('#' + elementId).scrollIntoView();
  }
}
