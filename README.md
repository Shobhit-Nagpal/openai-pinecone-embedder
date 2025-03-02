# OpenAI-Pinecone-Embedder

A utility for processing documents, generating embeddings, and storing them in Pinecone for vector search and retrieval.

## Overview

The repository provides a streamlined pipeline for:

1. Loading documents from a directory
2. Splitting text into manageable chunks
3. Creating vector embeddings using OpenAI
4. Uploading these embeddings to Pinecone's vector database

This makes it easy to create searchable knowledge bases and power semantic search or retrieval-augmented generation (RAG) applications.

## Prerequisites

- Node.js (v14 or later)
- OpenAI API key
- Pinecone API key
- Pinecone account with permissions to create indices

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/Shobhit-Nagpal/openai-pinecone-embedder.git
   cd openai-pinecone-embedder
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_INDEX=your_pinecone_index_here
   ```

4. Create a `data` directory at the root of the project:

   ```bash
   mkdir data
   ```

5. Add your markdown files to the data directory:

   ```bash
   # Example: Copy markdown files from another location
   cp path/to/your/markdown/files/*.md ./data/

   # Or create a sample markdown file
   echo "# Sample Document\n\nThis is a test document for vector embedding." > ./data/sample.md
   ```

## Configuration

Configure the application by modifying the constants in `consts.ts`:

```typescript
// Example configuration settings
export const DATA_DIR = "data";
export const VECTOR_DIMENSION = 1536; // For OpenAI embeddings
export const BATCH_SIZE = 100;
export const TIMEOUT = 60000; // 60 seconds
export const PINECONE_INDEX_SPEC = {
  Cloud: "aws", // or "gcp" or "azure"
  Region: "us-east-1", // your preferred region
};
```

## Usage

Execute the build process before you run the application. Run the application to process your documents and upload them to Pinecone:

```bash
npm start
```

The application will:

1. Load all `.md` files from the `data` directory
2. Create a Pinecone index if it doesn't exist
3. Convert the documents into vector embeddings
4. Upload the embeddings to Pinecone in batches

## Detailed Process

1. **Document Loading**: The `DirectoryLoader` reads all markdown files from the data directory.

2. **Index Creation**: If the specified Pinecone index doesn't exist, it creates one with the configured settings.

3. **Text Processing**: Each document is split into chunks using the `RecursiveCharacterTextSplitter` with a chunk size of 1000 characters.

4. **Embedding Generation**: OpenAI's embedding model creates vector representations for each text chunk.

5. **Batch Uploading**: Vectors are uploaded to Pinecone in batches, with detailed progress logging.

## Customization

### Supporting Additional File Types

To support file types beyond markdown, modify the `DirectoryLoader` configuration in `main.ts`:

```typescript
const loader = new DirectoryLoader(dataDir, {
  ".md": (path) => new TextLoader(path),
  ".txt": (path) => new TextLoader(path),
  // Add other file types as needed
});
```

### Adjusting Chunk Size

Change the chunk size by modifying the `RecursiveCharacterTextSplitter` configuration in `utils.ts`:

```typescript
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000, // Change this value as needed
});
```

## Troubleshooting

- **Timeout Errors**: If you encounter timeout errors during index creation, increase the `TIMEOUT` constant in `consts.ts`.
- **Rate Limiting**: If you hit OpenAI rate limits, consider implementing a delay between embedding requests.
- **Memory Issues**: For very large document collections, consider processing files in smaller batches.
