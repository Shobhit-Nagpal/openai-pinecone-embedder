export type Vector = {
  id: string;
  values: number[];
  metadata: Record<string, any>;
};

export type EnvManager = {
  OPENAI_API_KEY: string;
  PINECONE_API_KEY: string;
  PINECONE_INDEX: string;
}
