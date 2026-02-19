import { execSync } from 'node:child_process';
import path from 'node:path';

export interface ScoreGenerator {
  generate(): Promise<[number, number]>;
}

export class PythonScoreGenerator implements ScoreGenerator {
  constructor(private scriptPath: string = path.join(process.cwd(), 'teste.py')) {}

  async generate(): Promise<[number, number]> {
    try {
      const python = process.platform === 'win32' ? 'python' : 'python3';
      const output = execSync(`${python} "${this.scriptPath}"`, {
        encoding: 'utf-8',
        timeout: 5000,
      }).trim();
      const lines = output.split('\n').filter(Boolean);
      const home = parseInt(lines[0] ?? '0', 10);
      const away = parseInt(lines[1] ?? '0', 10);
      return [Number.isNaN(home) ? 0 : Math.max(0, Math.min(7, home)), Number.isNaN(away) ? 0 : Math.max(0, Math.min(7, away))];
    } catch {
      return this.fallback();
    }
  }

  private fallback(): [number, number] {
    return [
      Math.floor(Math.random() * 8),
      Math.floor(Math.random() * 8),
    ];
  }
}
