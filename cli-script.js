#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const unzipper = require('unzipper'); // npm package to extract ZIP files

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
        const fileName = entry.path;
        const isDesiredFile = fileName.includes(`${componentName}/`); // Filter files specific to the component
        if (isDesiredFile) {
          const outputPath = path.join(extractPath, fileName.split(`${componentName}/`)[1]);
          entry.pipe(fs.createWriteStream(outputPath));
        } else {
          entry.autodrain();
        }
      });
  })
  .catch(function (error) {
    console.error('Error downloading the component:', error);
  });
}
