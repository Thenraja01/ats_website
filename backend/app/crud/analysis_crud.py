"""CRUD operations for AnalysisResult."""

from typing import List, Optional, Dict, Any
from app.models.analysis_model import AnalysisResult
from bson import ObjectId


class AnalysisCRUD:
    @staticmethod
    async def create(analysis: AnalysisResult) -> AnalysisResult:
        await analysis.insert()
        return analysis

    @staticmethod
    async def get_by_id(analysis_id: str) -> Optional[AnalysisResult]:
        try:
            return await AnalysisResult.get(ObjectId(analysis_id))
        except Exception:
            return None

    @staticmethod
    async def get_by_user(
        user_id: str, skip: int = 0, limit: int = 20
    ) -> List[AnalysisResult]:
        return (
            await AnalysisResult.find(AnalysisResult.user_id == user_id)
            .sort(-AnalysisResult.created_at)
            .skip(skip)
            .limit(limit)
            .to_list()
        )

    @staticmethod
    async def get_by_ip(
        ip_address: str, skip: int = 0, limit: int = 20
    ) -> List[AnalysisResult]:
        return (
            await AnalysisResult.find(AnalysisResult.ip_address == ip_address)
            .sort(-AnalysisResult.created_at)
            .skip(skip)
            .limit(limit)
            .to_list()
        )

    @staticmethod
    async def get_user_stats(user_id: str) -> Dict[str, Any]:
        results = await AnalysisResult.find(AnalysisResult.user_id == user_id).to_list()
        if results:
            total = len(results)
            scores = [r.ats_score for r in results if r.ats_score is not None]
            avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
            max_score = max(scores) if scores else 0
            eligible_count = sum(1 for r in results if r.eligible)
            eligible_percentage = round((eligible_count / total) * 100, 1) if total > 0 else 0.0
            last_activity = max(r.created_at for r in results if r.created_at) if results else None
            return {
                "total_analyses": total,
                "avg_score": avg_score,
                "max_score": max_score,
                "eligible_count": eligible_count,
                "eligible_percentage": eligible_percentage,
                "last_activity": last_activity,
            }
        return {
            "total_analyses": 0,
            "avg_score": 0,
            "max_score": 0,
            "eligible_count": 0,
            "eligible_percentage": 0,
            "last_activity": None,
        }