 // Optional, in case you are using environment variables
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Function to load the configuration JSON file before app initialization
function loadConfig(): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', 'assets/config.json', true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const config = JSON.parse(xhr.responseText);
        (window as any).appConfig = config; // Store config in a global variable
        resolve(config);
      } else if (xhr.readyState === 4) {
        reject('Failed to load config');
      }
    };
    xhr.send(null);
  });
}

// Load the configuration before starting the app
loadConfig()
  .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
  .catch(err => console.error(err));
