import { Component, OnInit } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';
import { JhiAlertService, JhiDataUtils } from 'ng-jhipster';
import { IBlogEntry, BlogEntry } from 'app/shared/model/blog-entry.model';
import { BlogEntryService } from './blog-entry.service';
import { IBlog } from 'app/shared/model/blog.model';
import { BlogService } from 'app/entities/blog';
import { ITag } from 'app/shared/model/tag.model';
import { TagService } from 'app/entities/tag';

@Component({
  selector: 'jhi-blog-entry-update',
  templateUrl: './blog-entry-update.component.html'
})
export class BlogEntryUpdateComponent implements OnInit {
  blogEntry: IBlogEntry;
  isSaving: boolean;

  blogs: IBlog[];

  tags: ITag[];

  editForm = this.fb.group({
    id: [],
    title: [null, [Validators.required]],
    content: [null, [Validators.required]],
    date: [null, [Validators.required]],
    blog: [],
    tags: []
  });

  constructor(
    protected dataUtils: JhiDataUtils,
    protected jhiAlertService: JhiAlertService,
    protected blogEntryService: BlogEntryService,
    protected blogService: BlogService,
    protected tagService: TagService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ blogEntry }) => {
      this.updateForm(blogEntry);
      this.blogEntry = blogEntry;
    });
    this.blogService
      .query()
      .pipe(
        filter((mayBeOk: HttpResponse<IBlog[]>) => mayBeOk.ok),
        map((response: HttpResponse<IBlog[]>) => response.body)
      )
      .subscribe((res: IBlog[]) => (this.blogs = res), (res: HttpErrorResponse) => this.onError(res.message));
    this.tagService
      .query()
      .pipe(
        filter((mayBeOk: HttpResponse<ITag[]>) => mayBeOk.ok),
        map((response: HttpResponse<ITag[]>) => response.body)
      )
      .subscribe((res: ITag[]) => (this.tags = res), (res: HttpErrorResponse) => this.onError(res.message));
  }

  updateForm(blogEntry: IBlogEntry) {
    this.editForm.patchValue({
      id: blogEntry.id,
      title: blogEntry.title,
      content: blogEntry.content,
      date: blogEntry.date != null ? blogEntry.date.format(DATE_TIME_FORMAT) : null,
      blog: blogEntry.blog,
      tags: blogEntry.tags
    });
  }

  byteSize(field) {
    return this.dataUtils.byteSize(field);
  }

  openFile(contentType, field) {
    return this.dataUtils.openFile(contentType, field);
  }

  setFileData(event, field: string, isImage) {
    return new Promise((resolve, reject) => {
      if (event && event.target && event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        if (isImage && !/^image\//.test(file.type)) {
          reject(`File was expected to be an image but was found to be ${file.type}`);
        } else {
          const filedContentType: string = field + 'ContentType';
          this.dataUtils.toBase64(file, base64Data => {
            this.editForm.patchValue({
              [field]: base64Data,
              [filedContentType]: file.type
            });
          });
        }
      } else {
        reject(`Base64 data was not set as file could not be extracted from passed parameter: ${event}`);
      }
    }).then(
      () => console.log('blob added'), // sucess
      this.onError
    );
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    const blogEntry = this.createFromForm();
    if (blogEntry.id !== undefined) {
      this.subscribeToSaveResponse(this.blogEntryService.update(blogEntry));
    } else {
      this.subscribeToSaveResponse(this.blogEntryService.create(blogEntry));
    }
  }

  private createFromForm(): IBlogEntry {
    const entity = {
      ...new BlogEntry(),
      id: this.editForm.get(['id']).value,
      title: this.editForm.get(['title']).value,
      content: this.editForm.get(['content']).value,
      date: this.editForm.get(['date']).value != null ? moment(this.editForm.get(['date']).value, DATE_TIME_FORMAT) : undefined,
      blog: this.editForm.get(['blog']).value,
      tags: this.editForm.get(['tags']).value
    };
    return entity;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IBlogEntry>>) {
    result.subscribe((res: HttpResponse<IBlogEntry>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackBlogById(index: number, item: IBlog) {
    return item.id;
  }

  trackTagById(index: number, item: ITag) {
    return item.id;
  }

  getSelected(selectedVals: Array<any>, option: any) {
    if (selectedVals) {
      for (let i = 0; i < selectedVals.length; i++) {
        if (option.id === selectedVals[i].id) {
          return selectedVals[i];
        }
      }
    }
    return option;
  }
}
