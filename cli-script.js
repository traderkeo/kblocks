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
          console.log('Entry path:', entry.path); // Debug statement
  
          // Check if the entry path includes the component's folder
          if (entry.path.includes(`${componentName}/`)) {
            const relativePath = entry.path.split(`${componentName}/`)[1];
            
            if (relativePath) {
              const fullPath = path.join(extractPath, relativePath);
              if (entry.type === 'Directory') {
                if (!fs.existsSync(fullPath)) {
                  fs.mkdirSync(fullPath, { recursive: true });
                }
                entry.autodrain();
              } else {
                entry.pipe(fs.createWriteStream(fullPath));
              }
            } else {
              console.error('Undefined relative path for:', entry.path);
              entry.autodrain();
            }
          } else {
            entry.autodrain();
          }
        });
    })
    .catch(function (error) {
      console.error('Error downloading the component:', error);
    });
  }
