import { ServerlessSpecCloudEnum } from "@pinecone-database/pinecone";
import env from "./env";

/**
 * Vector Dimension depends on the LLM you're using for Embedding
 * OpenAI - 1536
 * Mistral - 1024;
 * Anthropic - 1024;
 */
export const VECTOR_DIMENSION = 1536;

/**
 * Name of the index being used on Pinecone
 */
export const PINECONE_INDEX = env.PINECONE_INDEX;

/**
 * Batch size to upload
 */
export const BATCH_SIZE = 100;

/**
 * Timeout to wait for index creation
 */
export const TIMEOUT = 80000;

/**
 * Name of directory with data
 */
export const DATA_DIR = "data";

/**
 * Spec for Pinecone index
 */
export const PINECONE_INDEX_SPEC = {
  Cloud: "aws" as ServerlessSpecCloudEnum,
  Region: "us-east-1,",
};
