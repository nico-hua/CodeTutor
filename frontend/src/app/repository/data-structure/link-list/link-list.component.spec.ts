import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkListComponent } from './link-list.component';
import { LinkListObject } from '../../../../object/data-structure/linkList';

describe('LinkListComponent', () => {
  let component: LinkListComponent;
  let fixture: ComponentFixture<LinkListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkListComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkListComponent);
    component = fixture.componentInstance;
    component.list = new LinkListObject('test linklist')
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
