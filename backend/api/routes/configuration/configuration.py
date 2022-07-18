from backend_utilities.configuration.repository import \
    Configuration as DomainConfiguration
from backend_utilities.configuration.repository import (
    ConfigurationRepository, ConfigurationRepositoryFactory)
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

router = APIRouter(
    tags=["config"],
    prefix="/config"
)

def get_config_repo():
    return ConfigurationRepositoryFactory.get_config_repository()


class Configuration(BaseModel):
    timeout_cvariant_alignment_computation: int = Field(
        alias='timeoutCVariantAlignmentComputation')
    min_traces_variant_detection_mp: int = Field(
        alias="minTracesVariantDetectionMultiprocessing")

    class Config:
        allow_population_by_field_name = True


@router.post("/saveConfiguration")
async def save_configuration(config_dto: Configuration,
                             config_repository: ConfigurationRepository = Depends(get_config_repo)):
    config = DomainConfiguration(
        timeout_cvariant_alignment_computation=config_dto.timeout_cvariant_alignment_computation,
        min_traces_variant_detection_mp=config_dto.min_traces_variant_detection_mp)
    config_repository.save_configuration(config)


@router.get("/getConfiguration")
async def get_configuration(config_repo: ConfigurationRepository = Depends(get_config_repo)):
    config = config_repo.get_configuration()
    config_dto = Configuration(timeout_cvariant_alignment_computation=config.timeout_cvariant_alignment_computation,
                               min_traces_variant_detection_mp=config.min_traces_variant_detection_mp)
    return config_dto
