import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import {
  convertDocumentToEmbeddings,
  createPineconeIndex,
  getDataDir,
  uploadToPinecone,
} from "./utils";

async function main() {
  try {
    const dataDir = getDataDir();

    const loader = new DirectoryLoader(dataDir, {
      ".md": (path) => new TextLoader(path),
      ".txt": (path) => new TextLoader(path),
    });

    const docs = await loader.load();

    const vDB = await createPineconeIndex();

    if (!vDB) throw new Error("DB Client is undefined");

    const chunks = await convertDocumentToEmbeddings(docs);

    await uploadToPinecone(vDB, chunks);
  } catch (err) {
    console.error(err);
  }
}

main();
