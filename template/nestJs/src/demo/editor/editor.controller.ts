import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { Reject } from '../../public/reject.decorator';
import { EditorService } from './editor.service';
import {
  EditorCollaborationDocument,
  EditorDocument,
} from './entities/editor.entity';

@Controller('editor')
export class EditorController {
  constructor(private readonly editorService: EditorService) {}

  @Get('documents')
  findDocuments() {
    return this.editorService.findDocuments();
  }

  @Reject()
  @Post('document')
  createDocument(@Body() body: Partial<EditorDocument>) {
    return this.editorService.createDocument(body);
  }

  @Reject()
  @Post('document/update')
  updateDocument(
    @Body() body: { id: number; patch: Partial<EditorDocument> }
  ) {
    return this.editorService.updateDocument(Number(body.id), body.patch ?? {});
  }

  @Reject()
  @Delete('document')
  removeDocument(@Query('id') id: string) {
    return this.editorService.removeDocument(Number(id));
  }

  @Get('collaboration-documents')
  findCollaborationDocuments() {
    return this.editorService.findCollaborationDocuments();
  }

  @Reject()
  @Post('collaboration-document')
  createCollaborationDocument(
    @Body() body: Partial<EditorCollaborationDocument>
  ) {
    return this.editorService.createCollaborationDocument(body);
  }

  @Reject()
  @Post('collaboration-document/update')
  updateCollaborationDocument(
    @Body()
    body: {
      id: number;
      patch: Partial<EditorCollaborationDocument>;
    }
  ) {
    return this.editorService.updateCollaborationDocument(
      Number(body.id),
      body.patch ?? {}
    );
  }

  @Reject()
  @Delete('collaboration-document')
  removeCollaborationDocument(@Query('id') id: string) {
    return this.editorService.removeCollaborationDocument(Number(id));
  }
}
