import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as Cloudinary,
} from 'cloudinary';
import { Model } from 'mongoose';
import * as stream from 'stream';
import { Readable } from 'stream';
import { CLOUDINARY, GOOGLE_DRIVE } from './constants';
import { File, FileDocument } from './schemas/file.schema';
@Injectable()
export class FileService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    @Inject(CLOUDINARY)
    private readonly cloudinaryProvider: typeof Cloudinary,
    @Inject(GOOGLE_DRIVE)
    private readonly googleDrive,
  ) {}

  async uploadImageCloudinary(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinaryProvider.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      const stream = Readable.from(file.buffer);
      stream.pipe(upload);
    });
  }

  async uploadImage(file: Express.Multer.File, name: string): Promise<File> {
    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);
      const { data } = await this.googleDrive.files.create({
        media: {
          mimeType: file.mimetype,
          body: bufferStream,
        },
        requestBody: {
          name: file.originalname,
          mimeType: file.mimetype,
        },
      });

      await this.googleDrive.permissions.create({
        fileId: data.id,
        requestBody: { role: 'reader', type: 'anyone' },
      });

      const {
        data: { webViewLink, webContentLink },
      } = await this.googleDrive.files.get({
        fileId: data.id,
        fields: 'webViewLink, webContentLink',
      });

      return (
        await this.fileModel.create({
          name,
          fileId: data.id,
          data: { ...data, webViewLink, webContentLink },
        })
      ).toObject();
    } catch (error) {
      throw error;
    }
  }

  async deleteImages(ids: string[]) {
    try {
      if (!ids || ids.length < 1) {
        return [];
      }
      const deletedFileIds = [];
      const files = await this.fileModel.find({ _id: { $in: ids } });

      for (const file of files) {
        try {
          await this.fileModel.deleteOne(file._id);

          await this.googleDrive.files.delete({ fileId: file.fileId }),
            deletedFileIds.push(file._id);
        } catch (error) {
          console.log(JSON.stringify(error));
        }
      }

      return deletedFileIds;
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<File[]> {
    return await this.fileModel.find().lean().exec();
  }
}
