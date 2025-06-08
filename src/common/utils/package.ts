import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface PackageJson {
  name: string;
  version: string;
  description?: string;
  [key: string]: any;
}

export function getPackageJson(): PackageJson {
  const packageJsonPath = resolve(__dirname, '../../../package.json');

  try {
    const packageJson = readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(packageJson) as PackageJson;
  } catch (error: unknown) {
    throw new Error(`Failed to read package.json: ${(error as Error).message}`);
  }
}
