import { EnvManager } from "./types";
import dotenv from "dotenv";

dotenv.config();

const initEnvManager = () => {
  const openAIKey = process.env.OPENAI_API_KEY;
  const pineconeKey = process.env.PINECONE_API_KEY;
  const pineconeIndex = process.env.PINECONE_INDEX;

  if (!openAIKey || !pineconeKey || !pineconeIndex) {
    throw new Error("API Key not provided!");
  }

  const envManager: EnvManager = {
    OPENAI_API_KEY: openAIKey,
    PINECONE_API_KEY: pineconeKey,
    PINECONE_INDEX: pineconeIndex,
  };

  return envManager;
};

const env = initEnvManager();

export default env;
