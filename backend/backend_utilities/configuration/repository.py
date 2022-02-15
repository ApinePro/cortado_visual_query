import abc
import json
from pathlib import Path
from appdirs import user_config_dir
import os
import errno

CONFIG_FILENAME = 'config.json'
DEFAULT_TIMEOUT = 2
APP_NAME = 'cortado'
COMPANY_NAME = 'Fraunhofer'


class Configuration:
    timeout_cvariant_alignment_computation: int

    def __init__(self, timeout_cvariant_alignment_computation):
        self.timeout_cvariant_alignment_computation = timeout_cvariant_alignment_computation


class ConfigurationRepository(abc.ABC):
    @abc.abstractmethod
    def save_configuration(self, config: Configuration):
        raise NotImplementedError

    @abc.abstractmethod
    def get_configuration(self) -> Configuration:
        raise NotImplementedError


class FileBasedConfigurationRepository(ConfigurationRepository):
    def save_configuration(self, config: Configuration):
        directory = user_config_dir(APP_NAME, COMPANY_NAME)
        filename = os.path.join(directory, CONFIG_FILENAME)
        self.__create_dir_if_not_exists(filename)

        with open(filename, 'w+', encoding='utf-8') as f:
            json.dump(config.__dict__, f, ensure_ascii=False, indent=4)

    def get_configuration(self) -> Configuration:
        directory = user_config_dir(APP_NAME, COMPANY_NAME)
        if not Path(os.path.join(directory, CONFIG_FILENAME)).is_file():
            return Configuration(timeout_cvariant_alignment_computation=DEFAULT_TIMEOUT)

        with open(os.path.join(directory, CONFIG_FILENAME), 'r', encoding='utf-8') as f:
            data = json.load(f, encoding='utf-8')
            return Configuration(timeout_cvariant_alignment_computation=data['timeout_cvariant_alignment_computation'])

    # see https://stackoverflow.com/questions/12517451/automatically-creating-directories-with-file-output
    @staticmethod
    def __create_dir_if_not_exists(filename: str):
        if not os.path.exists(os.path.dirname(filename)):
            try:
                os.makedirs(os.path.dirname(filename))
            except OSError as exc:  # Guard against race condition
                if exc.errno != errno.EEXIST:
                    raise


class ConfigurationRepositoryCacheProxy(ConfigurationRepository):
    def __init__(self, config_repo: ConfigurationRepository):
        self.config_repo = config_repo
        self.cached_config = None

    def save_configuration(self, config: Configuration):
        self.config_repo.save_configuration(config)
        self.cached_config = config

    def get_configuration(self) -> Configuration:
        if self.cached_config is None:
            self.cached_config = self.config_repo.get_configuration()

        return self.cached_config


class ConfigurationRepositoryFactory:
    repo = ConfigurationRepositoryCacheProxy(FileBasedConfigurationRepository())

    @staticmethod
    def get_config_repository() -> ConfigurationRepository:
        return ConfigurationRepositoryFactory.repo
