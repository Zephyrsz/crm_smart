from typing import Literal

from pydantic import BaseModel


class MappingRow(BaseModel):
    source_column: str
    sample_value: str
    target_field: str
    confidence: str
    mapped: bool


class ValidationIssue(BaseModel):
    label: str
    detail: str
    count: int
    action: str
    severity: Literal["error", "warning", "info"]


class ImportValidationSummary(BaseModel):
    total_rows: int
    ready_to_import: int
    need_attention: int
    issues: list[ValidationIssue]


class VerificationStage(BaseModel):
    name: str
    passed: int
    failed: int


class VerificationBucket(BaseModel):
    label: str
    count: int
    pct: int
    status: str


class ImportVerificationSummary(BaseModel):
    stages: list[VerificationStage]
    buckets: list[VerificationBucket]
    send_eligible: int
    suppressed: int


class ImportPreview(BaseModel):
    source_file: str
    file_size: str
    total_rows: int
    detected_columns: list[str]
    mapped_count: int
    mapping_rows: list[MappingRow]
    validation: ImportValidationSummary
    verification: ImportVerificationSummary
