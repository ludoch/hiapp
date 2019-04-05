import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'blog',
        loadChildren: './blog/blog.module#HipappBlogModule'
      },
      {
        path: 'blog-entry',
        loadChildren: './blog-entry/blog-entry.module#HipappBlogEntryModule'
      },
      {
        path: 'tag',
        loadChildren: './tag/tag.module#HipappTagModule'
      }
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ])
  ],
  declarations: [],
  entryComponents: [],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HipappEntityModule {}
