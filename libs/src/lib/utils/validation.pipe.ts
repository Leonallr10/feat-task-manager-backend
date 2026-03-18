import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || this.isPrimitive(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      const messages = errors
        .map((err) => Object.values(err.constraints ?? {}))
        .flat();
      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      });
    }
    return object;
  }

  private isPrimitive(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return types.includes(metatype);
  }
}

