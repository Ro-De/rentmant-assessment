import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './services/data.service';
import { ItemSelectorComponent } from './components/item-selector.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, ItemSelectorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="p-8 max-w-[339px] mx-auto bg-[#f8f9fa] min-h-[55vh] font-sans">
      <h1 class="text-[24px] font-semibold text-[#3c3c3c] mb-6">Item Selector</h1>

      <app-item-selector></app-item-selector>

      <div style="margin-top: 12px;">
        @if ((selectedIds$ | async)?.length) {
          <div class="mb-4 text-[#3c3c3c] text-[14px] font-normal">
            Selected item IDs: {{ (selectedIds$ | async)?.join(', ') }}
          </div>
        }

        <div class="flex justify-end mt-2">
          <button
            style="padding: 10px 24px;"
            class="bg-[hsl(213,97%,53%)] text-white border-0
                   rounded-[4px] text-[14px] font-medium cursor-pointer
                   transition-all duration-200 ease-in-out
                   hover:bg-[hsl(213,97%,48%)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)]
                   disabled:bg-[hsl(210,0%,80%)] disabled:cursor-not-allowed
                   disabled:opacity-60"
            (click)="clearSelection()"
            [disabled]="!(selectedIds$ | async)?.length">
            Clear selection
          </button>
        </div>
      </div>
    </div>
  `
})
export class AppComponent {
    private readonly dataService = inject(DataService);
    readonly selectedIds$ = this.dataService.selectedIds$;

    constructor() {
        this.dataService.loadData().pipe(takeUntilDestroyed()).subscribe();
    }

    clearSelection() { this.dataService.clearAllSelections(); }
}
