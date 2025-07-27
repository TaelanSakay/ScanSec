import os
import json
import logging
from typing import Optional, Dict, Any
import httpx
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class AIRecommendationService:
    def __init__(self):
        self.api_key = os.getenv("CLAUDE_API_KEY")
        self.api_url = "https://api.anthropic.com/v1/messages"
        self.model = "claude-3-5-sonnet-20241022"
        
    def is_available(self) -> bool:
        """Check if Claude API is available (API key is set)."""
        return bool(self.api_key)
    
    async def get_fix_recommendation(
        self, 
        vulnerability_type: str,
        severity: str,
        file_path: str,
        line_number: int,
        code_snippet: str,
        description: str,
        language: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get AI-powered fix recommendation for a vulnerability.
        
        Args:
            vulnerability_type: Type of vulnerability (e.g., "SQL Injection")
            severity: Severity level (critical, high, medium, low)
            file_path: Path to the vulnerable file
            line_number: Line number where vulnerability occurs
            code_snippet: The vulnerable code snippet
            description: Description of the vulnerability
            language: Programming language
            
        Returns:
            Dictionary containing AI recommendation or None if API is not available
        """
        if not self.is_available():
            logger.warning("Claude API key not configured")
            return None
            
        try:
            prompt = self._build_prompt(
                vulnerability_type, severity, file_path, line_number,
                code_snippet, description, language
            )
            
            response = await self._call_claude_api(prompt)
            
            if response:
                return {
                    "recommendation": response.get("recommendation", ""),
                    "fixed_code": response.get("fixed_code", ""),
                    "explanation": response.get("explanation", ""),
                    "best_practices": response.get("best_practices", []),
                    "ai_generated": True
                }
            
        except Exception as e:
            logger.error(f"Error getting AI recommendation: {e}")
            return None
    
    def _build_prompt(
        self,
        vulnerability_type: str,
        severity: str,
        file_path: str,
        line_number: int,
        code_snippet: str,
        description: str,
        language: str
    ) -> str:
        """Build the prompt for Claude API."""
        
        prompt = f"""You are a cybersecurity expert and senior software developer. Analyze the following vulnerability and provide a detailed fix recommendation.

VULNERABILITY DETAILS:
- Type: {vulnerability_type}
- Severity: {severity.upper()}
- File: {file_path}
- Line: {line_number}
- Language: {language}
- Description: {description}

VULNERABLE CODE:
```{language}
{code_snippet}
```

Please provide a comprehensive fix recommendation in the following JSON format:
{{
    "recommendation": "A clear, actionable recommendation for fixing this vulnerability",
    "fixed_code": "The corrected code snippet that fixes the vulnerability",
    "explanation": "Detailed explanation of why this fix works and what it prevents",
    "best_practices": [
        "Best practice 1 for preventing this type of vulnerability",
        "Best practice 2 for secure coding in this language",
        "Best practice 3 for input validation and sanitization"
    ]
}}

Focus on:
1. Security best practices for {language}
2. Input validation and sanitization
3. Proper error handling
4. Code maintainability
5. Performance considerations

Provide only valid JSON in your response."""

        return prompt
    
    async def _call_claude_api(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Call Claude API and parse the response."""
        
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01"
        }
        
        data = {
            "model": self.model,
            "max_tokens": 2000,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.api_url, headers=headers, json=data)
                
                if response.status_code == 200:
                    result = response.json()
                    content = result.get("content", [])
                    
                    if content and len(content) > 0:
                        message_content = content[0].get("text", "")
                        
                        # Try to parse JSON from the response
                        try:
                            # Find JSON in the response (Claude might add extra text)
                            start_idx = message_content.find("{")
                            end_idx = message_content.rfind("}") + 1
                            
                            if start_idx != -1 and end_idx > start_idx:
                                json_str = message_content[start_idx:end_idx]
                                return json.loads(json_str)
                            else:
                                logger.error("No JSON found in Claude response")
                                return None
                                
                        except json.JSONDecodeError as e:
                            logger.error(f"Failed to parse JSON from Claude response: {e}")
                            logger.error(f"Raw response: {message_content}")
                            return None
                else:
                    logger.error(f"Claude API error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error calling Claude API: {e}")
            return None

# Global instance
ai_service = AIRecommendationService() 