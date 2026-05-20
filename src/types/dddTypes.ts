// Resposta da API para um DDD válido
export interface DddResponse {
  state: string;    // UF: "SP", "RJ", etc.
  cities: string[]; // lista de cidades
}