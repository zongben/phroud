import { ApiArrayProperty, ApiProperty, MulterFile } from "../../../../../src";

export class UploadFile {
  @ApiProperty({
    description: "標題",
  })
  title!: string;

  @ApiArrayProperty({
    type: "string",
    description: "檔案",
    format: "binary",
  })
  files!: MulterFile[];
}
