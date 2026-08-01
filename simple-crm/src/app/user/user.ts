import { Component } from '@angular/core';

@Component({
  selector: 'app-user',
  template: `<h1 class="page-title">User</h1>`,
  styles: `
    .page-title {
      margin: 0;
      font-size: clamp(1.75rem, 3vw, 2.25rem);
      font-weight: 700;
      line-height: 1.2;
      color: rgba(0, 0, 0, 0.9);
    }
  `,
})
export class User {}
