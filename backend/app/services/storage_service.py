"""MinIO / S3 Object Storage Service for HireMind AI."""

import boto3
from botocore.exceptions import ClientError
from typing import Optional
from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


def get_s3_client():
    """Create and return a boto3 S3 client configured for MinIO."""
    endpoint = settings.MINIO_ENDPOINT
    if not endpoint.startswith("http://") and not endpoint.startswith("https://"):
        protocol = "https://" if settings.MINIO_SECURE else "http://"
        endpoint = f"{protocol}{endpoint}"

    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        region_name="us-east-1",
    )


def ensure_bucket_exists(bucket_name: Optional[str] = None) -> bool:
    """Ensure the target MinIO bucket exists; create it if not."""
    bucket = bucket_name or settings.MINIO_BUCKET
    s3 = get_s3_client()
    try:
        s3.head_bucket(Bucket=bucket)
        return True
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code")
        if error_code in ("404", "NoSuchBucket"):
            try:
                s3.create_bucket(Bucket=bucket)
                logger.info(f"Created MinIO bucket: {bucket}")
                return True
            except Exception as create_err:
                logger.error(f"Failed to create bucket {bucket}: {create_err}")
                return False
        logger.error(f"head_bucket error on {bucket}: {e}")
        return False
    except Exception as e:
        logger.error(f"MinIO connection error on {bucket}: {e}")
        return False


def upload_file_bytes(
    file_bytes: bytes,
    object_key: str,
    content_type: str = "application/octet-stream",
    bucket_name: Optional[str] = None,
) -> str:
    """Upload raw bytes to MinIO and return the object key."""
    bucket = bucket_name or settings.MINIO_BUCKET
    s3 = get_s3_client()
    ensure_bucket_exists(bucket)

    s3.put_object(
        Bucket=bucket,
        Key=object_key,
        Body=file_bytes,
        ContentType=content_type,
    )
    logger.info(f"Uploaded {len(file_bytes)} bytes to MinIO s3://{bucket}/{object_key}")
    return object_key


def get_presigned_download_url(
    object_key: str,
    expires_in: int = 3600,
    bucket_name: Optional[str] = None,
) -> str:
    """Generate a presigned GET URL for downloading the file."""
    bucket = bucket_name or settings.MINIO_BUCKET
    s3 = get_s3_client()
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": object_key},
        ExpiresIn=expires_in,
    )


def delete_file(object_key: str, bucket_name: Optional[str] = None) -> bool:
    """Delete an object from MinIO."""
    bucket = bucket_name or settings.MINIO_BUCKET
    s3 = get_s3_client()
    try:
        s3.delete_object(Bucket=bucket, Key=object_key)
        logger.info(f"Deleted MinIO object s3://{bucket}/{object_key}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete s3://{bucket}/{object_key}: {e}")
        return False
