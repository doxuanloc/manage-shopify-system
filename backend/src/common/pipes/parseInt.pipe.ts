import { BadRequestException, PipeTransform } from '@nestjs/common';

export class ParseIntPipe implements PipeTransform<string> {
  async transform(value, metadata) {
    if (!value) return value;
    if (!this.isNumeric(value)) {
      throw new BadRequestException(
        'Validation failed (numeric string is expected)',
      );
    }
    return parseInt(value, 10);
  }

  isNumeric(value) {
    return (
      ['string', 'number'].includes(typeof value) &&
      /^-?\d+$/.test(value) &&
      isFinite(value)
    );
  }
}
