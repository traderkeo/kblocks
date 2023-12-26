#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const unzipper = require('unzipper');

program
  .command('add <component>')
  .description('Add a specific component to your project')
  .action((component) => {
    const componentDir = path.join(process.cwd(), 'components');
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }

    const componentZipUrl = `https://github.com/traderkeo/kblocks/archive/refs/heads/master.zip`;
    const componentFolderPath = path.join(componentDir, component);
    
    if (!fs.existsSync(componentFolderPath)) {
      fs.mkdirSync(componentFolderPath, { recursive: true });
    }

    downloadAndExtractComponent(componentZipUrl, componentFolderPath, component);
  });

program.parse(process.argv);

function downloadAndExtractComponent(url, extractPath, componentName) {
  axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  })
  .then(function (response) {
    response.data
      .pipe(unzipper.Parse())
      .on('entry', function (entry) {
        const fullPath = path.join(extractPath, entry.path.split(`${componentName}/`)[1]);
        if (entry.type === 'Directory') {
          if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
          }
          entry.autodrain();
        } else {
          // Ensure the directory exists before writing the file
          const directory = path.dirname(fullPath);
          if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
          }
          entry.pipe(fs.createWriteStream(fullPath));
        }
      });
  })
  .catch(function (error) {
    console.error('Error downloading the component:', error);
  });
}
