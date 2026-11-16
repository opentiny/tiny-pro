import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EditorController } from './editor.controller';
import { EditorInitializer } from './editor.initializer';
import { EditorService } from './editor.service';
import {
  EditorCollaborationDocument,
  EditorDocument,
} from './entities/editor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EditorDocument, EditorCollaborationDocument]),
  ],
  controllers: [EditorController],
  providers: [EditorService, EditorInitializer],
})
export class EditorModule {}
