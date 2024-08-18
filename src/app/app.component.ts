import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  Renderer2,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { filter, fromEvent, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy, AfterViewInit {
  private readonly renderer = inject(Renderer2);

  private readonly unsubscribe = new Subject<void>();
  private readonly wrapperSignal =
    viewChild<ElementRef<HTMLDivElement>>('wrapper');

  private canvas?: HTMLCanvasElement;
  // private readonly canvasSignal =
  //   viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  ngAfterViewInit(): void {
    const wrapperElementRef = this.wrapperSignal();
    if (!wrapperElementRef) {
      return;
    }

    const canvas: HTMLCanvasElement = this.renderer.createElement('canvas');
    canvas.width = +wrapperElementRef.nativeElement.clientWidth;
    canvas.height = +wrapperElementRef.nativeElement.clientHeight;

    wrapperElementRef.nativeElement.appendChild(canvas);

    fromEvent(canvas, 'mousedown')
      .pipe(
        takeUntil(this.unsubscribe),
        filter((event: Event) => event instanceof MouseEvent),
        tap((event) => {
          const context = canvas.getContext('2d');
          if (!context) {
            return;
          }

          this.drawCircle(context, event.offsetX, event.offsetY);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  protected drawCircle(
    context: CanvasRenderingContext2D,
    x: number,
    y: number
  ): void {
    context.beginPath();
    context.arc(x, y, 5, 0, 2 * Math.PI);
    context.fillStyle = 'pink';
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = 'violet';
    context.stroke();
  }

  protected reset(): void {
    if (!this.canvas) {
      return;
    }

    const context = this.canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
