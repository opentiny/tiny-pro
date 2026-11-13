import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EditorCollaborationDocument,
  EditorDocument,
} from './entities/editor.entity';

function currentTime() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

@Injectable()
export class EditorService {
  constructor(
    @InjectRepository(EditorDocument)
    private readonly documentRepository: Repository<EditorDocument>,
    @InjectRepository(EditorCollaborationDocument)
    private readonly collaborationRepository: Repository<EditorCollaborationDocument>
  ) {}

  findDocuments() {
    return this.documentRepository.find({ order: { id: 'DESC' } });
  }

  createDocument(data: Partial<EditorDocument>) {
    if (!String(data.name ?? '').trim()) {
      throw new BadRequestException('文档标题不能为空');
    }
    return this.documentRepository.save(
      this.documentRepository.create({
        name: data.name,
        department: data.department ?? '',
        content: data.content ?? '',
        time: currentTime(),
      })
    );
  }

  async updateDocument(id: number, patch: Partial<EditorDocument>) {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      return false;
    }
    Object.assign(document, patch, { id: document.id });
    await this.documentRepository.save(document);
    return true;
  }

  async removeDocument(id: number) {
    await this.documentRepository.delete(id);
    return true;
  }

  findCollaborationDocuments() {
    return this.collaborationRepository.find({ order: { id: 'DESC' } });
  }

  createCollaborationDocument(data: Partial<EditorCollaborationDocument>) {
    if (!String(data.name ?? '').trim()) {
      throw new BadRequestException('文档标题不能为空');
    }
    return this.collaborationRepository.save(
      this.collaborationRepository.create({
        name: data.name,
        members: data.members ?? [],
        content: data.content ?? '',
        time: currentTime(),
      })
    );
  }

  async updateCollaborationDocument(
    id: number,
    patch: Partial<EditorCollaborationDocument>
  ) {
    const document = await this.collaborationRepository.findOne({
      where: { id },
    });
    if (!document) {
      return false;
    }
    Object.assign(document, patch, { id: document.id });
    await this.collaborationRepository.save(document);
    return true;
  }

  async removeCollaborationDocument(id: number) {
    await this.collaborationRepository.delete(id);
    return true;
  }
}
