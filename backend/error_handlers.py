import traceback

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


def get_trace(e):
    return "".join(traceback.format_exception(etype=type(e), value=e, tb=e.__traceback__))


def build_json_error_rsp(detail, stack_trace, status_code):
    return JSONResponse({"detail": detail, "stack_trace": stack_trace}, status_code=status_code)


async def http_exception_handler(request: Request, exc: HTTPException):
    return build_json_error_rsp(exc.detail, get_trace(exc), exc.status_code)


async def exception_handler(request: Request, exc: Exception):
    return build_json_error_rsp(str(exc), get_trace(exc), 500)


async def validation_exception_handler(request, exc: RequestValidationError):
    return build_json_error_rsp(exc.errors(), get_trace(exc), status_code=422)
