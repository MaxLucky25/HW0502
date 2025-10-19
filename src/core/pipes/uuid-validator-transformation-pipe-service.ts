import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

// Встроенная функция валидации UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

@Injectable()
export class UuidValidationTransformationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): any {
    // Проверяем, что тип данных в декораторе — String (для UUID)
    if (metadata.metatype !== String) {
      return value;
    }

    if (!isValidUUID(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid UUID: ${value}`,
        field: 'UUID',
      });
    }
    return value; // Возвращаем строку как есть

    // Если тип не String, возвращаем значение без изменений
  }
}

/**
 * Not add it globally. Use only locally
 */
@Injectable()
export class UuidValidationPipe implements PipeTransform {
  transform(value: any): any {
    // Проверяем, что value является строкой
    if (typeof value !== 'string') {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid UUID: expected string, got ${typeof value}`,
        field: 'UUID',
      });
    }

    if (!isValidUUID(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid UUID: ${value}`,
        field: 'UUID',
      });
    }

    // Если валидация прошла, возвращаем значение без изменений
    return value;
  }
}
