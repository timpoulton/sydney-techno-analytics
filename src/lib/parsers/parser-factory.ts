import { Platform } from '@prisma/client';
import { BaseCSVParser } from './base-parser';
import { HumanitixParser } from './humanitix.parser';
import { ResidentAdvisorParser } from './resident-advisor.parser';
import { MoshtixParser } from './moshtix.parser';

export class ParserFactory {
  static getParser(platform: Platform): BaseCSVParser {
    switch (platform) {
      case Platform.HUMANITIX:
        return new HumanitixParser();
      case Platform.RESIDENT_ADVISOR:
        return new ResidentAdvisorParser();
      case Platform.MOSHTIX:
        return new MoshtixParser();
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}