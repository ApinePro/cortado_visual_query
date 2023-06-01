import { environment } from 'src/environments/environment';
import { ElectronService } from './services/electronService/electron.service';

export function electronServiceFactory() {
  // Provide the ElectronService if the environment is Electron
  if (environment.electron) {
    return new ElectronService();
  } else {
    console.log('Cannot provide ElectronService when running in browser.');
    return null;
  }
}
