export class DuplicateTeamIdsError extends Error {
  constructor() {
    super('teamIds must not contain duplicates');
    this.name = 'DuplicateTeamIdsError';
  }
}
