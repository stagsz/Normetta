import { Request, Response, NextFunction } from 'express';

export function tenantContext(req: Request, res: Response, next: NextFunction): void {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      next();
      return;
    }

    void (req as any)
      .prisma?.$executeRawUnsafe?.(
        `SET LOCAL app.current_org_id = '${String(orgId).replace(/'/g, "''")}'`
      );
  } catch (error) {
    console.warn('tenantContext middleware failed to set app.current_org_id', error);
  }

  next();
}
