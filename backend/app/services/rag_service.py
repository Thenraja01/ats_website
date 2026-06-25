"""RAG (Retrieval-Augmented Generation) service.

Handles CSV data ingestion into ChromaDB and RAG-based querying.
"""

from langchain_community.document_loaders.csv_loader import CSVLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


def get_embeddings():
    """Get Google Generative AI embeddings model."""
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001", google_api_key=settings.GOOGLE_API_KEY
    )


def ingest_csv_data(file_path: str) -> int:
    """Ingest CSV file into ChromaDB vector store. Returns number of chunks."""
    loader = CSVLoader(file_path=file_path)
    docs = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, chunk_overlap=200
    )
    splits = text_splitter.split_documents(docs)

    embeddings = get_embeddings()
    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=embeddings,
        persist_directory=settings.CHROMA_PERSIST_DIRECTORY,
    )

    logger.info(f"Ingested {len(splits)} chunks from {file_path}")
    return len(splits)


def query_rag(query: str, top_k: int = 5) -> dict:
    """Query the RAG pipeline. Returns answer and source documents."""
    embeddings = get_embeddings()
    vectorstore = Chroma(
        persist_directory=settings.CHROMA_PERSIST_DIRECTORY,
        embedding_function=embeddings,
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": top_k})

    docs = retriever.invoke(query)
    context = "\n\n".join([doc.page_content for doc in docs])

    llm = ChatGroq(
        model_name="llama-3.3-70b-versatile", api_key=settings.GROQ_API_KEY
    )
    prompt = PromptTemplate.from_template(
        "You are an AI assistant for an Applicant Tracking System.\n"
        "Use the following context to answer the question.\n\n"
        "Context: {context}\n\n"
        "Question: {question}\n\n"
        "Answer:"
    )

    chain = prompt | llm | StrOutputParser()
    answer = chain.invoke({"context": context, "question": query})

    logger.info(f"RAG query completed: {query[:50]}...")
    return {
        "answer": answer,
        "sources": [doc.metadata.get("source", "Unknown") for doc in docs],
    }
