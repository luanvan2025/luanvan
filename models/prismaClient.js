//để sử dụng được  các models của prisma
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

