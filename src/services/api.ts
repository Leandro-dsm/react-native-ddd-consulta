import { DddResponse } from '../types/dddTypes';

const BASE_URL = 'https://brasilapi.com.br/api/ddd/v1';

export async function fetchDDD(ddd: string): Promise<DddResponse> {
  const response = await fetch(`${BASE_URL}/${ddd}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('DDD não encontrado. Verifique o código informado.');
    }
    throw new Error('Erro ao conectar com a API. Tente novamente.');
  }

  const data = await response.json();
  // A API retorna { state: string, cities: string[] }
  return data as DddResponse;
}