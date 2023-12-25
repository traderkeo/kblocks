#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // for HTTP requests

program
  .command('add <component>')
  .description('Add a specific component to your project')
  .action((component) => {
    const componentDir = path.join(process.cwd(), 'components');
    if (!fs.existsSync(componentDir)){
      fs.mkdirSync(componentDir);
    }

    const componentPath = path.join(componentDir, `${component}.tsx`);
    // Example URL structure (modify this based on where your components are hosted)
    const componentUrl = `https://mycomponentsrepo.com/src/components/${component}.tsx`;
    downloadComponent(componentUrl, componentPath);
  });

program.parse(process.argv);

function downloadComponent(url, filePath) {
  axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  })
  .then(function (response) {
    response.data.pipe(fs.createWriteStream(filePath));
  })
  .catch(function (error) {
    console.error('Error downloading the component:', error);
  });
}
