import os
from typing import List
from langchain_community.document_loaders.csv_loader import CSVLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings

def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001", google_api_key=settings.GOOGLE_API_KEY
    )

def ingest_csv_data(file_path: str):
    # Load CSV
    loader = CSVLoader(file_path=file_path)
    docs = loader.load()

    # Chunking
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    splits = text_splitter.split_documents(docs)

    # Ingest
    embeddings = get_embeddings()
    persist_directory = settings.CHROMA_PERSIST_DIRECTORY
    
    vectorstore = Chroma.from_documents(
        documents=splits, 
        embedding=embeddings, 
        persist_directory=persist_directory
    )
    return len(splits)

def query_rag(query: str, top_k: int = 5):
    embeddings = get_embeddings()
    persist_directory = settings.CHROMA_PERSIST_DIRECTORY
    vectorstore = Chroma(persist_directory=persist_directory, embedding_function=embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": top_k})

    # Retrieve docs
    docs = retriever.invoke(query)
    context = "\n\n".join([doc.page_content for doc in docs])

    # LLM Generate
    llm = ChatGroq(model_name="llama-3.3-70b-versatile", api_key=settings.GROQ_API_KEY)
    prompt = PromptTemplate.from_template(
        "You are an AI assistant for an Applicant Tracking System.\n"
        "Use the following context to answer the question.\n\n"
        "Context: {context}\n\n"
        "Question: {question}\n\n"
        "Answer:"
    )
    
    chain = prompt | llm | StrOutputParser()
    answer = chain.invoke({"context": context, "question": query})
    
    return {
        "answer": answer,
        "sources": [doc.metadata.get("source", "Unknown") for doc in docs]
    }
