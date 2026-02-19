export class InvalidTeamsCountError extends Error {
  constructor() {
    super('Tournament must have exactly 8 teams');
    this.name = 'InvalidTeamsCountError';
  }
}
