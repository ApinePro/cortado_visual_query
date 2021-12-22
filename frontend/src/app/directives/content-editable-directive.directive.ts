import { Directive, ElementRef, forwardRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Renderer2 as Renderer} from '@angular/core';

@Directive({
  selector:
    '[contenteditable][formControl],' +
    '[contenteditable][formControlName]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ContentEditableDirective),
      multi: true,
    },
  ],
})
export class ContentEditableDirective implements ControlValueAccessor {

  constructor(private renderer : Renderer,
              private elementRef : ElementRef){
  }


  @HostListener('input')
  onInput() {
    this.onChange(this.elementRef.nativeElement.innerHTML);
  }

  private onTouched = () => {};

  private onChange = (value : string) => {};

  writeValue(value : string): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'innerHTML', value);
  }

  registerOnChange(onChange: (value: string) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'contenteditable', String(!isDisabled));
  }


}
