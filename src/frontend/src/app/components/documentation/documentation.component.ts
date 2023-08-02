import { Component, Inject, Input, OnInit } from '@angular/core';
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
  showDocumentation: Observable<void>;
  headings: NodeListOf<Element>;
  // tslint:disable-next-line:variable-name
  private _destroy$ = new Subject();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    this.showDocumentation
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this.showModal());
  }

  showModal(): void {
    $('#documentationModalDialog').modal('show');
  }

  onReady() {
    setTimeout(() => {
      this.headings = this.document
        .querySelector('main')
        .querySelectorAll('h1, h2, h3, h4, h5, h6');
      const aa = 10;
    });
  }

  onLoad(event) {}

  onError(event) {}

  onClick(elementId): void {
    document.querySelector('#' + elementId).scrollIntoView();
  }
}
