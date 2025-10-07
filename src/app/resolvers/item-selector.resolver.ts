import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { TreeNode } from '../models/data.model';

export const itemSelectorResolver: ResolveFn<TreeNode[]> = (): Observable<TreeNode[]> => {
  const dataService = inject(DataService);
  return dataService.loadData();
};