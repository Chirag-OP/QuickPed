import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
        if (req.method !== 'POST') {
      return next.handle();
    }
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is missing');
    }
    const existingRecord = await this.prisma.idempotencyRecord.findUnique({
      where: { key: idempotencyKey },
    });
    if (existingRecord) {
      return of(existingRecord.responseBody);
    }
    return next.handle().pipe(
      tap(async (responseBody) => {
        try {
          await this.prisma.idempotencyRecord.create({
            data: {
              key: idempotencyKey,
              responseBody: responseBody ?? {},
            },
          });
        } catch (error) {
          console.error('Error saving idempotency record:', error);
        }
      }),
    );
  }
}
