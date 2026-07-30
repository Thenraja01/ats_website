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
        pipeline = [
            {"$match": {"user_id": user_id}},
            {
                "$group": {
                    "_id": None,
                    "total_analyses": {"$sum": 1},
                    "avg_score": {"$avg": "$ats_score"},
                    "max_score": {"$max": "$ats_score"},
                    "eligible_count": {"$sum": {"$cond": ["$eligible", 1, 0]}},
                    "last_activity": {"$max": "$created_at"},
                }
            },
        ]
        result = await AnalysisResult.aggregate(pipeline).to_list()
        if result:
            r = result[0]
            r["avg_score"] = round(r["avg_score"], 1)
            r["eligible_percentage"] = round(
                (r["eligible_count"] / r["total_analyses"]) * 100, 1
            )
            return r
        return {
            "total_analyses": 0,
            "avg_score": 0,
            "max_score": 0,
            "eligible_count": 0,
            "eligible_percentage": 0,
            "last_activity": None,
        }