import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSqlComponent } from './edit-sql.component';

describe('EditSqlComponent', () => {
  let component: EditSqlComponent;
  let fixture: ComponentFixture<EditSqlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditSqlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSqlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
