export interface TiebreakerContext {
  scores: Map<string, number>;
  teams: { id: string; inscriptionOrder: number }[];
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
}

export interface TiebreakerStrategy {
  /** Retorna o id do vencedor ou null se não conseguir desempatar. */
  resolve(context: TiebreakerContext): Promise<string | null>;
}

/** Desempata pela pontuação acumulada nos jogos anteriores. */
export class PontuacaoStrategy implements TiebreakerStrategy {
  async resolve(context: TiebreakerContext): Promise<string | null> {
    const homePoints = context.scores.get(context.homeId) ?? 0;
    const awayPoints = context.scores.get(context.awayId) ?? 0;
    if (homePoints > awayPoints) return context.homeId;
    if (awayPoints > homePoints) return context.awayId;
    return null;
  }
}

/** Desempata pela ordem de inscrição no torneio (menor = preferência). */
export class OrdemInscricaoStrategy implements TiebreakerStrategy {
  async resolve(context: TiebreakerContext): Promise<string | null> {
    const homeTeam = context.teams.find((t) => t.id === context.homeId);
    const awayTeam = context.teams.find((t) => t.id === context.awayId);
    if (!homeTeam || !awayTeam) return null;
    return homeTeam.inscriptionOrder <= awayTeam.inscriptionOrder
      ? context.homeId
      : context.awayId;
  }
}

/** Interface para geração de placar de pênaltis. */
export interface PenaltyScoreGenerator {
  generate(): Promise<[number, number]>;
}

/** Desempata por pênaltis (executa o gerador de placar para simular). */
export class PenaltyStrategy implements TiebreakerStrategy {
  constructor(private scoreGenerator: PenaltyScoreGenerator) {}

  async resolve(context: TiebreakerContext): Promise<string | null> {
    const [homePenalties, awayPenalties] =
      await this.scoreGenerator.generate();
    if (homePenalties > awayPenalties) return context.homeId;
    if (awayPenalties > homePenalties) return context.awayId;
    return null;
  }
}
