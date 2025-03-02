import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Vector } from "./types";
import { nanoid } from "nanoid";
import env from "./env";
import { Pinecone } from "@pinecone-database/pinecone";
import {
  BATCH_SIZE,
  DATA_DIR,
  PINECONE_INDEX,
  PINECONE_INDEX_SPEC,
  TIMEOUT,
  VECTOR_DIMENSION,
} from "./consts";

/**
 * Gets data directory path
 */
export function getDataDir() {
  const currentDir = __dirname;
  const dirs = currentDir.split("/");

  dirs.pop(); // Removes dist from end
  dirs.push(DATA_DIR);

  return dirs.join("/");
}

/**
 * Gets id
 * @returns {string} Returns a unique id
 */
export function getID() {
  return nanoid();
}

/**
 * Converts document to vector embeddings
 * @param {Document<Record<string, any>>} documents
 * @returns {Vector[]} Vector embeddings of documents
 */
export async function convertDocumentToEmbeddings(
  documents: Document<Record<string, any>>[],
) {
  try {
    const allEmbeddings = [];
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });

    for (const document of documents) {
      const text = document.pageContent;
      const chunks = await textSplitter.createDocuments([text]);

      const embeddings = await new OpenAIEmbeddings({
        apiKey: env.OPENAI_API_KEY,
      }).embedDocuments(
        chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " ")),
      );

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        const vector: Vector = {
          id: getID(),
          values: embeddings[i],
          metadata: {
            ...chunk.metadata,
            loc: JSON.stringify(chunk.metadata.loc),
            pageContent: chunk.pageContent,
          },
        };

        allEmbeddings.push(vector);
      }
    }

    return allEmbeddings;
  } catch (err) {
    throw err;
  }
}

/**
 * Creates index on Pinecone
 * @returns {Pinecone} Pinecone client
 */
export async function createPineconeIndex() {
  try {
    const pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY });
    const existingIndices = await pinecone.listIndexes();

    if (!existingIndices.indexes) throw new Error("Indexes is not defined");

    const existingIndicesNames = existingIndices.indexes.map(
      (index) => index.name,
    );

    if (existingIndicesNames.includes(PINECONE_INDEX)) {
      console.log(`The index name - ${PINECONE_INDEX} already exists...`);
      return pinecone;
    }

    await pinecone.createIndex({
      name: PINECONE_INDEX,
      dimension: VECTOR_DIMENSION,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: PINECONE_INDEX_SPEC.Cloud,
          region: PINECONE_INDEX_SPEC.Region,
        },
      },
    });

    console.log(
      `Creating ${PINECONE_INDEX}... please wait for it to finish initializing.`,
    );

    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));

    return pinecone;
  } catch (err) {
    throw err;
  }
}

/**
 * Uploads vector embeddings to Pinecone in batches
 * @param {Pinecone} client - Pinecone client instance
 * @param {Vector[]} embeddings - Array of vector embeddings to upload
 * @param {number} batchSize - Size of each upload batch (default - BATCH_SIZE from consts)
 */
export async function uploadToPinecone(
  client: Pinecone,
  embeddings: Vector[],
  batchSize: number = BATCH_SIZE,
) {
  try {
    const totalVectors = embeddings.length;
    const totalBatches = Math.ceil(totalVectors / batchSize);
    let batch: Vector[] = [];
    let uploadedCount = 0;
    let currentBatch = 1;

    console.log(`Starting Pinecone upload process...`);
    console.log(`Total vectors: ${totalVectors}`);
    console.log(`Batch size: ${batchSize}`);
    console.log(`Expected batches: ${totalBatches}`);

    const index = client.index(PINECONE_INDEX);

    for (let i = 0; i < embeddings.length; i++) {
      batch.push(embeddings[i]);
      if (batch.length === batchSize || i === embeddings.length - 1) {
        console.log(
          `Uploading batch ${currentBatch}/${totalBatches} (${batch.length} vectors)...`,
        );
        const batchStartTime = Date.now();
        await index.upsert(batch);
        console.log("Uploaded batch to Pinecone...");
        const batchEndTime = Date.now();
        uploadedCount += batch.length;
        const percentComplete = ((uploadedCount / totalVectors) * 100).toFixed(
          2,
        );
        const batchDuration = ((batchEndTime - batchStartTime) / 1000).toFixed(
          2,
        );

        console.log(
          `✓ Batch ${currentBatch}/${totalBatches} complete in ${batchDuration}s`,
        );
        console.log(
          `Progress: ${uploadedCount}/${totalVectors} vectors (${percentComplete}%)`,
        );

        batch = [];
        currentBatch++;
      }
    }

    console.log(
      `✅ Upload complete! ${uploadedCount} vectors uploaded to Pinecone.`,
    );
  } catch (err) {
    throw err;
  }
}
