import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LazyLoadingServiceService {

  private intersectionObserver: any;
  private mapping: Map<Element, Function> = new Map<Element, Function>();

  private initialize(rootElement: ElementRef): void {
    const self = this;
    this.intersectionObserver = new IntersectionObserver(function (entries) {
      for (let entry of entries) {
        const callback = self.mapping.get(entry.target);
        
        if (callback !== undefined) {
          callback(entry.isIntersecting);
        }
      }
    }, { root: rootElement.nativeElement, rootMargin: "2000px 0px 2000px 0px" });
  }

  public addVariant(variantElement: ElementRef, rootElement: ElementRef, callback: Function): void {
    if (this.intersectionObserver === null || this.intersectionObserver === undefined) {
      this.initialize(rootElement);
    }

    this.mapping.set(variantElement.nativeElement, callback);
    this.intersectionObserver.observe(variantElement.nativeElement);
  }
}
