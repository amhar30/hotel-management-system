import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersList } from './customers-list.component';

describe('CustomersList', () => {
  let component: CustomersList;
  let fixture: ComponentFixture<CustomersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
