NOT_FOUND_RESPONSE = {
    404: {
        "description": "Resource not found",
        "content": {"application/json": {"example": {"success": False, "error": "Resource not found", "status_code": 404}}},
    }
}

VALIDATION_RESPONSE = {
    422: {
        "description": "Validation failed",
        "content": {"application/json": {"example": {
            "success": False,
            "error": "Validation failed",
            "details": [{"type": "missing", "loc": ["body", "field_name"], "msg": "Field required", "input": {}}],
            "status_code": 422,
        }}},
    }
}

DB_ERROR_RESPONSE = {
    500: {
        "description": "Database or server error",
        "content": {"application/json": {"example": {"success": False, "error": "Database error occurred", "status_code": 500}}},
    }
}

UNAUTHORIZED_RESPONSE = {
    401: {
        "description": "Unauthorized",
        "content": {"application/json": {"example": {"success": False, "error": "Invalid email or password", "status_code": 401}}},
    }
}

BAD_REQUEST_RESPONSE = {
    400: {
        "description": "Business rule violation",
        "content": {"application/json": {"example": {"success": False, "error": "Payroll for 2026-07 already exists for this employee", "status_code": 400}}},
    }
}