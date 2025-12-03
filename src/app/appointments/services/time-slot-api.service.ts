import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { TimeSlotResponse } from './time-slot.response';

@Injectable({
  providedIn: 'root'
})
export class TimeSlotApiService extends BaseService<TimeSlotResponse> {
  override resourceEndpoint = '/time-slots';
  constructor() {
    super();
  }

}
