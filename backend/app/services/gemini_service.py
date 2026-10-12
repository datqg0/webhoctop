import logging
from typing import List

import httpx
from google import genai
from google.genai import types

from app.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.groq_api_key = settings.GROQ_API_KEY
        self.groq_model = settings.GROQ_MODEL
        self.is_configured = False
        self.groq_is_configured = bool(self.groq_api_key and self.groq_api_key.strip())
        self.client = None
        if self.api_key and self.api_key.strip():
            try:
                self.client = genai.Client(api_key=self.api_key)
                self.is_configured = True
                logger.info("Gemini API client initialized.")
            except Exception as e:
                logger.warning("Failed to configure Gemini API: %s", e)

    def get_embedding(self, text: str, task_type: str = "retrieval_document") -> List[float]:
        """Embed text using Gemini. Groq is used for text generation only."""
        if not self.is_configured:
            return []

        try:
            model_name = settings.EMBEDDING_MODEL.removeprefix("models/")
            result = self.client.models.embed_content(
                model=model_name,
                contents=text,
                config=types.EmbedContentConfig(task_type=task_type.upper()),
            )
            if not result.embeddings:
                return []
            return list(result.embeddings[0].values or [])
        except Exception as e:
            logger.error("Error calling Gemini embedding model %s: %s", settings.EMBEDDING_MODEL, e)
            return []

    def generate_explanation(self, system_instruction: str, user_prompt: str) -> str:
        """Use Gemini first and fall back to Groq when Gemini is missing or unavailable."""
        if self.is_configured:
            try:
                response = self.client.models.generate_content(
                    model=settings.LLM_MODEL,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.2,
                        top_p=0.95,
                        max_output_tokens=2048,
                    ),
                )
                if response and response.text and response.text.strip():
                    return response.text
            except Exception as e:
                logger.warning("Gemini model request failed (%s): %s", settings.LLM_MODEL, e)

        if self.groq_is_configured:
            try:
                response = httpx.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.groq_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.groq_model,
                        "messages": [
                            {"role": "system", "content": system_instruction},
                            {"role": "user", "content": user_prompt},
                        ],
                        "temperature": 0.2,
                        "max_completion_tokens": 2048,
                    },
                    timeout=45.0,
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
                if isinstance(content, str) and content.strip():
                    return content.strip()
                logger.warning("Groq returned an empty completion (%s).", self.groq_model)
            except httpx.HTTPStatusError as e:
                logger.error("Groq model request failed with HTTP %s.", e.response.status_code)
            except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as e:
                logger.error("Groq model request failed (%s): %s", self.groq_model, e)

        return (
            "Chưa thể tạo lời giải AI lúc này. "
            "Hãy kiểm tra cấu hình GEMINI_API_KEY hoặc GROQ_API_KEY rồi thử lại. "
            "Hiện không có lời giải dự phòng nào được tạo."
        )


gemini_service = GeminiService()
